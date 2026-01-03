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
import { imageUrlFromFilename } from "../shared/ui";

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
  const img = imageUrlFromFilename(event.eventImages?.[0]);
  const upcoming = isUpcoming(event.eventDate);

  const [likesCount, setLikesCount] = useState<number>(event.eventLikes);
  const [liked, setLiked] = useState<boolean>(Boolean(likedByMe));

  useEffect(() => {
    setLiked(Boolean(likedByMe));
  }, [event._id, likedByMe]);

  useEffect(() => {
    setLikesCount(event.eventLikes);
  }, [event.eventLikes]);

  const priceLabel = event.eventPoints ? `+${event.eventPoints} pts` : "Free";

  return (
    <Link to={`/events/${event._id}`} className="block h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card/40">
        <div className="relative">
          <div className="relative aspect-[16/11] w-full overflow-hidden">
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

            <div className="absolute left-3 top-3">
              <div className="inline-flex items-center rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur">
                {upcoming ? "UPCOMING" : "PAST"}
              </div>
            </div>

            <div className="absolute right-3 top-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur">
                <DollarSign className="h-4 w-4" />
                {priceLabel}
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col p-4">
            <div
              className="text-xl font-extrabold tracking-tight text-foreground"
              style={clampStyle(1)}
              title={event.eventTitle}
            >
              {event.eventTitle}
            </div>

            <div className="mt-3">
              <span className="inline-flex items-center rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
                #Event
              </span>
            </div>

            <div className="mt-4 space-y-2 text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="min-w-0 flex-1 truncate">
                  {event.eventLocation}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDateTime(event.eventDate)}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="flex items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-border bg-background/30 px-3 py-3">
                <Eye className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">
                  {event.eventViews}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-border bg-background/30 px-3 py-3">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">
                  {event.eventJoined}/{event.eventCapacity}
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-[var(--radius-lg)] border border-border bg-background/20 p-3 text-sm text-muted-foreground">
              <div className="truncate" title={event.eventDesc}>
                {event.eventDesc}
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between pt-5">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-4 py-3 text-foreground"
                disabled={toggleState.isLoading}
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();

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
                  className="h-5 w-5 text-destructive"
                  fill={liked ? "currentColor" : "none"}
                />
                <span className="font-semibold">{likesCount}</span>
              </button>

              <button
                type="button"
                className="inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] border border-border bg-background/40 text-foreground"
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
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
