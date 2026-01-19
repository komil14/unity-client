import { Link } from "react-router-dom";

import { Section } from "../../../libs/shared/ui";
import {
  BadgeCheck,
  Building2,
  CalendarCheck,
  HandHeart,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { WhyTab } from "../../../libs/types";

export default function WhyJoinSection({
  whyTab,
  setWhyTab,
}: {
  whyTab: WhyTab;
  setWhyTab: (tab: WhyTab) => void;
}) {
  return (
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
                  Publish volunteer opportunities and reach motivated people who
                  actually show up.
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
  );
}
