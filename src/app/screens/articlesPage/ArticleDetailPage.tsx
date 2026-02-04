import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Calendar, Eye, Heart, Newspaper, Share2, User } from "lucide-react";

import { useGetArticleByIdQuery } from "../../services/articlesApi";
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
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
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

  const cover = uploadUrlFromFilename("community", data?.boardImage);
  const authorName = data?.memberData?.memberNick || "Community member";
  const authorAvatar = memberImageUrlFromFilename(
    data?.memberData?.memberImage,
    authorName,
  );

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

          <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
            <p className="whitespace-pre-line leading-7 text-foreground">
              {data.boardContent}
            </p>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <ArticleComments articleId={articleId} />
    </div>
  );
}
