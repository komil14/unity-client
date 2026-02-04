import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
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
} from "lucide-react";
import { useCheckAuthQuery } from "../../services/authApi";
import {
  useGetEventByIdQuery,
  useUpdateEventMutation,
} from "../../services/eventsApi";
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

export default function UpdateEventPage() {
  useScrollToTop();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: authData, isLoading: authLoading } = useCheckAuthQuery();
  const { data: eventData, isLoading: eventLoading } = useGetEventByIdQuery(
    id!,
    { skip: !id },
  );
  const isOrganizer = authData?.member?.memberType === "ORG";

  const [updateEvent, updateState] = useUpdateEventMutation();
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
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Load event data when available
  useEffect(() => {
    if (eventData) {
      setEventTitle(eventData.eventTitle || "");
      setEventDesc(eventData.eventDesc || "");
      setEventLocation(eventData.eventLocation || "");

      if (eventData.eventDate) {
        const date = new Date(eventData.eventDate);
        const dateStr = formatLocalDate(date);
        const timeStr = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
        setEventDate(dateStr);
        setEventTime(timeStr);
      }

      setEventCapacity(eventData.eventCapacity || 30);
      setEventPoints(eventData.eventPoints ?? 10);
      setExistingImages(eventData.eventImages || []);
    }
  }, [eventData]);

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

    for (const file of newFiles) {
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name}: Not an image file`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name}: File size exceeds 5MB`);
        continue;
      }
      validFiles.push(file);
    }

    if (errors.length > 0) {
      showToast(errors.join("; "), "error");
    }

    const combined = [...eventImages, ...validFiles].slice(
      0,
      5 - existingImages.length,
    );
    setEventImages(combined);

    const newPreviews = combined.map((file) => URL.createObjectURL(file));
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImagePreviews(newPreviews);

    setIsUploadingImages(false);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    const newImages = eventImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setEventImages(newImages);
    imagePreviews[index] && URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews(newPreviews);
  };

  const removeExistingImage = (index: number) => {
    const newExisting = existingImages.filter((_, i) => i !== index);
    setExistingImages(newExisting);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isOrganizer) {
      setError("Only organizers can update events.");
      return;
    }

    if (!id) {
      setError("Event ID is missing.");
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
      await updateEvent({
        id,
        data: {
          eventTitle: eventTitle.trim(),
          eventDesc: eventDesc.trim(),
          eventLocation: eventLocation.trim(),
          eventDate: isoDate,
          eventCapacity: Number(eventCapacity),
          eventPoints: eventPoints === "" ? undefined : Number(eventPoints),
          eventImages: eventImages.length > 0 ? eventImages : undefined,
        },
      }).unwrap();

      showToast("Event updated successfully! 🎉");
      navigate(`/events/${id}`);
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    } catch (err: any) {
      const msg =
        err?.data?.message || "Failed to update event. Please try again.";
      setError(msg);
      showToast(msg, "error");
    }
  };

  const handleCancel = () => {
    if (eventTitle || eventDesc || eventLocation) {
      setShowCancelDialog(true);
    } else {
      navigate(-1);
    }
  };

  const confirmCancel = () => {
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    navigate(-1);
  };

  if (authLoading || eventLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-muted-foreground">Loading...</div>
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
          Only organizers can update events.
        </p>
        <Link to="/events" className="text-primary hover:underline">
          ← Back to Events
        </Link>
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

  if (!eventData) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Event not found</h1>
        <Link to="/events" className="text-primary hover:underline">
          ← Back to Events
        </Link>
      </div>
    );
  }

  // Check if user owns this event
  if (eventData.memberId !== authData?.member?._id) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Access denied</h1>
        <p className="text-muted-foreground">
          You can only edit your own events.
        </p>
        <Link to="/dashboard" className="text-primary hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const days = getDaysInMonth(calendarMonth);
  const totalImages = existingImages.length + eventImages.length;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Cancel
        </button>
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Edit Event
        </h1>
        <p className="text-muted-foreground mt-2">Update your event details</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive p-4 text-destructive">
            {error}
          </div>
        )}

        {/* Title */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
            Event Title
            <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value.slice(0, 100))}
            placeholder="Beach Cleanup Day"
            maxLength={100}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            required
          />
          <p className="text-xs text-muted-foreground">
            {eventTitle.length} / 100 characters
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
            Description
            <span className="text-destructive">*</span>
          </label>
          <textarea
            value={eventDesc}
            onChange={(e) => setEventDesc(e.target.value.slice(0, 2000))}
            placeholder="Describe your event, what volunteers will do, and any requirements..."
            rows={6}
            maxLength={2000}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            required
          />
          <p className="text-xs text-muted-foreground">
            {eventDesc.length} / 2000 characters
          </p>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <MapPin className="h-4 w-4" />
            Location
            <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={eventLocation}
            onChange={(e) => setEventLocation(e.target.value)}
            placeholder="123 Main St, City, State"
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            required
          />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 relative">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Calendar className="h-4 w-4" />
              Event Date
              <span className="text-destructive">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowCalendar(!showCalendar)}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-left"
            >
              {formatDateDisplay(eventDate)}
            </button>

            {showCalendar && (
              <div
                ref={calendarRef}
                className="absolute z-50 mt-2 w-80 rounded-lg border border-border bg-popover p-4 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() =>
                      setCalendarMonth(
                        new Date(
                          calendarMonth.getFullYear(),
                          calendarMonth.getMonth() - 1,
                        ),
                      )
                    }
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="font-semibold">
                    {calendarMonth.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setCalendarMonth(
                        new Date(
                          calendarMonth.getFullYear(),
                          calendarMonth.getMonth() + 1,
                        ),
                      )
                    }
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div
                      key={day}
                      className="font-semibold text-muted-foreground py-2"
                    >
                      {day}
                    </div>
                  ))}
                  {days.map((day, idx) =>
                    day ? (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleDateSelect(day)}
                        className={`py-2 rounded-lg transition-colors hover:bg-primary hover:text-primary-foreground ${
                          eventDate ===
                          formatLocalDate(
                            new Date(
                              calendarMonth.getFullYear(),
                              calendarMonth.getMonth(),
                              day,
                            ),
                          )
                            ? "bg-primary text-primary-foreground font-semibold"
                            : ""
                        }`}
                      >
                        {day}
                      </button>
                    ) : (
                      <div key={idx}></div>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              Time
            </label>
            <input
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Capacity & Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Users className="h-4 w-4" />
              Volunteer Capacity
              <span className="text-destructive">*</span>
            </label>
            <input
              type="number"
              value={eventCapacity}
              onChange={(e) => setEventCapacity(Number(e.target.value))}
              min={1}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Gift className="h-4 w-4" />
              Reward Points
            </label>
            <input
              type="number"
              value={eventPoints}
              onChange={(e) =>
                setEventPoints(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              min={0}
              placeholder="Optional"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Current Images
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {existingImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={`${import.meta.env.VITE_API_URL}/uploads/events/${img}`}
                    alt={`Event ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(idx)}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Images Upload */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Upload className="h-4 w-4" />
            {existingImages.length > 0 ? "Add More Images" : "Event Images"}
            <span className="text-muted-foreground text-xs font-normal">
              (Max 5 total, up to 5MB each)
            </span>
          </label>

          {totalImages < 5 && (
            <div className="flex items-center gap-4">
              <label className="cursor-pointer">
                <div className="px-6 py-3 rounded-lg border-2 border-dashed border-border hover:border-primary bg-muted/50 hover:bg-muted transition-all flex items-center gap-2">
                  {isUploadingImages ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span>Choose Files</span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFiles}
                  className="hidden"
                  disabled={isUploadingImages || totalImages >= 5}
                />
              </label>
              <p className="text-sm text-muted-foreground">
                {totalImages} / 5 images
              </p>
            </div>
          )}

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
              {imagePreviews.map((src, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={src}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={updateState.isLoading}
            className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {updateState.isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Event"
            )}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 rounded-lg border border-border bg-background hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={confirmCancel}
        title="Discard Changes?"
        description="You have unsaved changes. Are you sure you want to cancel? Your changes will be lost."
        confirmText="Discard"
        cancelText="Keep Editing"
        variant="destructive"
      />
    </div>
  );
}
