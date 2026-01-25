import { useEffect, useState, memo } from "react";
import type { CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Eye,
  Heart,
  MapPin,
  Share2,
  StarsIcon,
  Users,
} from "lucide-react";

import type { EventDto } from "../../services/eventsApi";
import { useToggleLikeMutation } from "../../services/likesApi";
import { useCheckAuthQuery } from "../../services/authApi";
import { eventImageUrlFromFilename } from "../../../libs/shared/ui";
import { AlertDialog } from "../../../libs/components/ui/alert-dialog";
import { useToast } from "../../../libs/components/ui/toast";

function clampStyle(lines: number): CSSProperties {
  return {
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  };
}

function isUpcoming(dateValue: string): boolean {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() > Date.now();
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const datePart = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);

  const timePart = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  return `${datePart}, ${timePart}`;
}

function EventCard({
  event,
  likedByMe,
}: {
  event: EventDto;
  likedByMe?: boolean;
}) {
  const navigate = useNavigate();
  const [toggleLike, toggleState] = useToggleLikeMutation();
  const { data: authData } = useCheckAuthQuery();
  const isAuthenticated = Boolean(authData?.member?._id);
  const { showToast } = useToast();
  const img = eventImageUrlFromFilename(event.eventImages?.[0]);
  const upcoming = isUpcoming(event.eventDate || "");

  const [likesCount, setLikesCount] = useState<number>(event.eventLikes || 0);
  const [liked, setLiked] = useState<boolean>(Boolean(likedByMe));
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  useEffect(() => {
    setLiked(Boolean(likedByMe));
  }, [event._id, likedByMe]);

  useEffect(() => {
    setLikesCount(event.eventLikes || 0);
  }, [event.eventLikes]);

  const pointLabel = event.eventPoints ? `+${event.eventPoints} pts` : "No pts";

  const handleLikeToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginAlert(true);
      return;
    }

    try {
      const newLiked = !liked;
      setLiked(newLiked);
      setLikesCount((prev) => Math.max(0, prev + (newLiked ? 1 : -1)));

      const res = await toggleLike({
        likeGroup: "EVENT",
        likeRefId: event._id,
      }).unwrap();

      const confirmed = res.status === "liked";
      setLiked(confirmed);

      if (confirmed !== newLiked) {
        setLikesCount((prev) => Math.max(0, prev + (confirmed ? 1 : -1)));
      }

      showToast(
        confirmed
          ? "Event added to your favorites!"
          : "Event removed from your favorites!",
      );
    } catch (err: any) {
      setLiked(!liked);
      setLikesCount((prev) => Math.max(0, prev + (liked ? 1 : -1)));

      const status = err?.status;
      if (status === 401 || status === 403) {
        navigate("/login");
      } else {
        showToast("Failed to update favorite. Please try again.", "error");
      }
    }
  };

  return (
    <>
      <Link to={`/events/${event._id}`} className="group block h-full">
        <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card text-foreground shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl min-h-[480px]">
          <div
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-hidden
          >
            <div className="absolute -inset-x-12 -bottom-10 h-24 bg-gradient-to-r from-primary/20 via-emerald-400/15 to-amber-300/20 blur-3xl" />
          </div>

          {/* Image */}
          <div className="relative overflow-hidden">
            <div className="relative aspect-[16/10] w-full bg-muted">
              {img ? (
                <img
                  src={img}
                  alt={event.eventTitle}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Users className="h-12 w-12 text-muted-foreground/60" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent transition-transform duration-500 group-hover:scale-140" />

              <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold border shadow-sm  backdrop-blur-sm ${
                    upcoming
                      ? "bg-primary/70 border-emerald-400/50 text-white"
                      : "bg-slate-700/70 border-slate-600/30 text-slate-100"
                  }`}
                >
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${upcoming ? "bg-white animate-pulse" : "bg-slate-200"}`}
                  />
                  {upcoming ? "Open" : "Closed"}
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-1 flex-col gap-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <h3
                className="text-base sm:text-lg font-semibold leading-tight tracking-tight"
                style={clampStyle(2)}
                title={event.eventTitle}
              >
                {event.eventTitle}
              </h3>
              <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-3 py-1 text-[11px] font-semibold">
                Volunteer
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-muted-foreground items-center">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="leading-snug text-sm font-medium text-foreground">
                  {event.eventLocation}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="leading-snug text-sm font-medium text-foreground">
                  {formatDateTime(event.eventDate || "")}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-xs font-semibold text-foreground justify-center">
              <span className="inline-flex items-center gap-1 rounded-full bg-background/80 border border-border px-3 py-1">
                <Users className="h-3.5 w-4 text-primary" />
                {event.eventJoined} / {event.eventCapacity}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-background/80 border border-border px-3 py-1">
                <Eye className="h-3.5 w-4 text-primary" />
                {event.eventViews}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-background/80 border border-border px-3 py-1">
                <StarsIcon className="h-3.5 w-4 text-primary" />
                {pointLabel}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Capacity</span>
                <span className="font-semibold text-foreground">
                  {event.eventJoined}/{event.eventCapacity}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden border border-border/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-primary to-primary/80 transition-all duration-500"
                  style={{
                    width: `${(() => {
                      const capacity = Math.max(event.eventCapacity || 0, 0);
                      const joined = Math.max(event.eventJoined || 0, 0);
                      if (capacity === 0) return 0;
                      return Math.min((joined / capacity) * 100, 100);
                    })()}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-auto flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-semibold text-foreground transition-transform transition-colors duration-200 hover:bg-background/80 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
                disabled={toggleState.isLoading}
                onClick={handleLikeToggle}
                aria-label={
                  liked
                    ? `Remove from favorites (${likesCount} likes)`
                    : `Add to favorites (${likesCount} likes)`
                }
                aria-pressed={liked}
              >
                <Heart
                  className={`h-4 w-4 flex-shrink-0 ${liked ? "text-rose-500 fill-rose-500" : "text-muted-foreground"}`}
                />
                {event.eventLikes}
              </button>

              <Link
                to={`/events/${event._id}`}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform transition-colors duration-200 hover:bg-primary/90 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
                onClick={(e) => e.stopPropagation()}
                aria-label={`Apply to ${event.eventTitle}`}
              >
                Apply
              </Link>

              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-transform transition-colors duration-200 hover:bg-background/80 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  const url = `${window.location.origin}/events/${event._id}`;
                  try {
                    if (navigator.share) {
                      await navigator.share({
                        title: event.eventTitle,
                        url,
                      });
                      return;
                    }
                    if (navigator.clipboard) {
                      await navigator.clipboard.writeText(url);
                      showToast("Event link copied to clipboard!");
                    }
                  } catch {
                    // no-op
                  }
                }}
                aria-label={`Share ${event.eventTitle}`}
              >
                <Share2 className="h-4 w-4 flex-shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </Link>

      <AlertDialog
        isOpen={showLoginAlert}
        onClose={() => setShowLoginAlert(false)}
        onConfirm={() => {
          setShowLoginAlert(false);
          navigate("/login");
        }}
        title="Login Required"
        description="Join our community to like events and show your support! Create an account or login to continue."
        confirmText="Login Now"
        cancelText="Maybe Later"
      />
    </>
  );
}

// Memoize component to prevent unnecessary re-renders when parent updates
export default memo(EventCard);
