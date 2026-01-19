import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  DollarSign,
  Eye,
  Heart,
  MapPin,
  Share2,
  Users,
} from "lucide-react";

import type { EventDto } from "../../services/eventsApi";
import { useToggleLikeMutation } from "../../services/likesApi";
import { useCheckAuthQuery } from "../../services/authApi";
import { imageUrlFromFilename } from "../../../libs/shared/ui";
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

export default function EventCard({
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
  const img = imageUrlFromFilename(event.eventImages?.[0]);
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

  const priceLabel = event.eventPoints ? `+${event.eventPoints} pts` : "Free";

  return (
    <Link to={`/events/${event._id}`} className="block h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card/40">
        <div className="relative">
          <div className="relative aspect-video w-full overflow-hidden">
            {img ? (
              <img
                src={img}
                alt={event.eventTitle}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="h-full w-full bg-muted" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent" />

            <div className="absolute left-2 top-2">
              <div className="inline-flex items-center rounded-full border border-border bg-background/60 px-2 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur">
                {upcoming ? "UPCOMING" : "PAST"}
              </div>
            </div>

            <div className="absolute right-2 top-2">
              <div className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur">
                <DollarSign className="h-3 w-3" />
                {priceLabel}
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col p-3">
            <div
              className="text-sm font-extrabold tracking-tight text-foreground"
              style={clampStyle(1)}
              title={event.eventTitle}
            >
              {event.eventTitle}
            </div>

            <div className="mt-2">
              <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                #Event
              </span>
            </div>

            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="min-w-0 flex-1 truncate">
                  {event.eventLocation}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span className="truncate text-xs">
                  {formatDateTime(event.eventDate || "")}
                </span>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="flex items-center justify-center gap-1 rounded-[var(--radius-lg)] border border-border bg-background/30 px-2 py-2">
                <Eye className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="text-xs font-semibold text-foreground">
                  {event.eventViews}
                </span>
              </div>
              <div className="flex items-center justify-center gap-1 rounded-[var(--radius-lg)] border border-border bg-background/30 px-2 py-2">
                <Users className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="text-xs font-semibold text-foreground">
                  {event.eventJoined}/{event.eventCapacity}
                </span>
              </div>
            </div>

            <div className="mt-2 rounded-[var(--radius-lg)] border border-border bg-background/20 p-2 text-xs text-muted-foreground">
              <div className="truncate" title={event.eventDesc}>
                {event.eventDesc}
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between gap-2 pt-3">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-border bg-background/40 px-3 py-2 text-sm text-foreground"
                disabled={toggleState.isLoading}
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (!isAuthenticated) {
                    setShowLoginAlert(true);
                    return;
                  }

                  try {
                    const res = await toggleLike({
                      likeGroup: "EVENT",
                      likeRefId: event._id,
                    }).unwrap();

                    setLiked(res.status === "liked");

                    setLikesCount((prev) => {
                      const delta = res.status === "liked" ? 1 : -1;
                      return Math.max(0, prev + delta);
                    });

                    // Show success toast
                    showToast(
                      res.status === "liked"
                        ? "Event added to your favorites!"
                        : "Event removed from your favorites!",
                    );
                  } catch (err: any) {
                    const status = err?.status;
                    if (status === 401 || status === 403) {
                      navigate("/login");
                    }
                  }
                }}
                aria-label="Likes"
                aria-pressed={liked}
              >
                <Heart
                  className="h-4 w-4 text-destructive flex-shrink-0"
                  fill={liked ? "currentColor" : "none"}
                />
                <span className="text-xs font-semibold">{likesCount}</span>
              </button>

              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-lg)] border border-border bg-background/40 text-foreground"
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
                    }
                  } catch {
                    // no-op
                  }
                }}
                aria-label="Share"
              >
                <Share2 className="h-4 w-4 flex-shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>

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
    </Link>
  );
}
