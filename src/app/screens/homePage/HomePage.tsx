import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useGetEventsQuery } from "../../services/eventsApi";
import { Section } from "../shared/ui";
import EventCard from "../eventsPage/EventCard";
import {
  BadgeCheck,
  Building2,
  CalendarCheck,
  HandHeart,
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

function EventsGrid({
  title,
  description,
  order,
}: {
  title: string;
  description: string;
  order: string;
}) {
  const { data, isLoading, isError } = useGetEventsQuery({
    page: 1,
    limit: 6,
    order,
  });

  return (
    <Section title={title} description={description}>
      {isLoading ? (
        <div style={{ color: "var(--text-muted)" }}>Loading…</div>
      ) : isError ? (
        <div style={{ color: "var(--danger)" }}>Failed to load events.</div>
      ) : !data?.length ? (
        <div style={{ color: "var(--text-muted)" }}>No events yet.</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 16,
          }}
        >
          {data.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </Section>
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

      <EventsGrid
        title="Popular events"
        description="Sorted by likes (volunteer interest)."
        order="eventLikes"
      />

      <EventsGrid
        title="Trending events"
        description="Sorted by unique views."
        order="eventViews"
      />

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
