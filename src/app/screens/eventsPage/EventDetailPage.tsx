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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCheckAuthQuery } from "../../services/authApi";
import {
  useGetEventByIdQuery,
  useGetEventsQuery,
  useViewEventMutation,
} from "../../services/eventsApi";
import {
  useJoinEventMutation,
  useGetEventAttendeesQuery,
  useCheckApplicationStatusQuery,
  useCancelApplicationMutation,
} from "../../services/applicationsApi";
import {
  useToggleLikeMutation,
  useCheckLikesBatchQuery,
} from "../../services/likesApi";
import {
  memberImageUrlFromFilename,
  eventImageUrlFromFilename,
} from "../../../libs/shared/ui";
import { AlertDialog } from "../../../libs/components/ui/alert-dialog";
import { useToast } from "../../../libs/components/ui/toast";
import Comments from "./Comments";

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
  const [viewEvent] = useViewEventMutation();
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [attendeeLimit, setAttendeeLimit] = useState(8);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const { showToast } = useToast();

  const { data, isLoading, isError } = useGetEventByIdQuery(eventId, {
    skip: !eventId,
  });

  const { data: likeData } = useCheckLikesBatchQuery(
    { likeRefIds: [eventId], likeGroup: "EVENT" },
    { skip: !eventId },
  );

  // Fetch events by same organizer (ongoing only)
  const { data: organizerEvents } = useGetEventsQuery(
    {
      page: 1,
      limit: 4,
      memberId: data?.memberId,
    },
    { skip: !data?.memberId || !eventId },
  );

  // Fetch events at same location (ongoing only)
  const { data: locationEvents } = useGetEventsQuery(
    {
      page: 1,
      limit: 4,
      search: data?.eventLocation,
    },
    { skip: !data?.eventLocation || !eventId },
  );

  const { data: trendingEvents } = useGetEventsQuery({
    page: 1,
    limit: 4,
    order: "eventViews",
    direction: "desc",
  });

  const { data: attendees, isLoading: attendeesLoading } =
    useGetEventAttendeesQuery(
      { eventId, limit: attendeeLimit },
      { skip: !eventId },
    );

  const { data: applicationStatus, refetch: refetchApplicationStatus } =
    useCheckApplicationStatusQuery(eventId, {
      skip: !eventId || !isAuthenticated,
    });

  const [cancelApplication, cancelState] = useCancelApplicationMutation();

  // Track view when event detail page loads
  useEffect(() => {
    if (!eventId) return;
    viewEvent(eventId);
  }, [eventId, viewEvent]);

  // Initialize likes count from event data
  useEffect(() => {
    if (data?.eventLikes !== undefined) {
      setLikesCount(data.eventLikes);
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

    // Optimistic update
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount((prev) => (wasLiked ? Math.max(0, prev - 1) : prev + 1));

    try {
      const res = await toggleLike({
        likeRefId: eventId,
        likeGroup: "EVENT",
      }).unwrap();

      // Confirm with server response
      const confirmed = res.status === "liked";
      setIsLiked(confirmed);

      // Show success toast
      showToast(
        confirmed
          ? "Event added to your favorites!"
          : "Event removed from your favorites!",
      );
    } catch (err: any) {
      // Revert on error
      setIsLiked(wasLiked);
      setLikesCount((prev) =>
        wasLiked ? Math.max(0, prev + 1) : Math.max(0, prev - 1),
      );

      const status = err?.status;
      if (status === 401 || status === 403) {
        navigate("/login");
      } else {
        showToast("Failed to update favorite. Please try again.", "error");
      }
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: data?.eventTitle || "Event",
          url,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        showToast("Event link copied to clipboard!");
      }
    } catch (err) {
      // User cancelled share or clipboard failed
      console.log("Share cancelled or failed", err);
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

  // const img = eventImageUrlFromFilename(data.eventImages?.[0]);
  const upcoming = isUpcoming(data.eventDate || "");
  const capacityRemaining = (data.eventCapacity || 0) - (data.eventJoined || 0);
  const totalAttendeesCount = data.eventJoined || 0;
  const hasMoreAttendees =
    totalAttendeesCount > attendeeLimit &&
    (attendees?.length || 0) >= attendeeLimit;
  const locationQuery = encodeURIComponent(data.eventLocation || "");
  const mapEmbedUrl = locationQuery
    ? `https://www.google.com/maps?q=${locationQuery}&output=embed`
    : undefined;
  const directionsUrl = locationQuery
    ? `https://www.google.com/maps/dir/?api=1&destination=${locationQuery}`
    : undefined;

  const applicationStatusLabel = applicationStatus?.applicationStatus;
  const activeApplication =
    applicationStatusLabel === "PENDING" ||
    applicationStatusLabel === "APPROVED";
  const alreadyApplied = activeApplication;
  const canCancel = activeApplication;

  // Handle image gallery navigation
  const images = (data.eventImages || []).map((img) =>
    eventImageUrlFromFilename(img),
  );
  const totalImages = images.length;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  // Combine similar events: 2 by organizer + 2 by location, or 4 by organizer if not enough location events
  const similarEvents = (() => {
    if (!data) return [];

    const filteredOrganizerEvents = (organizerEvents?.items || [])
      .filter((e) => e._id !== eventId && isUpcoming(e.eventDate || ""))
      .slice(0, 4);

    const filteredLocationEvents = (locationEvents?.items || [])
      .filter(
        (e) =>
          e._id !== eventId &&
          e.memberId !== data.memberId &&
          isUpcoming(e.eventDate || ""),
      )
      .slice(0, 2);

    // Prefer 2 organizer + 2 location, otherwise fill with organizer events
    if (filteredLocationEvents.length >= 2) {
      return [
        ...filteredOrganizerEvents.slice(0, 2),
        ...filteredLocationEvents.slice(0, 2),
      ];
    }

    return filteredOrganizerEvents.slice(0, 4);
  })();

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
            {/* Event Title */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground break-words">
                {data.eventTitle}
              </h1>
            </div>

            {/* Hero Section - Flex Container */}
            <div className="flex flex-col md:flex-row gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
              {/* Left Side - Image Gallery with Badges */}
              <div className="relative w-full md:w-1/2 aspect-[4/3] overflow-hidden rounded-xl group">
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[currentImageIndex]}
                      alt={`${data.eventTitle} - Image ${currentImageIndex + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300"
                    />

                    {/* Navigation Arrows - Only show if multiple images */}
                    {totalImages > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
                          aria-label="Next image"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}

                    {/* Image Counter */}
                    {totalImages > 1 && (
                      <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg backdrop-blur">
                        {currentImageIndex + 1} / {totalImages}
                      </div>
                    )}

                    {/* Image Thumbnails - Bottom */}
                    {totalImages > 1 && (
                      <div className="absolute bottom-4 left-4 right-12 flex gap-2 overflow-x-auto">
                        {images.map((image, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                              idx === currentImageIndex
                                ? "border-primary"
                                : "border-transparent opacity-60 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={image}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-muted to-muted/50" />
                )}

                {/* Status Badge - Top Left */}
                <div className="absolute top-4 left-4">
                  <div
                    className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur ${
                      upcoming
                        ? "bg-primary/90 text-white"
                        : "bg-gray-500/70 text-white"
                    }`}
                  >
                    {upcoming ? "UPCOMING" : "PAST"}
                  </div>
                </div>

                {/* Points Badge - Top Right */}
                <div className="absolute top-4 right-4">
                  <div className="inline-flex items-center rounded-full bg-primary/90 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                    {data.eventPoints ? `+${data.eventPoints} pts` : "Free"}
                  </div>
                </div>
              </div>

              {/* Right Side - Event Details */}
              <div className="flex-1 space-y-4">
                <div className="space-y-3">
                  {/* Date */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Date</div>
                      <div className="text-sm font-semibold text-foreground">
                        {formatDate(data.eventDate || "")}
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
                        {formatTime(data.eventDate || "")}
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

                  {/* Application Status */}
                  {applicationStatusLabel && (
                    <div
                      className={`flex items-center gap-3 rounded-lg border p-3 ${
                        applicationStatusLabel === "PENDING"
                          ? "bg-yellow-500/5 border-yellow-500/30"
                          : applicationStatusLabel === "APPROVED"
                            ? "bg-green-500/5 border-green-500/30"
                            : applicationStatusLabel === "REJECTED"
                              ? "bg-red-500/5 border-red-500/30"
                              : "bg-gray-500/5 border-gray-500/30"
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                        <span className="relative flex h-3 w-3">
                          {applicationStatusLabel === "PENDING" && (
                            <>
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                            </>
                          )}
                          {applicationStatusLabel === "APPROVED" && (
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                          )}
                          {applicationStatusLabel === "REJECTED" && (
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                          )}
                          {applicationStatusLabel === "CANCELED" && (
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-500"></span>
                          )}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Application Status
                        </div>
                        <div
                          className={`text-sm font-bold ${
                            applicationStatusLabel === "PENDING"
                              ? "text-yellow-600 dark:text-yellow-400"
                              : applicationStatusLabel === "APPROVED"
                                ? "text-green-600 dark:text-green-400"
                                : applicationStatusLabel === "REJECTED"
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {applicationStatusLabel}
                        </div>
                      </div>
                    </div>
                  )}
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
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      isLiked
                        ? "bg-primary text-white hover:bg-primary/90"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                    aria-label={
                      isLiked
                        ? `Remove from favorites (${likesCount} likes)`
                        : `Add to favorites (${likesCount} likes)`
                    }
                    aria-pressed={isLiked}
                    title={
                      !isAuthenticated
                        ? "Login to like this event"
                        : isLiked
                          ? "Unlike this event"
                          : "Like this event"
                    }
                  >
                    <Heart
                      className={`h-4 w-4 transition-all ${isLiked ? "fill-current" : ""}`}
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

                {/* Apply / Cancel */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={
                      joinState.isLoading ||
                      !upcoming ||
                      capacityRemaining <= 0 ||
                      alreadyApplied ||
                      !isAuthenticated ||
                      isOrganizer
                    }
                    onClick={async () => {
                      try {
                        console.log("Attempting to join event:", eventId);
                        const result = await joinEvent({ eventId }).unwrap();
                        console.log("Join successful:", result);
                        showToast("Application submitted successfully!");
                        // Refetch to update status
                        setTimeout(() => {
                          refetchApplicationStatus();
                        }, 500);
                      } catch (err: any) {
                        console.error("Full error object:", err);
                        const msg =
                          err?.data?.message ||
                          "Failed to apply. Please try again.";
                        showToast(msg, "error");
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                  >
                    {joinState.isLoading
                      ? "Applying…"
                      : !isAuthenticated
                        ? "Login to Apply"
                        : isOrganizer
                          ? "Organizers Cannot Apply"
                          : !upcoming
                            ? "Event Closed"
                            : capacityRemaining <= 0
                              ? "Event Full"
                              : alreadyApplied
                                ? "Already Applied"
                                : "Apply to Join"}
                  </button>

                  {canCancel && (
                    <button
                      type="button"
                      onClick={() => setShowCancelConfirm(true)}
                      disabled={cancelState.isLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-destructive px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {cancelState.isLoading
                        ? "Canceling…"
                        : "Cancel Application"}
                    </button>
                  )}
                </div>
              </div>

              {/* Feedback Messages */}
              {joinState.isSuccess && (
                <div className="mt-4 rounded-lg border border-primary/50 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary text-center">
                  ✓ Application submitted successfully!
                </div>
              )}

              {joinState.isError && (
                <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive text-center">
                  {isOrganizer
                    ? "Organizers cannot apply for events."
                    : "Failed to apply. Please try again."}
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

            {/* Comments Section */}
            <Comments eventId={eventId} eventTitle={data.eventTitle} />

            {/* Location Map */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-extrabold text-foreground">
                  Location
                </h2>
                {directionsUrl && (
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Get Directions
                  </a>
                )}
              </div>

              {mapEmbedUrl ? (
                <div className="space-y-3">
                  <div className="aspect-video rounded-xl overflow-hidden border border-border">
                    <iframe
                      title="Event location map"
                      src={mapEmbedUrl}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="h-full w-full border-0"
                      allowFullScreen
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {data.eventLocation}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Location map unavailable. Address:{" "}
                  {data.eventLocation || "N/A"}
                </div>
              )}
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
                        src={memberImageUrlFromFilename(
                          data.memberData.memberImage,
                        )}
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

                  {/* Column 3: Verified/Pending Badge */}
                  {data.memberData.isVerified ? (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 text-primary px-2.5 py-1">
                      <BadgeCheck className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="text-xs font-semibold">Verified</span>
                    </div>
                  ) : data.memberData.memberStatus === "PENDING" ? (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 text-yellow-700 px-2.5 py-1">
                      <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="text-xs font-semibold">Pending</span>
                    </div>
                  ) : null}
                </Link>
              </div>
            )}

            {/* Attendees Card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                  <Users className="h-4 w-4" />
                  Attendees
                </h3>
                <span className="text-xs font-semibold text-muted-foreground">
                  {totalAttendeesCount} going
                </span>
              </div>

              {attendeesLoading ? (
                <div className="flex justify-center py-6">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
                </div>
              ) : attendees && attendees.length > 0 ? (
                <div className="space-y-4">
                  {/* Avatar Stack */}
                  <div className="flex -space-x-3">
                    {attendees.slice(0, 5).map((attendee) => (
                      <div
                        key={attendee._id}
                        className="h-10 w-10 rounded-full border-2 border-card bg-muted overflow-hidden flex items-center justify-center text-xs font-semibold text-foreground"
                        title={attendee.memberData?.memberNick}
                      >
                        {attendee.memberData?.memberImage ? (
                          <img
                            src={memberImageUrlFromFilename(
                              attendee.memberData.memberImage,
                            )}
                            alt={attendee.memberData?.memberNick}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          attendee.memberData?.memberNick
                            ?.charAt(0)
                            .toUpperCase()
                        )}
                      </div>
                    ))}
                    {totalAttendeesCount > 5 && (
                      <div className="h-10 w-10 rounded-full border-2 border-card bg-muted text-xs font-semibold text-muted-foreground flex items-center justify-center">
                        +{Math.max(0, totalAttendeesCount - 5)}
                      </div>
                    )}
                  </div>

                  {/* List */}
                  <div className="space-y-3">
                    {attendees.map((attendee) => (
                      <div
                        key={attendee._id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/60 transition-colors"
                      >
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-muted border border-border flex-shrink-0">
                          {attendee.memberData?.memberImage ? (
                            <img
                              src={memberImageUrlFromFilename(
                                attendee.memberData.memberImage,
                              )}
                              alt={attendee.memberData.memberNick}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs font-semibold text-foreground">
                              {attendee.memberData?.memberNick
                                ?.charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-foreground truncate">
                            {attendee.memberData?.memberNick}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Approved attendee
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {hasMoreAttendees && (
                    <button
                      onClick={() => setAttendeeLimit((prev) => prev + 8)}
                      className="w-full mt-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                    >
                      Show more attendees
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No approved attendees yet.
                </div>
              )}
            </div>

            {/* Similar Events */}
            {similarEvents && similarEvents.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="flex items-center gap-2 text-base font-bold text-foreground mb-4">
                  <Users className="h-4 w-4" />
                  Similar Events
                </h3>

                <div className="space-y-3">
                  {similarEvents.map((event) => (
                    <Link
                      key={event._id}
                      to={`/events/${event._id}`}
                      className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className="aspect-square w-16 overflow-hidden bg-muted flex-shrink-0 rounded-lg border border-border">
                        {event.eventImages?.[0] ? (
                          <img
                            src={eventImageUrlFromFilename(
                              event.eventImages[0],
                            )}
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
                          {formatDate(event.eventDate || "")}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Heart
                            className={`h-3 w-3 ${
                              (event.eventLikes || 0) > 0
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

            {/* Trending Events */}
            {trendingEvents?.items && trendingEvents.items.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="flex items-center gap-2 text-base font-bold text-foreground mb-4">
                  <Eye className="h-4 w-4" />
                  Trending Events
                </h3>

                <div className="space-y-3">
                  {trendingEvents.items.slice(0, 4).map((event) => (
                    <Link
                      key={event._id}
                      to={`/events/${event._id}`}
                      className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className="aspect-square w-16 overflow-hidden bg-muted flex-shrink-0 rounded-lg border border-border">
                        {event.eventImages?.[0] ? (
                          <img
                            src={eventImageUrlFromFilename(
                              event.eventImages[0],
                            )}
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
                          {formatDate(event.eventDate || "")}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Heart
                            className={`h-3 w-3 ${
                              (event.eventLikes || 0) > 0
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

      {/* Cancel Application Dialog */}
      <AlertDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={async () => {
          try {
            await cancelApplication({ eventId }).unwrap();
            showToast("Application canceled");
            setShowCancelConfirm(false);
            refetchApplicationStatus();
          } catch (err: any) {
            const msg = err?.data?.message || "Failed to cancel application";
            showToast(msg, "error");
          }
        }}
        title="Cancel your application?"
        description="This will withdraw you from the event. You can re-apply later if spots remain."
        confirmText="Yes, cancel"
        cancelText="Keep Application"
        variant="destructive"
      />
    </div>
  );
}
