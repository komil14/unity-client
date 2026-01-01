import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useGetEventsQuery } from "../../services/eventsApi";
import { useGetTopOrganizersQuery } from "../../services/organizersApi";
import { Section } from "../shared/ui";
import EventCard from "../eventsPage/EventCard";
import {
  BadgeCheck,
  Building2,
  CalendarCheck,
  Eye,
  HandHeart,
  Heart,
  MessageCircle,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const VOLUNTEER_IMAGES = [
  "/images/volunteers/01.jpg",
  "/images/volunteers/02.jpg",
  "/images/volunteers/03.jpg",
  "/images/volunteers/04.jpg",
  "/images/volunteers/05.jpg",
  "/images/volunteers/06.jpg",
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

function VolunteerSlideshow({ images }: { images: string[] }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  const safeImages = useMemo(
    () => images.filter((src) => typeof src === "string" && src.length > 0),
    [images]
  );

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (safeImages.length <= 1) return;

    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % safeImages.length);
    }, 1000);

    return () => window.clearInterval(id);
  }, [prefersReducedMotion, safeImages.length]);

  if (!safeImages.length) {
    return (
      <div className="relative aspect-[16/11] w-full overflow-hidden rounded-[var(--radius-lg)] border border-border bg-muted" />
    );
  }

  return (
    <div className="relative aspect-[16/11] w-full overflow-hidden rounded-[var(--radius-lg)] border border-border bg-muted">
      {safeImages.map((src, idx) => (
        <img
          key={src}
          src={src}
          alt="Volunteers"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            idx === activeIndex ? "opacity-100" : "opacity-0"
          }`}
          loading={idx === 0 ? "eager" : "lazy"}
          draggable={false}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/25 to-transparent" />

      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
        <div className="inline-flex items-center rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur">
          Volunteers in action
        </div>
        <div className="inline-flex items-center gap-1">
          {safeImages.map((_src, idx) => (
            <span
              key={idx}
              className={`h-1.5 w-1.5 rounded-full border border-border ${
                idx === activeIndex
                  ? "bg-primary"
                  : "bg-background/30 backdrop-blur"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="mb-7 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card/30 shadow-sm">
      <div className="grid gap-6 p-5 md:grid-cols-2 md:items-center md:gap-10 md:p-8">
        <div>
          <div className="inline-flex items-center rounded-full border border-border bg-background/40 px-3 py-1 text-xs font-semibold text-muted-foreground">
            Volunteer • Community • Impact
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Find your next volunteer mission.
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            Unity connects volunteers with verified organizations. Join events,
            meet good people, and turn small actions into real change.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/events"
              className="inline-flex items-center justify-center rounded-[var(--radius-lg)] border border-border bg-primary/15 px-4 py-3 text-sm font-semibold text-foreground hover:bg-primary/20"
            >
              Explore events
            </Link>
            <a
              href="#why"
              className="inline-flex items-center justify-center rounded-[var(--radius-lg)] border border-border bg-background/40 px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-background/60"
            >
              Why join
            </a>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-[var(--radius-lg)] border border-border bg-background/30 px-3 py-3">
              <div className="text-lg font-extrabold text-foreground">
                Verified
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Organizations
              </div>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-border bg-background/30 px-3 py-3">
              <div className="text-lg font-extrabold text-foreground">Real</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Events & groups
              </div>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-border bg-background/30 px-3 py-3">
              <div className="text-lg font-extrabold text-foreground">
                Impact
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                You can see
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <VolunteerSlideshow images={VOLUNTEER_IMAGES} />
        </div>
      </div>
    </section>
  );
}

function PopularEventsSection() {
  const { data, isLoading, isError } = useGetEventsQuery({
    page: 1,
    limit: 4,
    order: "eventLikes",
    direction: "desc",
  });

  return (
    <section className="mb-7">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <h2 className="m-0 text-[22px] font-extrabold tracking-tight text-foreground">
              Popular events
            </h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            The 4 most liked events right now.
          </p>
        </div>

        <Link
          to="/events?order=eventLikes"
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
          <div className="text-destructive">Failed to load events.</div>
        ) : !data?.length ? (
          <div className="text-muted-foreground">No events yet.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.map((event) => (
              <div key={event._id} className="h-full">
                <EventCard event={event} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TrendingEventsSection() {
  const { data, isLoading, isError } = useGetEventsQuery({
    page: 1,
    limit: 4,
    order: "eventViews",
    direction: "desc",
  });

  return (
    <section className="mb-7">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <h2 className="m-0 text-[22px] font-extrabold tracking-tight text-foreground">
              Trending events
            </h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            The 4 most viewed events right now.
          </p>
        </div>

        <Link
          to="/events?order=eventViews"
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
          <div className="text-destructive">Failed to load events.</div>
        ) : !data?.length ? (
          <div className="text-muted-foreground">No events yet.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.map((event) => (
              <div key={event._id} className="h-full">
                <EventCard event={event} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

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

function TopOrganizersSection() {
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
                  <div className="flex h-full flex-col rounded-[var(--radius-lg)] border border-border bg-background/30 p-5 transition-colors hover:bg-background/40">
                    <div className="flex items-start gap-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-full border border-border bg-muted">
                        {avatarImg ? (
                          <img
                            src={avatarImg}
                            alt={org.memberNick}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl font-extrabold text-foreground">
                            {initial}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="min-w-0 truncate text-lg font-extrabold tracking-tight text-foreground">
                            {org.memberNick}
                          </div>
                          {org.isVerified ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                              <BadgeCheck className="h-3.5 w-3.5" />
                              Verified
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-muted-foreground">
                          Organizer
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4">
                      <div className="rounded-[var(--radius-lg)] border border-border bg-background/20 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                          <Heart className="h-5 w-5 text-primary" />
                          Likes
                        </div>
                        <div className="mt-2 text-3xl font-extrabold text-foreground">
                          {formatCompactNumber(org.memberLikes)}
                        </div>
                      </div>
                      <div className="rounded-[var(--radius-lg)] border border-border bg-background/20 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                          <Eye className="h-5 w-5 text-primary" />
                          Views
                        </div>
                        <div className="mt-2 text-3xl font-extrabold text-foreground">
                          {formatCompactNumber(org.memberViews)}
                        </div>
                      </div>
                      <div className="rounded-[var(--radius-lg)] border border-border bg-background/20 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                          <CalendarCheck className="h-5 w-5 text-primary" />
                          Events
                        </div>
                        <div className="mt-2 text-3xl font-extrabold text-foreground">
                          {formatCompactNumber(org.eventsCount)}
                        </div>
                      </div>
                      <div className="rounded-[var(--radius-lg)] border border-border bg-background/20 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                          <Heart className="h-5 w-5 text-primary" />
                          Event likes
                        </div>
                        <div className="mt-2 text-3xl font-extrabold text-foreground">
                          {formatCompactNumber(org.eventsLikesTotal)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-[var(--radius-lg)] border border-border bg-background/20 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <Eye className="h-5 w-5 text-primary" />
                        Event views
                      </div>
                      <div className="mt-2 text-3xl font-extrabold text-foreground">
                        {formatCompactNumber(org.eventsViewsTotal)}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-[var(--radius-lg)] border border-border bg-background/20 px-4 py-3 text-sm font-semibold text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Newspaper className="h-5 w-5 text-primary" />
                        Articles
                        <span className="ml-1 text-foreground">
                          {formatCompactNumber(org.articlesCount)}
                        </span>
                      </div>
                      <div className="h-5 w-px bg-border" />
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        Comments
                        <span className="ml-1 text-foreground">
                          {formatCompactNumber(org.articleCommentsCount)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-extrabold tracking-tight text-muted-foreground">
                          View profile
                        </span>
                        <span
                          className="text-primary transition-transform group-hover:translate-x-1"
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

export default function HomePage() {
  const [whyTab, setWhyTab] = useState<
    "volunteers" | "organizations" | "communities"
  >("volunteers");

  return (
    <div>
      <Hero />

      <div id="why" />
      <Section
        title="Why volunteers and organizations join"
        description="A simple workflow: admin verifies orgs → orgs publish events → volunteers join → impact happens."
      >
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card/30 shadow-sm">
          <div className="border-b border-border p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWhyTab("volunteers")}
                  className={`inline-flex items-center gap-2 rounded-[var(--radius-lg)] border border-border px-3 py-2 text-sm font-semibold transition-colors ${
                    whyTab === "volunteers"
                      ? "bg-primary/15 text-foreground"
                      : "bg-background/30 text-muted-foreground hover:bg-background/50"
                  }`}
                  aria-pressed={whyTab === "volunteers"}
                >
                  <HandHeart className="h-4 w-4" />
                  Volunteers
                </button>

                <button
                  type="button"
                  onClick={() => setWhyTab("organizations")}
                  className={`inline-flex items-center gap-2 rounded-[var(--radius-lg)] border border-border px-3 py-2 text-sm font-semibold transition-colors ${
                    whyTab === "organizations"
                      ? "bg-primary/15 text-foreground"
                      : "bg-background/30 text-muted-foreground hover:bg-background/50"
                  }`}
                  aria-pressed={whyTab === "organizations"}
                >
                  <Building2 className="h-4 w-4" />
                  Organizations
                </button>

                <button
                  type="button"
                  onClick={() => setWhyTab("communities")}
                  className={`inline-flex items-center gap-2 rounded-[var(--radius-lg)] border border-border px-3 py-2 text-sm font-semibold transition-colors ${
                    whyTab === "communities"
                      ? "bg-primary/15 text-foreground"
                      : "bg-background/30 text-muted-foreground hover:bg-background/50"
                  }`}
                  aria-pressed={whyTab === "communities"}
                >
                  <Users className="h-4 w-4" />
                  Communities
                </button>
              </div>

              <div className="hidden items-center gap-3 text-xs font-semibold text-muted-foreground md:flex">
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/30 px-3 py-1">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Verify
                </span>
                <span className="opacity-50">→</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/30 px-3 py-1">
                  <CalendarCheck className="h-4 w-4 text-primary" /> Publish
                </span>
                <span className="opacity-50">→</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/30 px-3 py-1">
                  <BadgeCheck className="h-4 w-4 text-primary" /> Join
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-4 md:grid-cols-2 md:gap-6 md:p-5">
            <div className="rounded-[var(--radius-lg)] border border-border bg-background/30 p-4 md:p-5">
              {whyTab === "volunteers" ? (
                <>
                  <div className="text-xl font-extrabold tracking-tight text-foreground">
                    For volunteers
                  </div>
                  <div className="mt-2 text-sm leading-6 text-muted-foreground">
                    Discover real nonprofit events, join with confidence, and
                    build momentum by showing up consistently.
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div>Verified orgs reduce spam and fake listings.</div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div>
                        Pick events that match your time, location, and energy.
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div>Meet purpose-driven people in your city.</div>
                    </div>
                  </div>
                </>
              ) : whyTab === "organizations" ? (
                <>
                  <div className="text-xl font-extrabold tracking-tight text-foreground">
                    For organizations
                  </div>
                  <div className="mt-2 text-sm leading-6 text-muted-foreground">
                    Publish volunteer opportunities and reach motivated people
                    who actually show up.
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div>Earn trust via verification and clarity.</div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CalendarCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div>Create events, manage capacity, track interest.</div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div>Build a repeat-volunteer pipeline over time.</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xl font-extrabold tracking-tight text-foreground">
                    For communities
                  </div>
                  <div className="mt-2 text-sm leading-6 text-muted-foreground">
                    Turn one-off volunteering into a culture: more hands, more
                    trust, more consistent outcomes.
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div>Shared events connect neighbors and groups.</div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div>Small actions compound into visible impact.</div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div>Trust grows when projects are consistent.</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="grid gap-3">
              <div className="group rounded-[var(--radius-lg)] border border-border bg-background/30 p-4 transition-colors hover:bg-background/40">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <div className="font-bold text-foreground">Trust first</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Verified organizations means higher-quality events.
                    </div>
                  </div>
                </div>
              </div>

              <div className="group rounded-[var(--radius-lg)] border border-border bg-background/30 p-4 transition-colors hover:bg-background/40">
                <div className="flex items-start gap-3">
                  <CalendarCheck className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <div className="font-bold text-foreground">
                      Clear participation
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Capacity, details, and dates are always visible.
                    </div>
                  </div>
                </div>
              </div>

              <div className="group rounded-[var(--radius-lg)] border border-border bg-background/30 p-4 transition-colors hover:bg-background/40">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <div className="font-bold text-foreground">
                      Make it a habit
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Join one event today—come back stronger next week.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  to="/events"
                  className="inline-flex items-center justify-center rounded-[var(--radius-lg)] border border-border bg-primary/15 px-4 py-3 text-sm font-semibold text-foreground hover:bg-primary/20"
                >
                  Browse events
                </Link>
                <Link
                  to="/groups"
                  className="inline-flex items-center justify-center rounded-[var(--radius-lg)] border border-border bg-background/40 px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-background/60"
                >
                  Explore groups
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <PopularEventsSection />

      <TrendingEventsSection />

      <TopOrganizersSection />

      <Section
        title="Ready to help?"
        description="Start with one event. Then make it a habit."
      >
        <Link
          to="/events"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            borderRadius: "var(--radius-sm)",
            background: "rgba(245,158,11,0.12)",
            border: "1px solid rgba(245,158,11,0.35)",
            color: "var(--text-main)",
            fontWeight: 700,
          }}
        >
          Browse all events
          <span
            style={{ color: "var(--secondary)", fontWeight: 900 }}
            aria-hidden="true"
          >
            →
          </span>
        </Link>
      </Section>
    </div>
  );
}
