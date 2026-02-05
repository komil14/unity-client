import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Calendar,
  Eye,
  Heart,
  Newspaper,
  Share2,
  User,
  Edit3,
  Trash2,
  Loader,
} from "lucide-react";

import {
  useGetArticleByIdQuery,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
} from "../../services/articlesApi";
import { useCheckAuthQuery } from "../../services/authApi";
import {
  useCheckLikesBatchQuery,
  useToggleLikeMutation,
} from "../../services/likesApi";
import { useScrollToTop } from "../../hooks/useScrollToTop";
import {
  formatDate,
  memberImageUrlFromFilename,
  uploadUrlFromFilename,
} from "../../../libs/shared/ui";
import { useToast } from "../../../libs/components/ui/toast";
import { AlertDialog } from "../../../libs/components/ui/alert-dialog";
import ArticleComments from "./ArticleComments";

export default function ArticleDetailPage() {
  useScrollToTop();
  const { id } = useParams();
  const articleId = id ?? "";
  const navigate = useNavigate();
  const { data: authData } = useCheckAuthQuery();
  const isAuthenticated = Boolean(authData?.member?._id);
  const { showToast } = useToast();

  const [toggleLike] = useToggleLikeMutation();
  const [updateArticle, updateState] = useUpdateArticleMutation();
  const [deleteArticle, deleteState] = useDeleteArticleMutation();
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { data, isLoading, isError } = useGetArticleByIdQuery(articleId, {
    skip: !articleId,
  });

  const { data: likeData } = useCheckLikesBatchQuery(
    { likeRefIds: [articleId], likeGroup: "ARTICLE" },
    { skip: !articleId || !isAuthenticated },
  );

  useEffect(() => {
    if (data?.boardLikes !== undefined) {
      setLikesCount(data.boardLikes);
    }
  }, [data?.boardLikes]);

  useEffect(() => {
    if (likeData) {
      setIsLiked(likeData.likedRefIds.includes(articleId));
    } else if (!isAuthenticated) {
      setIsLiked(false);
    }
  }, [likeData, articleId, isAuthenticated]);

  const handleLike = async () => {
    if (!articleId) return;

    if (!isAuthenticated) {
      showToast("Please log in to like articles.", "error");
      navigate("/login");
      return;
    }

    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount((prev) => (wasLiked ? Math.max(0, prev - 1) : prev + 1));

    try {
      const res = await toggleLike({
        likeRefId: articleId,
        likeGroup: "ARTICLE",
      }).unwrap();

      const confirmed = res.status === "liked";
      setIsLiked(confirmed);
      showToast(
        confirmed
          ? "Article added to your favorites!"
          : "Article removed from your favorites!",
      );
    } catch (err: any) {
      setIsLiked(wasLiked);
      setLikesCount((prev) =>
        wasLiked ? Math.max(0, prev + 1) : Math.max(0, prev - 1),
      );

      const status = err?.status;
      if (status === 401 || status === 403) {
        navigate("/login");
      } else {
        showToast("Failed to update like. Please try again.", "error");
      }
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/articles/${articleId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: data?.boardTitle || "Article",
          url,
        });
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        showToast("Article link copied to clipboard!");
      }
    } catch {
      // Silent fail - user cancelled or not supported
    }
  };

  const handleEditClick = () => {
    if (!data) return;
    setEditTitle(data.boardTitle);
    setEditContent(data.boardContent);
    setEditImagePreview(cover || null);
    setIsEditing(true);
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be less than 5MB", "error");
      return;
    }

    setEditImage(file);
    setEditImagePreview(URL.createObjectURL(file));
  };

  const handleEditSubmit = async () => {
    const trimmedTitle = editTitle.trim();
    const trimmedContent = editContent.trim();

    if (!trimmedTitle || !trimmedContent) {
      showToast("Title and content are required", "error");
      return;
    }

    try {
      await updateArticle({
        id: articleId,
        data: {
          boardTitle: trimmedTitle,
          boardContent: trimmedContent,
          boardImage: editImage || undefined,
        },
      }).unwrap();

      showToast("Article updated successfully!");
      setIsEditing(false);
      setEditImage(null);
      setEditImagePreview(null);
    } catch (err: any) {
      const msg = err?.data?.message || "Failed to update article";
      showToast(msg, "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteArticle(articleId).unwrap();
      showToast("Article deleted successfully!");
      navigate("/articles");
    } catch (err: any) {
      const msg = err?.data?.message || "Failed to delete article";
      showToast(msg, "error");
      setShowDeleteDialog(false);
    }
  };

  const cover = uploadUrlFromFilename("community", data?.boardImage);
  const authorName = data?.memberData?.memberNick || "Community member";
  const authorAvatar = memberImageUrlFromFilename(
    data?.memberData?.memberImage,
    authorName,
  );
  const isOwner = authData?.member?._id === data?.memberId;

  if (!articleId) {
    return <div className="text-muted-foreground">Invalid article id.</div>;
  }

  if (isLoading) {
    return <div className="text-muted-foreground">Loading article…</div>;
  }

  if (isError || !data) {
    return <div className="text-destructive">Failed to load article.</div>;
  }

  return (
    <div className="space-y-6">
      <Link
        to="/articles"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
      >
        ← Back to Articles
      </Link>

      <div className="rounded-[var(--radius-lg)] border border-border bg-card/30 overflow-hidden">
        <div className="relative w-full aspect-[16/7] bg-muted">
          {cover ? (
            <img
              src={cover}
              alt={data.boardTitle}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Newspaper className="h-10 w-10" />
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(data.createdAt)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {data.boardTitle}
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="h-10 w-10 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="h-10 w-10 rounded-full border border-border bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {authorName}
                </div>
                <div className="text-xs text-muted-foreground">
                  Community Contributor
                </div>
              </div>
            </div>
            {isOwner && !isEditing && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEditClick}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                  title="Edit article"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={deleteState.isLoading}
                  className="inline-flex items-center gap-2 rounded-lg border border-destructive bg-background px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete article"
                >
                  {deleteState.isLoading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Interactive Action Bar */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              {/* View Count */}
              <div className="inline-flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-semibold text-foreground">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span>{data.boardViews ?? 0}</span>
              </div>

              {/* Like Button */}
              <button
                type="button"
                onClick={handleLike}
                disabled={!isAuthenticated}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  isLiked
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
                aria-label={
                  isLiked
                    ? `Remove from favorites (${likesCount} likes)`
                    : `Add to favorites (${likesCount} likes)`
                }
                aria-pressed={isLiked}
                title={
                  !isAuthenticated
                    ? "Login to like this article"
                    : isLiked
                      ? "Unlike this article"
                      : "Like this article"
                }
              >
                <Heart
                  className={`h-4 w-4 transition-all ${isLiked ? "fill-current" : ""}`}
                />
                <span>{likesCount}</span>
              </button>

              {/* Share Button */}
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Share this article"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-6">
              <h3 className="text-lg font-bold text-foreground">
                Edit Article
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    maxLength={200}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Content
                  </label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={10}
                    maxLength={5000}
                    className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Cover Image (Optional)
                  </label>
                  {editImagePreview && (
                    <div className="mb-3 relative aspect-video w-full max-w-md rounded-lg overflow-hidden border border-border">
                      <img
                        src={editImagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="block w-full text-sm text-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/90"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Max size: 5MB
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleEditSubmit}
                    disabled={updateState.isLoading}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {updateState.isLoading ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditImage(null);
                      setEditImagePreview(null);
                    }}
                    disabled={updateState.isLoading}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
              <p className="whitespace-pre-line leading-7 text-foreground">
                {data.boardContent}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <ArticleComments articleId={articleId} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete this article?"
        description="This will permanently remove your article. You can't undo this action."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
