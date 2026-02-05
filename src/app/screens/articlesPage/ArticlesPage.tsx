import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Eye,
  Heart,
  Newspaper,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { useGetArticlesQuery } from "../../services/articlesApi";
import { useCheckAuthQuery } from "../../services/authApi";
import { AlertDialog } from "../../../libs/components/ui/alert-dialog";
import { useScrollToTop } from "../../hooks/useScrollToTop";
import {
  formatDate,
  memberImageUrlFromFilename,
  uploadUrlFromFilename,
} from "../../../libs/shared/ui";
import { getMarkdownPreview } from "../../../libs/utils/markdown";
import type { ArticleInquiry } from "../../../libs/types/article";

const ORDER_OPTIONS: { label: string; value: string }[] = [
  { label: "Newest", value: "createdAt" },
  { label: "Most viewed", value: "boardViews" },
  { label: "Most liked", value: "boardLikes" },
  { label: "Title", value: "boardTitle" },
];

export default function ArticlesPage() {
  useScrollToTop();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: authData } = useCheckAuthQuery();
  const isAuthenticated = Boolean(authData?.member?._id);
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  type ArticleOrder = NonNullable<ArticleInquiry["order"]>;

  const resolveOrder = (value: string | null): ArticleOrder =>
    (ORDER_OPTIONS.find((opt) => opt.value === value)?.value as
      | ArticleOrder
      | undefined) ?? "createdAt";

  const resolvePage = (value: string | null): number => {
    const parsed = Number.parseInt(value || "1", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  };

  const [order, setOrder] = useState<ArticleOrder>(
    resolveOrder(searchParams.get("order")),
  );
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(resolvePage(searchParams.get("page")));

  useEffect(() => {
    setOrder(resolveOrder(searchParams.get("order")));
    setSearch(searchParams.get("search") || "");
    setPage(resolvePage(searchParams.get("page")));
  }, [searchParams]);

  const query = useMemo(() => {
    const trimmed = search.trim();
    return {
      page,
      limit: 12,
      order,
      search: trimmed ? trimmed : undefined,
    };
  }, [order, page, search]);

  const { data, isLoading, isError } = useGetArticlesQuery(query);
  const items = data?.items ?? [];
  const totalPages =
    data?.totalPages ??
    Math.max(1, Math.ceil((data?.total ?? items.length) / query.limit));

  const pageNumbers = useMemo(() => {
    const maxButtons = 5;
    const current = Math.min(page, totalPages);
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

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

        <button
          onClick={() => {
            if (isAuthenticated) {
              navigate("/articles/create");
            } else {
              setShowLoginAlert(true);
            }
          }}
          className="inline-flex items-center justify-center rounded-[var(--radius-lg)] border border-border bg-background/40 px-4 py-2 text-sm font-semibold text-foreground hover:bg-background/60 transition-colors"
        >
          Write an Article
          <span className="ml-2 text-primary" aria-hidden="true">
            →
          </span>
        </button>
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
              next.set("page", "1");
              setPage(1);
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
          <>
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
                          {getMarkdownPreview(article.boardContent, 140)}
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

            {totalPages > 1 ? (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextPage = Math.max(1, page - 1);
                    const next = new URLSearchParams(searchParams);
                    if (nextPage > 1) next.set("page", String(nextPage));
                    else next.delete("page");
                    setPage(nextPage);
                    setSearchParams(next);
                  }}
                  disabled={page <= 1}
                  className="h-10 px-3 rounded-[var(--radius-lg)] border border-border bg-background/40 text-sm font-semibold text-foreground hover:bg-background/60 disabled:opacity-50"
                >
                  Prev
                </button>

                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      if (p > 1) next.set("page", String(p));
                      else next.delete("page");
                      setPage(p);
                      setSearchParams(next);
                    }}
                    className={`h-10 w-10 rounded-[var(--radius-lg)] border text-sm font-semibold transition-colors ${
                      p === page
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background/40 text-foreground hover:bg-background/60"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    const nextPage = Math.min(totalPages, page + 1);
                    const next = new URLSearchParams(searchParams);
                    if (nextPage > 1) next.set("page", String(nextPage));
                    else next.delete("page");
                    setPage(nextPage);
                    setSearchParams(next);
                  }}
                  disabled={page >= totalPages}
                  className="h-10 px-3 rounded-[var(--radius-lg)] border border-border bg-background/40 text-sm font-semibold text-foreground hover:bg-background/60 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* Login Required Alert */}
      <AlertDialog
        isOpen={showLoginAlert}
        onClose={() => setShowLoginAlert(false)}
        onConfirm={() => {
          setShowLoginAlert(false);
          navigate("/login");
        }}
        title="Login Required"
        description="You need to be logged in as an organizer to write articles. Please login or create an account to continue."
        confirmText="Login Now"
        cancelText="Maybe Later"
        variant="warning"
      />
    </div>
  );
}
