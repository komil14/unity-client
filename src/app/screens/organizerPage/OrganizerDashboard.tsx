import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Calendar,
  Users,
  Eye,
  Heart,
  TrendingUp,
  Settings,
  Plus,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Edit,
  MapPin,
  Clock,
  MoreVertical,
  Trash2,
  Copy,
  Share2,
  UserCheck,
} from "lucide-react";
import { useCheckAuthQuery } from "../../services/authApi";
import {
  useGetEventsQuery,
  useDeleteEventMutation,
  useDuplicateEventMutation,
} from "../../services/eventsApi";
import { eventImageUrlFromFilename } from "../../../libs/shared/ui";
import AttendeeListModal from "../../components/AttendeeListModal";
import { AlertDialog } from "../../../libs/components/ui/alert-dialog";
import { useToast } from "../../../libs/components/ui/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../libs/components/ui/dropdown-menu";
import { Button } from "../../../libs/components/ui/button";

type TabType = "events" | "analytics" | "settings";

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data: authData, isLoading: authLoading } = useCheckAuthQuery();
  const [activeTab, setActiveTab] = useState<TabType>("events");
  const [attendeeModal, setAttendeeModal] = useState<{
    eventId: string;
    eventTitle: string;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    eventId: string;
    eventTitle: string;
  } | null>(null);

  const [deleteEvent] = useDeleteEventMutation();
  const [duplicateEvent, { isLoading: isDuplicating }] =
    useDuplicateEventMutation();

  const member = authData?.member;
  const isOrganizer = member?.memberType === "ORG";

  // Fetch organizer's events
  const { data: eventsData, isLoading: eventsLoading } = useGetEventsQuery(
    isOrganizer ? { memberId: member?._id } : undefined,
    { skip: !isOrganizer || !member?._id },
  );

  const myEvents = eventsData?.items || [];

  // Calculate statistics
  const stats = useMemo(() => {
    if (!myEvents.length) {
      return {
        totalEvents: 0,
        activeEvents: 0,
        totalViews: 0,
        totalLikes: 0,
        totalApplicants: 0,
        avgCapacity: 0,
      };
    }

    const totalViews = myEvents.reduce(
      (sum, e) => sum + (e.eventViews || 0),
      0,
    );
    const totalLikes = myEvents.reduce(
      (sum, e) => sum + (e.eventLikes || 0),
      0,
    );
    const totalApplicants = myEvents.reduce(
      (sum, e) => sum + (e.eventJoined || 0),
      0,
    );
    const avgCapacity =
      myEvents.reduce((sum, e) => sum + (e.eventCapacity || 0), 0) /
      myEvents.length;

    const now = new Date();
    const activeEvents = myEvents.filter(
      (e) => e.eventDate && new Date(e.eventDate) >= now,
    ).length;

    return {
      totalEvents: myEvents.length,
      activeEvents,
      totalViews,
      totalLikes,
      totalApplicants,
      avgCapacity: Math.round(avgCapacity),
    };
  }, [myEvents]);

  // Event Action Handlers
  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteEvent(deleteConfirm.eventId).unwrap();
      showToast(`${deleteConfirm.eventTitle} has been successfully deleted.`);
      setDeleteConfirm(null);
    } catch (error) {
      showToast("Failed to delete event. Please try again.", "error");
    }
  };

  const handleDuplicate = async (eventId: string, eventTitle: string) => {
    try {
      await duplicateEvent(eventId).unwrap();
      showToast(`A copy of "${eventTitle}" has been created.`);
    } catch (error) {
      showToast("Failed to duplicate event. Please try again.", "error");
    }
  };

  const handleShare = (eventId: string) => {
    const eventUrl = `${window.location.origin}/events/${eventId}`;
    navigator.clipboard.writeText(eventUrl);
    showToast("Event link has been copied to clipboard.");
  };

  if (authLoading || eventsLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-96 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!member || !isOrganizer) {
    return (
      <div className="w-full min-h-screen bg-background py-12">
        <div className="mx-auto max-w-2xl px-4 text-center space-y-6">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
          <h1 className="text-3xl font-bold text-foreground">
            Organizer Access Required
          </h1>
          <p className="text-muted-foreground">
            This dashboard is only available for organizer accounts. Please log
            in with an organizer account.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
            >
              Go to Login
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-foreground hover:bg-muted"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs: TabConfig[] = [
    {
      id: "events",
      label: "My Events",
      icon: <Calendar className="h-4 w-4" />,
      count: stats.totalEvents,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8">
      <div className="mx-auto max-w-7xl px-4 space-y-8">
        {/* Header & Quick Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
              Organizer Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back,{" "}
              <span className="font-semibold">{member.memberNick}</span>!
            </p>
          </div>
          <button
            onClick={() => navigate("/events/create")}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 px-6 py-3 text-base font-bold text-primary-foreground shadow-lg hover:shadow-xl hover:from-primary/90 hover:to-primary/70 transition-all"
          >
            <Plus className="h-5 w-5" />
            Create Event
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Events */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Events
                </p>
                <p className="text-3xl font-extrabold text-foreground mt-2">
                  {stats.totalEvents}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.activeEvents} active
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          {/* Total Views */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Views
                </p>
                <p className="text-3xl font-extrabold text-foreground mt-2">
                  {stats.totalViews}
                </p>
                <p className="text-xs text-muted-foreground mt-1">All events</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Likes */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Likes
                </p>
                <p className="text-3xl font-extrabold text-foreground mt-2">
                  {stats.totalLikes}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Engagement</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-pink-500/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-pink-600 fill-pink-600" />
              </div>
            </div>
          </div>

          {/* Total Applicants */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Applicants
                </p>
                <p className="text-3xl font-extrabold text-foreground mt-2">
                  {stats.totalApplicants}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Volunteers</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Verification Badge */}
        {member.isVerified && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 flex items-center gap-4">
            <CheckCircle className="h-8 w-8 text-primary flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-foreground">Verified Organizer</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your account is verified. Volunteers trust verified organizers
                more!
              </p>
            </div>
          </div>
        )}

        {/* Tabs & Content */}
        <div className="rounded-2xl border border-border bg-card shadow-lg p-8">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-border pb-4 mb-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === tab.id
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Events Tab */}
          {activeTab === "events" && (
            <div className="space-y-6">
              {myEvents.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    No Events Yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first event to start engaging with volunteers.
                  </p>
                  <button
                    onClick={() => navigate("/events/create")}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="h-5 w-5" />
                    Create Your First Event
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {myEvents.map((event) => {
                    const eventDate = event.eventDate
                      ? new Date(event.eventDate)
                      : new Date();
                    const isPast = eventDate < new Date();
                    const applicantsCount = event.eventJoined || 0;
                    const capacityPercent =
                      (applicantsCount / (event.eventCapacity || 1)) * 100;

                    return (
                      <div
                        key={event._id}
                        className="rounded-xl border border-border bg-background p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* Event Image */}
                          {event.eventImages?.[0] && (
                            <img
                              src={eventImageUrlFromFilename(
                                event.eventImages[0],
                              )}
                              alt={event.eventTitle}
                              className="w-full lg:w-48 h-32 object-cover rounded-lg"
                            />
                          )}

                          {/* Event Details */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <Link
                                  to={`/events/${event._id}`}
                                  className="text-xl font-bold text-foreground hover:text-primary transition-colors"
                                >
                                  {event.eventTitle}
                                </Link>
                                {isPast && (
                                  <span className="ml-3 text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                                    Past Event
                                  </span>
                                )}
                              </div>

                              {/* Action Menu */}
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setAttendeeModal({
                                      eventId: event._id,
                                      eventTitle: event.eventTitle || "Event",
                                    })
                                  }
                                  className="text-purple-600 border-purple-300 hover:bg-purple-50"
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Manage Applicants
                                  {applicantsCount > 0 && (
                                    <span className="ml-2 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                                      {applicantsCount}
                                    </span>
                                  )}
                                </Button>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-48"
                                  >
                                    <DropdownMenuItem
                                      onClick={() =>
                                        navigate(`/events/${event._id}/edit`)
                                      }
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Event
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDuplicate(
                                          event._id,
                                          event.eventTitle || "Event",
                                        )
                                      }
                                      disabled={isDuplicating}
                                    >
                                      <Copy className="h-4 w-4 mr-2" />
                                      Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleShare(event._id)}
                                    >
                                      <Share2 className="h-4 w-4 mr-2" />
                                      Share Link
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() =>
                                        setDeleteConfirm({
                                          eventId: event._id,
                                          eventTitle:
                                            event.eventTitle || "Event",
                                        })
                                      }
                                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Event
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {event.eventDesc}
                            </p>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {eventDate.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {event.eventLocation}
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {applicantsCount} / {event.eventCapacity}{" "}
                                volunteers
                              </div>
                              <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                {event.eventViews || 0} views
                              </div>
                              <div className="flex items-center gap-2">
                                <Heart className="h-4 w-4" />
                                {event.eventLikes || 0} likes
                              </div>
                            </div>

                            {/* Capacity Bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Volunteer Capacity</span>
                                <span>{Math.round(capacityPercent)}%</span>
                              </div>
                              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all ${
                                    capacityPercent >= 100
                                      ? "bg-green-600"
                                      : capacityPercent >= 75
                                        ? "bg-yellow-600"
                                        : "bg-primary"
                                  }`}
                                  style={{
                                    width: `${Math.min(capacityPercent, 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="text-center py-16">
                <TrendingUp className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Analytics Overview
                </h3>
                <p className="text-muted-foreground mb-6">
                  Track your event performance and volunteer engagement.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 text-left">
                  <div className="rounded-xl border border-border bg-background p-6">
                    <h4 className="font-bold text-foreground mb-4">
                      Engagement Rate
                    </h4>
                    <div className="text-4xl font-extrabold text-primary mb-2">
                      {stats.totalEvents > 0
                        ? Math.round(
                            (stats.totalLikes / stats.totalViews) * 100,
                          ) || 0
                        : 0}
                      %
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Likes per view across all events
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-background p-6">
                    <h4 className="font-bold text-foreground mb-4">
                      Avg Capacity Fill
                    </h4>
                    <div className="text-4xl font-extrabold text-primary mb-2">
                      {stats.totalEvents > 0
                        ? Math.round(
                            (stats.totalApplicants /
                              (stats.avgCapacity * stats.totalEvents)) *
                              100,
                          )
                        : 0}
                      %
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Average volunteer sign-up rate
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="text-center py-16">
                <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Organizer Settings
                </h3>
                <p className="text-muted-foreground mb-6">
                  Manage your organization profile and preferences.
                </p>
                <button
                  onClick={() => navigate("/profile")}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
                >
                  Go to Profile Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {attendeeModal && (
        <AttendeeListModal
          eventId={attendeeModal.eventId}
          eventTitle={attendeeModal.eventTitle}
          isOpen={true}
          onClose={() => setAttendeeModal(null)}
        />
      )}

      <AlertDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Event"
        description={`Are you sure you want to delete "${deleteConfirm?.eventTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
