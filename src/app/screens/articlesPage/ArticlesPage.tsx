import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Calendar,
  Eye,
  Heart,
  Newspaper,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { useGetArticlesQuery } from "../../services/articlesApi";
import { useScrollToTop } from "../../hooks/useScrollToTop";
import {
  clampText,
  formatDate,
  memberImageUrlFromFilename,
  uploadUrlFromFilename,
} from "../../../libs/shared/ui";
import type { ArticleInquiry } from "../../../libs/types/article";

const ORDER_OPTIONS: { label: string; value: string }[] = [
  { label: "Newest", value: "createdAt" },
  { label: "Most viewed", value: "boardViews" },
  { label: "Most liked", value: "boardLikes" },
  { label: "Title", value: "boardTitle" },
];

export default function ArticlesPage() {
  useScrollToTop();
  const [searchParams, setSearchParams] = useSearchParams();

  type ArticleOrder = NonNullable<ArticleInquiry["order"]>;

  const orderFromUrl =
    (ORDER_OPTIONS.find((opt) => opt.value === searchParams.get("order"))
      ?.value as ArticleOrder | undefined) ?? "createdAt";
  const initialSearch = searchParams.get("search") || "";

  const [order, setOrder] = useState<ArticleOrder>(orderFromUrl);
  const [search, setSearch] = useState(initialSearch);

  const query = useMemo(() => {
    const trimmed = search.trim();
    return {
      page: 1,
      limit: 12,
      order,
      search: trimmed ? trimmed : undefined,
    };
  }, [order, search]);

  const { data, isLoading, isError } = useGetArticlesQuery(query);
  const items = data?.items ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Community Articles
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">
            Read stories, insights, and updates from organizers and volunteers
            shaping their communities.
          </p>
        </div>

        <Link
          to="/articles/create"
          className="inline-flex items-center justify-center rounded-[var(--radius-lg)] border border-border bg-background/40 px-4 py-2 text-sm font-semibold text-foreground hover:bg-background/60"
        >
          Write an Article
          <span className="ml-2 text-primary" aria-hidden="true">
            →
          </span>
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles…"
            className="h-11 w-full rounded-[var(--radius-lg)] border border-border bg-background/40 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value as ArticleOrder)}
              className="h-11 rounded-[var(--radius-lg)] border border-border bg-background/40 pl-10 pr-4 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {ORDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              const next = new URLSearchParams();
              if (order !== "createdAt") next.set("order", order);
              if (search.trim()) next.set("search", search.trim());
              setSearchParams(next);
            }}
            className="h-11 px-4 rounded-[var(--radius-lg)] border border-border bg-background/40 text-sm font-semibold text-foreground hover:bg-background/60 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-border bg-card/30 p-4">
        {isLoading ? (
          <div className="text-muted-foreground">Loading articles…</div>
        ) : isError ? (
          <div className="text-destructive">Failed to load articles.</div>
        ) : items.length === 0 ? (
          <div className="text-muted-foreground">
            No articles yet. Be the first to share your story.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((article) => {
              const authorName =
                article.memberData?.memberNick || "Community member";
              const authorAvatar = memberImageUrlFromFilename(
                article.memberData?.memberImage,
                authorName,
              );
              const cover = uploadUrlFromFilename(
                "community",
                article.boardImage,
              );

              return (
                <Link
                  key={article._id}
                  to={`/articles/${article._id}`}
                  className="group block h-full"
                >
                  <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-background/30 transition-colors hover:bg-background/40">
                    <div className="relative aspect-[16/9] w-full bg-muted">
                      {cover ? (
                        <img
                          src={cover}
                          alt={article.boardTitle}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Newspaper className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(article.createdAt)}
                        </span>
                        <span>•</span>
                        <span>{authorName}</span>
                      </div>

                      <h3 className="mt-2 text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                        {article.boardTitle}
                      </h3>

                      <p className="mt-2 text-sm text-muted-foreground">
                        {clampText(article.boardContent, 140)}
                      </p>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5 text-primary" />
                            {article.boardViews ?? 0}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Heart className="h-3.5 w-3.5 text-primary" />
                            {article.boardLikes ?? 0}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {authorAvatar ? (
                            <img
                              src={authorAvatar}
                              alt={authorName}
                              className="h-7 w-7 rounded-full object-cover border border-border"
                              loading="lazy"
                            />
                          ) : null}
                          <span className="text-xs text-muted-foreground">
                            {authorName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
