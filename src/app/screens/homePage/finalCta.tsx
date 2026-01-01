import { Link } from "react-router-dom";

import { Section } from "../shared/ui";
import {
  BadgeCheck,
  CalendarCheck,
  HandHeart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function FinalCtaSection() {
  return (
    <Section
      title="Bring the volunteering vibe to life"
      description="Donate your time, help real communities, and join events that leave you proud when you go home."
    >
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card/30 shadow-sm">
        <div className="grid gap-6 p-5 md:grid-cols-2 md:items-center md:gap-10 md:p-8">
          <div>
            <div className="inline-flex items-center rounded-full border border-border bg-background/40 px-3 py-1 text-xs font-semibold text-muted-foreground">
              Help people • Donate time • Community impact
            </div>

            <div className="mt-4 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Show up for your city. One mission at a time.
            </div>
            <div className="mt-2 text-sm leading-6 text-muted-foreground">
              Create an account to join volunteer events, follow verified
              organizers, and keep your momentum going.
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center rounded-[var(--radius-lg)] border border-border bg-primary/15 px-4 py-3 text-sm font-extrabold text-foreground hover:bg-primary/20"
              >
                Create free account
                <span className="ml-2 text-primary" aria-hidden="true">
                  →
                </span>
              </Link>

              <Link
                to="/events"
                className="inline-flex items-center justify-center rounded-[var(--radius-lg)] border border-border bg-background/40 px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-background/60"
              >
                Browse events
              </Link>
            </div>

            <div className="mt-4 text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary">
                Log in
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[var(--radius-lg)] border border-border bg-background/30 p-4">
              <div className="flex items-start gap-3">
                <BadgeCheck className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <div className="font-bold text-foreground">
                    Real organizers, real needs
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Support verified orgs and help where it matters.
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-border bg-background/30 p-4">
              <div className="flex items-start gap-3">
                <CalendarCheck className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <div className="font-bold text-foreground">
                    Donate time, not confusion
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Clear details, dates, and capacity—join in seconds.
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-border bg-background/30 p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <div className="font-bold text-foreground">
                    Feel the impact
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Bring a friend, meet good people, and come back again.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border bg-background/20 px-5 py-4 md:px-8">
          <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Verified orgs help keep Unity safe.
            </div>
            <div className="flex items-center gap-2">
              <HandHeart className="h-4 w-4 text-primary" />
              Start with one event—grow your impact.
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
