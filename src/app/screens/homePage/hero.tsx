import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

const VOLUNTEER_IMAGES = [
  "/uploads/images/volunteers/01.jpg",
  "/uploads/images/volunteers/02.jpg",
  "/uploads/images/volunteers/03.jpg",
  "/uploads/images/volunteers/04.jpg",
  "/uploads/images/volunteers/05.jpg",
  "/uploads/images/volunteers/06.jpg",
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
    [images],
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

export default function HeroSection() {
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
