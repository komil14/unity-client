import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Gift,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useCheckAuthQuery } from "../../services/authApi";
import { useCreateEventMutation } from "../../services/eventsApi";
import { useScrollToTop } from "../../hooks/useScrollToTop";
import { useToast } from "../../../libs/components/ui/toast";
import { AlertDialog } from "../../../libs/components/ui/alert-dialog";

function toIsoString(localDateTime: string): string {
  const date = new Date(localDateTime);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

function formatDateDisplay(dateString: string) {
  if (!dateString) return "Select date";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CreateEventPage() {
  useScrollToTop();
  const navigate = useNavigate();
  const { data: authData, isLoading: authLoading } = useCheckAuthQuery();
  const isOrganizer = authData?.member?.memberType === "ORG";

  const [createEvent, createState] = useCreateEventMutation();
  const { showToast } = useToast();

  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("09:00");
  const [eventCapacity, setEventCapacity] = useState<number>(30);
  const [eventPoints, setEventPoints] = useState<number | "">(10);
  const [eventImages, setEventImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Auto-save draft to localStorage
  useEffect(() => {
    const draft = {
      eventTitle,
      eventDesc,
      eventLocation,
      eventDate,
      eventTime,
      eventCapacity,
      eventPoints,
    };
    if (eventTitle || eventDesc || eventLocation) {
      localStorage.setItem("eventDraft", JSON.stringify(draft));
    }
  }, [
    eventTitle,
    eventDesc,
    eventLocation,
    eventDate,
    eventTime,
    eventCapacity,
    eventPoints,
  ]);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("eventDraft");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setEventTitle(draft.eventTitle || "");
        setEventDesc(draft.eventDesc || "");
        setEventLocation(draft.eventLocation || "");
        setEventDate(draft.eventDate || "");
        setEventTime(draft.eventTime || "09:00");
        setEventCapacity(draft.eventCapacity || 30);
        setEventPoints(draft.eventPoints ?? 10);
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Close calendar on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showCalendar]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleDateSelect = (day: number) => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const selectedDate = new Date(year, month, day);

    // Prevent selecting past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      showToast("Cannot select a past date", "error");
      return;
    }

    setEventDate(formatLocalDate(selectedDate));
    setShowCalendar(false);
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploadingImages(true);
    const newFiles = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate each file
    for (const file of newFiles) {
      // Check file type
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name}: Not an image file`);
        continue;
      }

      // Check file size (5MB = 5 * 1024 * 1024 bytes)
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name}: File size exceeds 5MB`);
        continue;
      }

      validFiles.push(file);
    }

    // Show errors if any
    if (errors.length > 0) {
      showToast(errors.join("; "), "error");
    }

    // Add valid files to existing images, limit to 5 total
    const combined = [...eventImages, ...validFiles].slice(0, 5);
    setEventImages(combined);

    // Create previews for all images
    const newPreviews = combined.map((file) => URL.createObjectURL(file));

    // Clean up old preview URLs to prevent memory leaks
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImagePreviews(newPreviews);

    setIsUploadingImages(false);

    // Reset file input to allow selecting the same file again
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    const newImages = eventImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setEventImages(newImages);
    imagePreviews[index] && URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isOrganizer) {
      setError("Only organizers can create events.");
      return;
    }

    if (!eventTitle.trim() || !eventDesc.trim() || !eventLocation.trim()) {
      setError("Title, description, and location are required.");
      return;
    }

    if (!eventDate) {
      setError("Please select an event date.");
      return;
    }

    const eventDateLocal = `${eventDate}T${eventTime}`;
    const isoDate = toIsoString(eventDateLocal);
    if (!isoDate) {
      setError("Invalid date/time.");
      return;
    }

    if (!Number.isFinite(eventCapacity) || eventCapacity <= 0) {
      setError("Capacity must be a positive number.");
      return;
    }

    try {
      const result = await createEvent({
        eventTitle: eventTitle.trim(),
        eventDesc: eventDesc.trim(),
        eventLocation: eventLocation.trim(),
        eventDate: isoDate,
        eventCapacity: Number(eventCapacity),
        eventPoints: eventPoints === "" ? undefined : Number(eventPoints),
        eventImages,
      }).unwrap();

      // Clear draft from localStorage on success
      localStorage.removeItem("eventDraft");
      showToast("Event created successfully! 🎉");
      const newId = (result as any)._id || (result as any).id;
      if (newId) {
        navigate(`/events/${newId}`);
      } else {
        navigate("/events");
      }

      // Clean up image preview URLs
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    } catch (err: any) {
      const msg =
        err?.data?.message || "Failed to create event. Please try again.";
      setError(msg);
      showToast(msg, "error");
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-muted-foreground">Checking permissions…</div>
      </div>
    );
  }

  if (!isOrganizer) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-4">
        <h1 className="text-2xl font-bold text-foreground">
          Organizer access required
        </h1>
        <p className="text-muted-foreground">
          Only organizer accounts can create events. Please log in as an
          organizer.
        </p>
        <div className="flex gap-3">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Go to Login
          </Link>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-foreground hover:bg-muted"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  if (authData?.member?.memberStatus === "PENDING") {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8">
        <div className="mx-auto max-w-3xl px-4 space-y-6">
          {/* Main Pending Banner */}
          <div className="rounded-2xl border border-yellow-300 bg-yellow-50 p-8 flex items-start gap-6">
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-yellow-900 mb-2">
                Account Pending Approval
              </h1>
              <p className="text-sm text-yellow-800">
                Your organizer account is under review by our team. We typically
                approve accounts within 24-48 hours. Once approved, you'll be
                able to create and manage events immediately.
              </p>
            </div>
          </div>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* What's Being Reviewed */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Application Status
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Your application is submitted</p>
                <p>✓ Our team is reviewing your profile</p>
                <p>✓ Approval typically takes 24-48 hours</p>
              </div>
            </div>

            {/* What You Can Do */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                In the Meantime
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Complete your profile details</p>
                <p>• Explore other events for inspiration</p>
                <p>• Prepare event ideas and photos</p>
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-foreground">Need Assistance?</h3>
            <p className="text-sm text-muted-foreground">
              If you have questions or concerns about your application, our
              support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/help"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium hover:bg-primary/90"
              >
                Contact Support
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-foreground font-medium hover:bg-muted"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-3">
            Create a Volunteer Event
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Post an opportunity to make a difference. Connect with passionate
            volunteers ready to contribute to your cause.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info Section */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                1
              </div>
              Event Basics
            </h2>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-foreground mb-2 block">
                  Event Title *
                </span>
                <input
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value.slice(0, 100))}
                  maxLength={100}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="E.g., Community Park Cleanup, Hunger Relief Drive"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Make it clear and inspiring ({eventTitle.length}/100)
                </p>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-foreground mb-2 block">
                  Description *
                </span>
                <textarea
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value.slice(0, 2000))}
                  maxLength={2000}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  rows={6}
                  placeholder="Describe what volunteers will do, what to bring, any special requirements, and the impact they'll make..."
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Be detailed and enthusiastic ({eventDesc.length}/2000)
                </p>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location *
                </span>
                <input
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Street address, city, or landmark"
                  required
                />
              </label>
            </div>
          </div>

          {/* Schedule Section */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                2
              </div>
              Schedule & Capacity
            </h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Date Picker */}
              <div className="relative" ref={calendarRef}>
                <label className="block mb-2">
                  <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date *
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-left text-foreground font-medium hover:bg-muted/40 transition-colors"
                >
                  {formatDateDisplay(eventDate)}
                </button>

                {/* Calendar Popover */}
                {showCalendar && (
                  <div className="absolute top-full mt-2 left-0 bg-card rounded-xl shadow-2xl border border-border p-4 z-50 w-80">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        type="button"
                        onClick={() => {
                          const newMonth = new Date(calendarMonth);
                          newMonth.setMonth(newMonth.getMonth() - 1);
                          setCalendarMonth(newMonth);
                        }}
                        className="p-1 hover:bg-muted rounded"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <span className="font-semibold text-foreground">
                        {calendarMonth.toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const newMonth = new Date(calendarMonth);
                          newMonth.setMonth(newMonth.getMonth() + 1);
                          setCalendarMonth(newMonth);
                        }}
                        className="p-1 hover:bg-muted rounded"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                        <div
                          key={day}
                          className="text-center text-xs font-medium text-muted-foreground py-2"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                      {getDaysInMonth(calendarMonth).map((day, index) => {
                        if (!day) {
                          return <div key={index} className="invisible" />;
                        }

                        const cellDate = new Date(
                          calendarMonth.getFullYear(),
                          calendarMonth.getMonth(),
                          day,
                        );
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        cellDate.setHours(0, 0, 0, 0);
                        const isPast = cellDate < today;
                        const isToday = cellDate.getTime() === today.getTime();

                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleDateSelect(day)}
                            disabled={isPast}
                            className={`aspect-square p-2 text-sm rounded-lg transition-colors ${
                              isPast
                                ? "text-muted-foreground/40 cursor-not-allowed"
                                : "hover:bg-muted cursor-pointer"
                            } ${
                              isToday
                                ? "bg-primary/20 text-primary font-semibold"
                                : "text-foreground"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Time Picker */}
              <label className="block">
                <span className="text-sm font-semibold text-foreground block mb-2">
                  Time *
                </span>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                />
              </label>

              {/* Capacity */}
              <label className="block">
                <span className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4" />
                  Volunteer Capacity *
                </span>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={eventCapacity}
                  onChange={(e) => setEventCapacity(Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                />
              </label>
            </div>
          </div>

          {/* Impact & Media Section */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                3
              </div>
              Impact & Media
            </h2>

            <div className="space-y-6">
              {/* Points/Reward */}
              <label className="block">
                <span className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                  <Gift className="h-4 w-4" />
                  Volunteer Points (Optional)
                </span>
                <input
                  type="number"
                  min={0}
                  max={1000}
                  value={eventPoints}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEventPoints(val === "" ? "" : Number(val));
                  }}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Reward points for participation (e.g., 10, 25)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Points motivate volunteers. Default is 10 if left blank.
                </p>
              </label>

              {/* Images Upload */}
              <div>
                <label className="block mb-3">
                  <span className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                    <Upload className="h-4 w-4" />
                    Event Photos (Up to 5)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFiles}
                    className="hidden"
                    id="event-images"
                  />
                  <label
                    htmlFor="event-images"
                    className="block w-full cursor-pointer rounded-lg border-2 border-dashed border-border bg-muted/30 px-6 py-8 text-center hover:bg-muted/50 transition-colors"
                  >
                    {isUploadingImages ? (
                      <>
                        <Loader2 className="h-8 w-8 mx-auto text-primary mb-2 animate-spin" />
                        <p className="text-sm font-medium text-foreground">
                          Validating images...
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm font-medium text-foreground">
                          Click to upload or drag images here
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG up to 5MB each, max 5 files
                        </p>
                      </>
                    )}
                  </label>
                </label>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-foreground mb-3">
                      Preview ({imagePreviews.length} selected)
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {imagePreviews.map((preview, idx) => (
                        <div
                          key={idx}
                          className="relative rounded-lg overflow-hidden border border-border shadow-sm group"
                        >
                          <img
                            src={preview}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-24 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-5 w-5 text-white" />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-primary/90 text-white text-xs px-2 py-1 rounded">
                            {idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={createState.isLoading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 px-6 py-3 text-base font-bold text-primary-foreground shadow-lg hover:shadow-xl hover:from-primary/90 hover:to-primary/70 disabled:opacity-60 transition-all"
            >
              {createState.isLoading
                ? "Creating Event…"
                : "Create & Publish Event"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (eventTitle || eventDesc || eventLocation) {
                  setShowCancelDialog(true);
                } else {
                  navigate("/events");
                }
              }}
              className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 text-base font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={() => {
          imagePreviews.forEach((url) => URL.revokeObjectURL(url));
          navigate("/events");
        }}
        title="Leave Event Creation?"
        description="You have unsaved changes. Your draft will be saved and you can continue later."
        confirmText="Leave Anyway"
        cancelText="Keep Editing"
        variant="destructive"
      />
    </div>
  );
}
