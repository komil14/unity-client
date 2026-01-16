import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Clock,
  MapPin,
  Users,
  Heart,
  Share2,
  BadgeCheck,
  Eye,
} from "lucide-react";
import { useCheckAuthQuery } from "../../services/authApi";
import {
  useGetEventByIdQuery,
  useGetEventsQuery,
} from "../../services/eventsApi";
import { useJoinEventMutation } from "../../services/applicationsApi";
import {
  useToggleLikeMutation,
  useCheckLikesBatchQuery,
} from "../../services/likesApi";
import { imageUrlFromFilename } from "../../../libs/shared/ui";
import { AlertDialog } from "../../../libs/components/ui/alert-dialog";
import { useToast } from "../../../libs/components/ui/toast";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  return formatter.format(date);
}

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function isUpcoming(dateValue: string): boolean {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() > Date.now();
}

export default function EventDetailPage() {
  const { id } = useParams();
  const eventId = id ?? "";
  const navigate = useNavigate();

  // Check if current user is an organizer
  const { data: authData } = useCheckAuthQuery();
  const isOrganizer = authData?.member?.memberType === "ORG";
  const isAuthenticated = Boolean(authData?.member?._id);

  const [joinEvent, joinState] = useJoinEventMutation();
  const [toggleLike] = useToggleLikeMutation();
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const { showToast } = useToast();

  const { data, isLoading, isError } = useGetEventByIdQuery(eventId, {
    skip: !eventId,
  });

  const { data: likeData } = useCheckLikesBatchQuery(
    { likeRefIds: [eventId], likeGroup: "EVENT" },
    { skip: !eventId }
  );

  const { data: trendingEvents } = useGetEventsQuery({
    page: 1,
    limit: 4,
    order: "eventViews",
    direction: "desc",
  });

  useEffect(() => {
    if (data) {
      setLikesCount(data.eventLikes || 0);
    }
  }, [data?.eventLikes]);

  useEffect(() => {
    if (likeData) {
      setIsLiked(likeData.likedRefIds.includes(eventId));
    }
  }, [likeData, eventId]);

  const handleLike = async () => {
    if (!eventId) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowLoginAlert(true);
      return;
    }

    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      await toggleLike({ likeRefId: eventId, likeGroup: "EVENT" }).unwrap();

      // Show success toast
      showToast(
        wasLiked
          ? "Event removed from your favorites!"
          : "Event added to your favorites!"
      );
    } catch (err) {
      // Revert on error
      setIsLiked(wasLiked);
      setLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1));
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data?.eventTitle || "Event",
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (!eventId) {
    return (
      <div className="p-4">
        <div className="text-destructive font-semibold">Missing event id.</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-80 bg-muted rounded-lg animate-pulse" />
        <div className="space-y-3">
          <div className="h-8 bg-muted rounded animate-pulse w-2/3" />
          <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-4">
        <div className="text-destructive font-semibold">
          Failed to load event.
        </div>
      </div>
    );
  }

  const img = imageUrlFromFilename(data.eventImages?.[0]);
  const upcoming = isUpcoming(data.eventDate);
  const capacityRemaining = data.eventCapacity - data.eventJoined;

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Top Bar with Back and Create Event buttons */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Back to Events Button */}
            <Link
              to="/events"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-primary hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Link>

            {/* Create Event Button - Only for Organizers */}
            {isOrganizer && (
              <Link
                to="/events/create"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors shadow-md"
              >
                Create Event
                <ExternalLink className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout (70/30) */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* Left Column - Main Content (70%) */}
          <div className="space-y-6">
            {/* Hero Section - Flex Container */}
            <div className="flex flex-col md:flex-row gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
              {/* Left Side - Image with Badges */}
              <div className="relative w-full md:w-1/2 aspect-[4/3] overflow-hidden rounded-xl">
                {img ? (
                  <img
                    src={img}
                    alt={data.eventTitle}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-muted to-muted/50" />
                )}

                {/* Status Badge - Top Left */}
                <div className="absolute top-4 left-4">
                  <div
                    className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur ${
                      upcoming
                        ? "bg-blue-500/90 text-white"
                        : "bg-gray-500/90 text-white"
                    }`}
                  >
                    {upcoming ? "UPCOMING" : "PAST"}
                  </div>
                </div>

                {/* Points Badge - Bottom Right */}
                <div className="absolute bottom-4 right-4">
                  <div className="inline-flex items-center rounded-full bg-primary/90 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                    {data.eventPoints ? `+${data.eventPoints} pts` : "Free"}
                  </div>
                </div>
              </div>

              {/* Right Side - Event Details */}
              <div className="flex-1 space-y-4">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                  {data.eventTitle}
                </h1>

                <div className="space-y-3">
                  {/* Date */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Date</div>
                      <div className="text-sm font-semibold text-foreground">
                        {formatDate(data.eventDate)}
                      </div>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Time</div>
                      <div className="text-sm font-semibold text-foreground">
                        {formatTime(data.eventDate)}
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Location
                      </div>
                      <div className="text-sm font-semibold text-foreground">
                        {data.eventLocation}
                      </div>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Capacity
                      </div>
                      <div className="text-sm font-semibold text-foreground">
                        {data.eventJoined}/{data.eventCapacity} attendees
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Action Bar */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Like and Share Buttons */}
                <div className="flex items-center gap-3">
                  {/* View Count */}
                  <div className="inline-flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-semibold text-foreground">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span>{data.eventViews || 0}</span>
                  </div>

                  {/* Like Button */}
                  <button
                    onClick={handleLike}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                      isLiked
                        ? "bg-primary text-white"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
                    />
                    <span>{likesCount}</span>
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/80 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>

                  {/* Capacity Info */}
                  <div className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {capacityRemaining}
                    </span>{" "}
                    spots left
                  </div>
                </div>

                {/* Apply to Join Button */}
                <button
                  type="button"
                  disabled={
                    joinState.isLoading || !upcoming || capacityRemaining <= 0
                  }
                  onClick={async () => {
                    try {
                      await joinEvent({ eventId }).unwrap();
                    } catch (err) {
                      console.error("Failed to apply:", err);
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                >
                  {joinState.isLoading
                    ? "Applying…"
                    : capacityRemaining <= 0 && upcoming
                    ? "Event Full"
                    : "Apply to Join"}
                </button>
              </div>

              {/* Feedback Messages */}
              {joinState.isSuccess && (
                <div className="mt-4 rounded-lg border border-primary/50 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary text-center">
                  ✓ Application submitted successfully!
                </div>
              )}

              {joinState.isError && (
                <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive text-center">
                  Failed to apply. Please{" "}
                  <Link to="/login" className="underline hover:no-underline">
                    login
                  </Link>{" "}
                  first.
                </div>
              )}
            </div>

            {/* Content Area - Description */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-2xl font-extrabold text-foreground mb-4">
                Description
              </h2>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground">
                  About This Event
                </h3>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {data.eventDesc}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar (30%) */}
          <div className="space-y-6">
            {/* Organizer Card */}
            {data.memberData && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="flex items-center gap-2 text-base font-bold text-foreground mb-4">
                  <Users className="h-4 w-4" />
                  Event Organizer
                </h3>

                <Link
                  to={`/organizers/${data.memberId}`}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-4 hover:opacity-80 transition-opacity"
                >
                  {/* Column 1: Image */}
                  <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-border bg-muted flex-shrink-0">
                    {data.memberData.memberImage ? (
                      <img
                        src={imageUrlFromFilename(data.memberData.memberImage)}
                        alt={data.memberData.memberNick}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-extrabold text-foreground">
                        {data.memberData.memberNick.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Column 2: Name and Role */}
                  <div className="min-w-0">
                    <div className="font-bold text-foreground text-base mb-0.5">
                      {data.memberData.memberNick}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Organizer
                    </div>
                  </div>

                  {/* Column 3: Verified Badge */}
                  {data.memberData.isVerified && (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 px-2.5 py-1">
                      <BadgeCheck className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="text-xs font-semibold">Verified</span>
                    </div>
                  )}
                </Link>
              </div>
            )}

            {/* Trending Events */}
            {trendingEvents && trendingEvents.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="flex items-center gap-2 text-base font-bold text-foreground mb-4">
                  <Eye className="h-4 w-4" />
                  Trending Events
                </h3>

                <div className="space-y-3">
                  {trendingEvents.slice(0, 4).map((event) => (
                    <Link
                      key={event._id}
                      to={`/events/${event._id}`}
                      className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className="aspect-square w-16 overflow-hidden bg-muted flex-shrink-0 rounded-lg border border-border">
                        {event.eventImages?.[0] ? (
                          <img
                            src={imageUrlFromFilename(event.eventImages[0])}
                            alt={event.eventTitle}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-muted to-muted/50" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-foreground line-clamp-2 mb-1">
                          {event.eventTitle}
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {formatDate(event.eventDate)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Heart
                            className={`h-3 w-3 ${
                              event.eventLikes > 0
                                ? "fill-primary text-primary"
                                : ""
                            }`}
                          />
                          <span>{event.eventLikes || 0}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Login Alert Dialog */}
      <AlertDialog
        isOpen={showLoginAlert}
        onClose={() => setShowLoginAlert(false)}
        onConfirm={() => navigate("/login")}
        title="Login Required"
        description="Join our community to like events, apply to activities, and connect with amazing people. Create your account today!"
        confirmText="Go to Login"
        cancelText="Maybe Later"
        variant="primary"
      />
    </div>
  );
}
