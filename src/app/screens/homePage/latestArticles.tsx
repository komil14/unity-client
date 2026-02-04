import { Link } from "react-router-dom";
import { Calendar, Eye, Heart, Newspaper } from "lucide-react";

import { useGetArticlesQuery } from "../../services/articlesApi";
import {
  clampText,
  formatDate,
  uploadUrlFromFilename,
} from "../../../libs/shared/ui";

export default function LatestArticlesSection() {
  const { data, isLoading, isError } = useGetArticlesQuery({
    page: 1,
    limit: 3,
    order: "createdAt",
  });

  return (
    <section className="mb-7">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            <h2 className="m-0 text-[22px] font-extrabold tracking-tight text-foreground">
              Latest articles
            </h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Stories and insights from organizers and volunteers.
          </p>
        </div>

        <Link
          to="/articles"
          className="inline-flex items-center justify-center rounded-[var(--radius-lg)] border border-border bg-background/40 px-4 py-2 text-sm font-semibold text-foreground hover:bg-background/60"
        >
          See all
          <span className="ml-2 text-primary" aria-hidden="true">
            →
          </span>
        </Link>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-border bg-card/30 p-4 shadow-sm">
        {isLoading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : isError ? (
          <div className="text-destructive">Failed to load articles.</div>
        ) : !data?.items?.length ? (
          <div className="text-muted-foreground">No articles yet.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {data.items.map((article) => {
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
                  <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-background/30 transition-colors hover:bg-background/40">
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
                          <Newspaper className="h-7 w-7" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(article.createdAt)}
                        </span>
                      </div>

                      <h3 className="mt-2 text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                        {article.boardTitle}
                      </h3>

                      <p className="mt-2 text-sm text-muted-foreground">
                        {clampText(article.boardContent, 110)}
                      </p>

                      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5 text-primary" />
                          {article.boardViews ?? 0}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5 text-primary" />
                          {article.boardLikes ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
