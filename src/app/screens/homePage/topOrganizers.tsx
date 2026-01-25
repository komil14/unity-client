import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Building2,
  CalendarCheck,
  Eye,
  Heart,
  MessageCircle,
  Newspaper,
} from "lucide-react";

import { useGetTopOrganizersQuery } from "../../services/organizersApi";

function formatCompactNumber(value?: number): string {
  const num = typeof value === "number" ? value : 0;
  return new Intl.NumberFormat(undefined, { notation: "compact" }).format(num);
}

function organizerImageUrl(src?: string): string | undefined {
  if (!src) return undefined;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  // Accept already-normalized paths
  if (src.startsWith("/uploads/")) return src;
  if (src.startsWith("uploads/")) return `/${src}`;
  // If DB stores a folder prefix like `members/<file>`
  if (src.includes("/")) return `/uploads/${src.replace(/^\/+/, "")}`;
  // Default: member images live in /uploads/members
  if (src.startsWith("/")) return src;
  return `/uploads/members/${src}`;
}

export default function TopOrganizersSection() {
  const { data, isLoading, isError } = useGetTopOrganizersQuery({ limit: 4 });

  return (
    <section className="mb-7">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="m-0 text-[22px] font-extrabold tracking-tight text-foreground">
              Top organizers
            </h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Ranked by community signals: likes, views, events, articles, and
            article comments.
          </p>
        </div>

        <Link
          to="/organizers"
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
          <div className="text-destructive">Failed to load organizers.</div>
        ) : !data?.length ? (
          <div className="text-muted-foreground">No organizers yet.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.map((org) => {
              const avatarImg = organizerImageUrl(org.memberImage);
              const initial = (org.memberNick || "?").slice(0, 1).toUpperCase();

              return (
                <Link
                  key={org._id}
                  to={`/organizers/${org._id}`}
                  className="group block h-full"
                >
                  <div className="flex h-full flex-col rounded-xl border border-border bg-background/30 p-3 transition-colors hover:bg-background/40">
                    <div className="flex items-start gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-full border border-border bg-muted flex-shrink-0">
                        {avatarImg ? (
                          <img
                            src={avatarImg}
                            alt={org.memberNick}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-lg font-extrabold text-foreground">
                            {initial}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-extrabold tracking-tight leading-snug text-foreground break-words">
                          {org.memberNick}
                        </div>

                        <div className="mt-0.5 flex flex-wrap items-center gap-1 text-xs font-semibold text-muted-foreground">
                          <span>Organizer</span>
                          {org.isVerified ? (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/15 px-1.5 py-0 text-[10px] font-semibold text-primary">
                              <BadgeCheck className="h-2.5 w-2.5" />
                              Verified
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="rounded-[var(--radius-lg)] border border-border bg-background/20 p-2">
                        <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                          <Heart className="h-3.5 w-3.5 text-primary" />
                          <span>Likes</span>
                        </div>
                        <div className="mt-1 text-lg font-extrabold text-foreground">
                          {formatCompactNumber(org.memberLikes)}
                        </div>
                      </div>
                      <div className="rounded-[var(--radius-lg)] border border-border bg-background/20 p-2">
                        <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                          <Eye className="h-3.5 w-3.5 text-primary" />
                          <span>Views</span>
                        </div>
                        <div className="mt-1 text-lg font-extrabold text-foreground">
                          {formatCompactNumber(org.memberViews)}
                        </div>
                      </div>
                      <div className="rounded-[var(--radius-lg)] border border-border bg-background/20 p-2">
                        <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                          <CalendarCheck className="h-3.5 w-3.5 text-primary" />
                          <span>Events</span>
                        </div>
                        <div className="mt-1 text-lg font-extrabold text-foreground">
                          {formatCompactNumber(org.eventsCount)}
                        </div>
                      </div>
                      <div className="rounded-[var(--radius-lg)] border border-border bg-background/20 p-2">
                        <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                          <Heart className="h-3.5 w-3.5 text-primary" />
                          <span>Event likes</span>
                        </div>
                        <div className="mt-1 text-lg font-extrabold text-foreground">
                          {formatCompactNumber(org.eventsLikesTotal)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 rounded-[var(--radius-lg)] border border-border bg-background/20 p-2">
                      <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                        <Eye className="h-3.5 w-3.5 text-primary" />
                        <span>Event views</span>
                      </div>
                      <div className="mt-1 text-lg font-extrabold text-foreground">
                        {formatCompactNumber(org.eventsViewsTotal)}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-1 rounded-[var(--radius-lg)] border border-border bg-background/20 px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Newspaper className="h-3.5 w-3.5 text-primary" />
                        <span>Articles</span>
                        <span className="text-foreground">
                          {formatCompactNumber(org.articlesCount)}
                        </span>
                      </div>
                      <div className="h-3 w-px bg-border" />
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5 text-primary" />
                        <span>Comments</span>
                        <span className="text-foreground">
                          {formatCompactNumber(org.articleCommentsCount)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold tracking-tight text-muted-foreground">
                          View profile
                        </span>
                        <span
                          className="text-primary transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        >
                          →
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
