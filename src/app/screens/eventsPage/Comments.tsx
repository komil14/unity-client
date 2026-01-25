import { useState, useRef, useEffect } from "react";
import { Send, Trash2, MessageSquare, Loader, Edit3 } from "lucide-react";
import {
  useGetCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  type CommentDto,
} from "../../services/commentsApi";
import { useCheckAuthQuery } from "../../services/authApi";
import { useToast } from "../../../libs/components/ui/toast";
import { uploadUrlFromFilename } from "../../../libs/shared/ui";
import { AlertDialog } from "../../../libs/components/ui/alert-dialog";

interface CommentsProps {
  eventId: string;
  eventTitle?: string;
}

function formatCommentDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export default function Comments({ eventId, eventTitle }: CommentsProps) {
  const { showToast } = useToast();
  const { data: authData } = useCheckAuthQuery();
  const isAuthenticated = Boolean(authData?.member?._id);
  const currentUserId = authData?.member?._id;

  const [commentText, setCommentText] = useState("");
  const [commentList, setCommentList] = useState<CommentDto[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<CommentDto | null>(null);
  const [page, setPage] = useState(1);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch comments for this event
  const { data, isLoading, isError, isFetching } = useGetCommentsQuery({
    eventId,
    page,
    limit: 4,
  });

  // Create comment mutation
  const [createComment, createState] = useCreateCommentMutation();
  const [updateComment, updateState] = useUpdateCommentMutation();
  const [deleteComment, deleteState] = useDeleteCommentMutation();

  useEffect(() => {
    setPage(1);
    setCommentList([]);
    setHasMore(false);
    setTotalCount(0);
    setEditingId(null);
    setEditText("");
  }, [eventId]);

  useEffect(() => {
    if (!data) return;

    setHasMore(data.hasMore);
    setTotalCount(data.total);

    setCommentList((prev) => {
      if (page === 1) return data.data;

      const existing = new Set(prev.map((c) => c._id));
      const merged = [...prev];
      data.data.forEach((c) => {
        if (!existing.has(c._id)) merged.push(c);
      });
      return merged;
    });
  }, [data, page]);

  // Auto-resize textarea
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 120)}px`;
    }
  }, [commentText]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      showToast("Please login to comment", "error");
      return;
    }

    const trimmedText = commentText.trim();
    if (!trimmedText) {
      showToast("Comment cannot be empty", "error");
      return;
    }

    if (trimmedText.length > 1000) {
      showToast("Comment must be less than 1000 characters", "error");
      return;
    }

    try {
      await createComment({
        commentContent: trimmedText,
        eventId,
      }).unwrap();

      setCommentText("");
      showToast("Comment posted successfully!");
      setPage(1); // Reset to first page to see new comment
    } catch (err: any) {
      const errorMsg =
        err?.data?.message || "Failed to post comment. Please try again.";
      showToast(errorMsg, "error");
    }
  };

  const updateLocalComment = (updated: CommentDto) => {
    setCommentList((prev) =>
      prev.map((c) => (c._id === updated._id ? { ...c, ...updated } : c)),
    );
  };

  const removeLocalComment = (commentId: string) => {
    setCommentList((prev) => prev.filter((c) => c._id !== commentId));
    setTotalCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-extrabold text-foreground">Comments</h2>
        <span className="ml-auto text-sm font-semibold text-muted-foreground">
          {totalCount} {totalCount === 1 ? "comment" : "comments"}
        </span>
      </div>

      {/* Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-6 space-y-3">
          <div className="flex gap-3">
            {/* User Avatar */}
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden">
              {authData?.member?.memberImage ? (
                <img
                  src={uploadUrlFromFilename(
                    "members",
                    authData.member.memberImage,
                  )}
                  alt={authData.member.memberNick}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-foreground">
                  {authData?.member?.memberNick?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Comment Input */}
            <div className="flex-1 space-y-2">
              <textarea
                ref={textAreaRef}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts about this event..."
                maxLength={1000}
                rows={1}
                className="w-full resize-none rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {commentText.length}/1000
                </span>
                <button
                  type="submit"
                  disabled={
                    createState.isLoading ||
                    !commentText.trim() ||
                    commentText.length > 1000
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {createState.isLoading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Post
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 rounded-lg border border-border/50 bg-muted/50 px-4 py-3 text-center text-sm text-muted-foreground">
          <a
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            Login
          </a>{" "}
          to share your thoughts about this event
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Failed to load comments. Please try again.
          </div>
        ) : commentList.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          commentList.map((comment) => {
            const isOwner = currentUserId === comment.memberId;
            const isEditing = editingId === comment._id;

            return (
              <div
                key={comment._id}
                className="flex gap-3 pb-4 border-b border-border last:border-b-0 last:pb-0"
              >
                {/* Commenter Avatar */}
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden">
                  {comment.memberData?.memberImage ? (
                    <img
                      src={uploadUrlFromFilename(
                        "members",
                        comment.memberData.memberImage,
                      )}
                      alt={comment.memberData.memberNick}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-foreground">
                      {comment.memberData?.memberNick?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-sm text-foreground">
                      {comment.memberData?.memberNick}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatCommentDate(
                        comment.updatedAt || comment.createdAt,
                      )}
                      {comment.updatedAt !== comment.createdAt
                        ? " · edited"
                        : ""}
                    </span>
                  </div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={3}
                        maxLength={1000}
                        className="w-full resize-none rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            const trimmed = editText.trim();
                            if (!trimmed) {
                              showToast("Comment cannot be empty", "error");
                              return;
                            }
                            if (trimmed.length > 1000) {
                              showToast(
                                "Comment must be less than 1000 characters",
                                "error",
                              );
                              return;
                            }
                            try {
                              const updated = await updateComment({
                                commentId: comment._id,
                                commentContent: trimmed,
                                eventId,
                              }).unwrap();
                              updateLocalComment(updated);
                              showToast("Comment updated");
                              setEditingId(null);
                            } catch (err: any) {
                              const msg =
                                err?.data?.message ||
                                "Failed to update comment";
                              showToast(msg, "error");
                            }
                          }}
                          disabled={updateState.isLoading}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updateState.isLoading ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditText("");
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground leading-relaxed break-words">
                      {comment.commentContent}
                    </p>
                  )}
                </div>

                {/* Action Buttons - Only for own comments */}
                {isOwner && !isEditing && (
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <button
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      title="Edit comment"
                      aria-label="Edit comment"
                      onClick={() => {
                        setEditingId(comment._id);
                        setEditText(comment.commentContent);
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      title="Delete comment"
                      aria-label="Delete comment"
                      onClick={() => setDeleteTarget(comment)}
                    >
                      {deleteState.isLoading &&
                      deleteTarget?._id === comment._id ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {(hasMore || page > 1) && (
        <div className="mt-6 flex justify-center gap-3">
          {page > 1 && (
            <button
              onClick={() => {
                setPage(1);
                setCommentList([]);
              }}
              disabled={isFetching}
              className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted text-sm font-semibold text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Show Fewer
            </button>
          )}
          {hasMore && (
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={isFetching}
              className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted text-sm font-semibold text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFetching ? "Loading..." : "Load More Comments"}
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            const deletedId = deleteTarget._id;
            await deleteComment({
              commentId: deletedId,
              eventId,
            }).unwrap();
            removeLocalComment(deletedId);
            showToast("Comment deleted");
            setDeleteTarget(null);
          } catch (err: any) {
            const msg = err?.data?.message || "Failed to delete comment";
            showToast(msg, "error");
          }
        }}
        title="Delete this comment?"
        description="This will remove your comment from the event. You can’t undo this action."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
