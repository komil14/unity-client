import { Link, useParams } from "react-router-dom";
import { Calendar, Eye, Heart, Newspaper, User } from "lucide-react";

import { useGetArticleByIdQuery } from "../../services/articlesApi";
import { useScrollToTop } from "../../hooks/useScrollToTop";
import {
  formatDate,
  memberImageUrlFromFilename,
  uploadUrlFromFilename,
} from "../../../libs/shared/ui";

export default function ArticleDetailPage() {
  useScrollToTop();
  const { id } = useParams();
  const articleId = id ?? "";
  const { data, isLoading, isError } = useGetArticleByIdQuery(articleId, {
    skip: !articleId,
  });

  if (!articleId) {
    return (
      <div className="text-muted-foreground">Invalid article id.</div>
    );
  }

  if (isLoading) {
    return <div className="text-muted-foreground">Loading article…</div>;
  }

  if (isError || !data) {
    return (
      <div className="text-destructive">Failed to load article.</div>
    );
  }

  const cover = uploadUrlFromFilename("community", data.boardImage);
  const authorName = data.memberData?.memberNick || "Community member";
  const authorAvatar = memberImageUrlFromFilename(
    data.memberData?.memberImage,
    authorName,
  );

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
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {data.boardViews ?? 0} views
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                {data.boardLikes ?? 0} likes
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

          <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
            <p className="whitespace-pre-line leading-7 text-foreground">
              {data.boardContent}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
