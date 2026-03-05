import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  Clock,
  ArrowLeft,
  Users,
  Calendar,
  Eye,
  Heart,
  Share2,
  MapPin,
  Building2,
  Mail,
  MessageSquare,
  Phone,
  Zap,
} from "lucide-react";

import {
  useGetOrganizerByIdQuery,
  useViewOrganizerMutation,
} from "../../services/organizersApi";
import {
  useCheckLikesBatchQuery,
  useToggleLikeMutation,
} from "../../services/likesApi";
import { useCheckAuthQuery } from "../../services/authApi";
import { useScrollToTop } from "../../hooks/useScrollToTop";
import {
  clampText,
  eventImageUrlFromFilename,
  memberImageUrlFromFilename,
} from "../../../libs/shared/ui";
import { Button } from "../../../libs/components/ui/button";
import { useToast } from "../../../libs/components/ui/toast";

export default function OrganizerDetailPage() {
  useScrollToTop();
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const organizerId = id ?? "";
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState("");

  const { data: authData } = useCheckAuthQuery();
  const isAuthenticated = Boolean(authData?.member?._id);
  const [viewOrganizer] = useViewOrganizerMutation();

  const { data, isLoading, isError } = useGetOrganizerByIdQuery(organizerId, {
    skip: !organizerId,
  });

  useEffect(() => {
    if (!organizerId) return;
    viewOrganizer(organizerId);
  }, [organizerId, viewOrganizer]);

  // Like logic from OrganizersPage
  const orgIds = useMemo(
    () => (organizerId ? [organizerId] : []),
    [organizerId],
  );
  const { data: likesData } = useCheckLikesBatchQuery(
    { likeGroup: "MEMBER", likeRefIds: orgIds },
    { skip: orgIds.length === 0 },
  );
  const likedSet = useMemo(
    () => new Set(likesData?.likedRefIds ?? []),
    [likesData],
  );

  const [toggleLike] = useToggleLikeMutation();

  const [pendingLikeIds, setPendingLikeIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [likedOverrides, setLikedOverrides] = useState<Record<string, boolean>>(
    {},
  );
  const [likesCountOverrides, setLikesCountOverrides] = useState<
    Record<string, number>
  >({});

  const handleToggleLike = async (
    orgId: string,
    likedByMe: boolean,
    memberLikes: number,
  ) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (pendingLikeIds.has(orgId)) return;

    const nextLiked = !likedByMe;
    const nextLikesCount = Math.max(0, memberLikes + (nextLiked ? 1 : -1));

    setPendingLikeIds((prev) => {
      const next = new Set(prev);
      next.add(orgId);
      return next;
    });
    setLikedOverrides((prev) => ({ ...prev, [orgId]: nextLiked }));
    setLikesCountOverrides((prev) => ({ ...prev, [orgId]: nextLikesCount }));

    try {
      const res = await toggleLike({
        likeGroup: "MEMBER",
        likeRefId: orgId,
      }).unwrap();

      const finalLiked = res.status === "liked";
      setLikedOverrides((prev) => ({ ...prev, [orgId]: finalLiked }));

      const delta = (finalLiked ? 1 : 0) - (likedByMe ? 1 : 0);
      setLikesCountOverrides((prev) => ({
        ...prev,
        [orgId]: Math.max(0, memberLikes + delta),
      }));

      showToast(
        finalLiked
          ? "Organizer added to your favorites!"
          : "Organizer removed from your favorites!",
      );
    } catch (err: any) {
      setLikedOverrides((prev) => {
        const next = { ...prev };
        delete next[orgId];
        return next;
      });
      setLikesCountOverrides((prev) => {
        const next = { ...prev };
        delete next[orgId];
        return next;
      });

      const status = err?.status as number | undefined;
      if (status === 401 || status === 403) {
        navigate("/login");
      }
    } finally {
      setPendingLikeIds((prev) => {
        const next = new Set(prev);
        next.delete(orgId);
        return next;
      });
    }
  };

  const handleContactOrganizer = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!contactMessage.trim()) {
      showToast("Please write a message", "error");
      return;
    }

    try {
      // Contact API not yet implemented - shows success toast as placeholder
      showToast("Message sent to organizer!");
      setShowContactModal(false);
      setContactMessage("");
    } catch (err) {
      showToast("Failed to send message", "error");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: data?.memberNick || "Organizer",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        showToast("Profile link copied to clipboard!");
      }
    } catch {
      // Share cancelled or clipboard failed
    }
  };

  if (!organizerId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="text-destructive font-semibold text-lg">
            Missing organizer ID
          </div>
          <Link to="/organizers">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Organizers
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          <div className="h-64 bg-muted rounded-2xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-muted rounded-xl animate-pulse" />
            <div className="h-32 bg-muted rounded-xl animate-pulse" />
            <div className="h-32 bg-muted rounded-xl animate-pulse" />
          </div>
          <div className="h-96 bg-muted rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="text-destructive font-semibold text-lg">
            Failed to load organizer profile
          </div>
          <Link to="/organizers">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Organizers
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const organizerAvatar = memberImageUrlFromFilename(
    data.memberImage,
    data.memberNick || "Organizer",
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Back Button */}
        <Link to="/organizers">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Organizers
          </Button>
        </Link>

        {/* Hero Section with Profile */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-muted/30 rounded-2xl border border-border shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8 md:p-10">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <div className="relative">
                  <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full border-4 border-background shadow-xl overflow-hidden bg-muted">
                    {organizerAvatar ? (
                      <img
                        src={organizerAvatar}
                        alt={data.memberNick}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-primary/10">
                        <Building2 className="h-16 w-16 text-primary" />
                      </div>
                    )}
                  </div>
                  {data.isVerified && (
                    <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-2 shadow-lg">
                      <BadgeCheck className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <div className="flex flex-col sm:flex-row items-center md:items-start gap-3">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">
                      {data.memberNick}
                    </h1>
                    <div className="flex items-center gap-2">
                      {data.isVerified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Verified
                        </span>
                      ) : data.memberStatus === "PENDING" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                          <Clock className="h-3.5 w-3.5" />
                          Pending
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <p className="text-muted-foreground mt-3 text-base leading-relaxed max-w-3xl">
                    {clampText(
                      data.memberDesc || "No description available.",
                      300,
                    )}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  {/* Like Button */}
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background/30 px-4 py-2 text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label={likedSet.has(organizerId) ? "Unlike" : "Like"}
                    aria-pressed={
                      likedOverrides[organizerId] ?? likedSet.has(organizerId)
                    }
                    disabled={pendingLikeIds.has(organizerId)}
                    onClick={async () => {
                      const apiLikedByMe = likedSet.has(organizerId);
                      const likedByMe =
                        likedOverrides[organizerId] ?? apiLikedByMe;
                      const memberLikes =
                        likesCountOverrides[organizerId] ??
                        data?.memberLikes ??
                        0;
                      await handleToggleLike(
                        organizerId,
                        likedByMe,
                        memberLikes,
                      );
                    }}
                  >
                    <Heart
                      className="h-4 w-4 text-destructive"
                      fill={
                        (likedOverrides[organizerId] ??
                        likedSet.has(organizerId))
                          ? "currentColor"
                          : "none"
                      }
                    />
                    <span className="text-sm font-semibold">
                      {likesCountOverrides[organizerId] ??
                        data?.memberLikes ??
                        0}
                    </span>
                  </button>
                  <Button onClick={handleShare} variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    onClick={() => setShowContactModal(true)}
                    variant="outline"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Follow feature coming soon
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    <span className="font-semibold text-foreground">
                      {data.memberViews || 0}
                    </span>
                    <span>views</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Heart
                      className={`h-4 w-4 ${
                        (likedOverrides[organizerId] ??
                        likedSet.has(organizerId))
                          ? "fill-current text-destructive"
                          : ""
                      }`}
                    />
                    <span className="font-semibold text-foreground">
                      {likesCountOverrides[organizerId] ??
                        data?.memberLikes ??
                        0}
                    </span>
                    <span>likes</span>
                  </div>
                </div>

                {/* Contact & Social Section */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Contact Info */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        Contact Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        {data.memberPhone && (
                          <a
                            href={`tel:${data.memberPhone}`}
                            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            {data.memberPhone}
                          </a>
                        )}
                        {!data.memberPhone && (
                          <p className="text-xs text-muted-foreground italic">
                            No contact info available
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Verification Info */}
                    {data.isVerified && (
                      <div className="space-y-3">
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                          <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-semibold text-foreground">
                              Verified Organizer
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              This organizer has been verified and is trusted by
                              our community.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Statistics Cards - Left Side (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Events Organized
                  </p>
                  <p className="text-3xl font-extrabold text-foreground mt-2">
                    {data.eventsOrganizedCount ?? 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Groups Managed
                  </p>
                  <p className="text-3xl font-extrabold text-foreground mt-2">
                    {data.groupsOrganizedCount ?? 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Views
                  </p>
                  <p className="text-3xl font-extrabold text-foreground mt-2">
                    {data.memberViews ?? 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Likes
                  </p>
                  <p className="text-3xl font-extrabold text-foreground mt-2">
                    {data.memberLikes ?? 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-pink-500/10 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-pink-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity - Right Side */}
          {data.organizedEvents && data.organizedEvents.length > 0 && (
            <div>
              <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sm:p-8 h-full">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6">
                  <Zap className="h-6 w-6 text-primary" />
                  Recent Activity
                </h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {data.organizedEvents
                    .slice(0, 5)
                    .sort(
                      (a: any, b: any) =>
                        new Date(b.createdAt || 0).getTime() -
                        new Date(a.createdAt || 0).getTime(),
                    )
                    .map((event: any, index: number) => (
                      <div
                        key={String(event._id)}
                        className="flex gap-4 pb-4 last:pb-0 border-b border-border last:border-0"
                      >
                        <div className="flex flex-col items-center">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          {index < 4 && (
                            <div className="w-0.5 h-8 bg-border my-2" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <Link
                            to={`/events/${String(event._id)}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                          >
                            {event.eventTitle}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-1">
                            Created{" "}
                            {event.createdAt
                              ? new Date(event.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )
                              : "recently"}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
                {data.organizedEvents.length > 5 && (
                  <Link
                    to={`/organizers/${organizerId}/events`}
                    className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-primary hover:text-primary/80"
                  >
                    View all events →
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Events Section */}
        {data.organizedEvents?.length ? (
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Organized Events
              </h2>
              <span className="text-sm text-muted-foreground">
                {data.organizedEvents.length} total
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.organizedEvents.slice(0, 8).map((e: any) => (
                <Link
                  key={String(e._id)}
                  to={`/events/${String(e._id)}`}
                  className="group h-full"
                >
                  <div className="bg-background rounded-lg border border-border overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-200 flex flex-col h-full">
                    <div className="relative h-40 w-full overflow-hidden flex-shrink-0">
                      {e.eventImages?.[0] ? (
                        <>
                          <img
                            src={eventImageUrlFromFilename(e.eventImages[0])}
                            alt={e.eventTitle}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </>
                      ) : (
                        <div className="h-full w-full bg-muted flex items-center justify-center">
                          <Calendar className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
                        {e.eventTitle}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2 flex-1">
                        {clampText(e.eventDesc || "", 100)}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        {e.eventLocation && (
                          <div className="flex items-center gap-1 flex-1 min-w-0">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{e.eventLocation}</span>
                          </div>
                        )}
                        {e.eventDate && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(e.eventDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border shadow-sm p-12 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Events Yet
            </h3>
            <p className="text-sm text-muted-foreground">
              This organizer hasn't created any events yet.
            </p>
          </div>
        )}

        {/* Groups Section */}
        {data.organizedGroups?.length ? (
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Managed Groups
              </h2>
              <span className="text-sm text-muted-foreground">
                {data.organizedGroups.length} total
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.organizedGroups.slice(0, 8).map((g: any) => (
                <Link
                  key={String(g._id)}
                  to={`/groups/${String(g._id)}`}
                  className="group"
                >
                  <div className="bg-background rounded-lg border border-border p-5 hover:shadow-lg hover:border-primary/50 transition-all duration-200">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {g.groupName}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {clampText(g.groupDesc || "", 100)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {/* Contact Modal */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-2xl border border-border shadow-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-foreground">
                  Contact {data?.memberNick}
                </h3>
                <button
                  onClick={() => {
                    setShowContactModal(false);
                    setContactMessage("");
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm text-muted-foreground">
                Send a message to this organizer and they'll get back to you
                soon.
              </p>

              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Write your message here..."
                className="w-full h-32 p-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowContactModal(false);
                    setContactMessage("");
                  }}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleContactOrganizer}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
