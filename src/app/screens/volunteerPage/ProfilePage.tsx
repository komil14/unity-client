import { useMemo, useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Clock,
  Check,
  X,
  Zap,
  Settings,
  Upload,
  Calendar,
  MapPin,
} from "lucide-react";
import {
  useCheckAuthQuery,
  useUpdateProfileMutation,
} from "../../services/authApi";
import { useGetMyApplicationsQuery } from "../../services/applicationsApi";
import { uploadUrlFromFilename } from "../../../libs/shared/ui.tsx";
import { useToast } from "../../../libs/components/ui/toast";

type TabType = "pending" | "approved" | "rejected" | "completed" | "settings";

export default function ProfilePage() {
  const { data: authData, isLoading: authLoading } = useCheckAuthQuery();
  const { data: applications, isLoading: appsLoading } =
    useGetMyApplicationsQuery();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("settings");

  const member = authData?.member;

  // Calculate statistics
  const stats = useMemo(() => {
    if (!applications) {
      return {
        totalPoints: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        completed: 0,
      };
    }

    return {
      totalPoints: member?.memberPoints || 0,
      pending: applications.filter((app) => app.applicationStatus === "PENDING")
        .length,
      approved: applications.filter(
        (app) => app.applicationStatus === "APPROVED"
      ).length,
      rejected: applications.filter(
        (app) => app.applicationStatus === "REJECTED"
      ).length,
      completed: applications.filter(
        (app) => app.applicationStatus === "COMPLETED"
      ).length,
    };
  }, [applications, member?.memberPoints]);

  // Filter applications by status
  const filteredApps = useMemo(() => {
    if (!applications) return [];
    const statusMap: Record<TabType, string> = {
      pending: "PENDING",
      approved: "APPROVED",
      rejected: "REJECTED",
      completed: "COMPLETED",
      settings: "",
    };
    if (activeTab === "settings") return [];
    return applications.filter(
      (app) => app.applicationStatus === statusMap[activeTab]
    );
  }, [applications, activeTab]);

  if (authLoading || appsLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-96 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-4">
        <div className="text-destructive font-semibold">
          Please login to view your profile.
        </div>
      </div>
    );
  }

  const avatarInitial = member.memberNick
    ? member.memberNick.charAt(0).toUpperCase()
    : "U";

  const tabs: Array<{
    id: TabType;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }> = [
    {
      id: "pending",
      label: "Pending",
      icon: <Clock className="h-4 w-4 text-primary" />,
      count: stats.pending,
    },
    {
      id: "approved",
      label: "Approved",
      icon: <Check className="h-4 w-4 text-primary" />,
      count: stats.approved,
    },
    {
      id: "rejected",
      label: "Rejected",
      icon: <X className="h-4 w-4 text-primary" />,
      count: stats.rejected,
    },
    {
      id: "completed",
      label: "Completed",
      icon: <Zap className="h-4 w-4 text-primary" />,
      count: stats.completed,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4 text-primary" />,
    },
  ];

  return (
    <div className="w-full min-h-screen bg-background py-8">
      <div className="mx-auto max-w-7xl px-4 space-y-8">
        {/* Main Profile Card with Stats */}
        <div className="rounded-2xl border border-border bg-card shadow-lg p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {/* Left Section - Identity */}
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="h-32 w-32 rounded-full bg-muted border-4 border-border flex items-center justify-center overflow-hidden">
                  {member.memberImage ? (
                    <img
                      src={uploadUrlFromFilename("members", member.memberImage)}
                      alt={member.memberNick}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl font-extrabold text-foreground">
                      {avatarInitial}
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                  {member.memberNick}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {member.memberPhone}
                </p>
                <div className="inline-flex items-center rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
                  {member.memberType === "USER"
                    ? "VOLUNTEER"
                    : member.memberType}
                </div>
              </div>
            </div>

            {/* Right Section - Stats Grid */}
            <div className="flex-1 w-full">
              <div className="rounded-xl bg-muted/30 p-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {/* Points/Stars */}
                  <div className="rounded-xl bg-card border border-border shadow-sm p-4 text-center">
                    <div className="flex justify-center mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-foreground">
                      {stats.totalPoints}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-muted-foreground">
                      Stars
                    </div>
                  </div>

                  {/* Pending */}
                  <div className="rounded-xl bg-card border border-border shadow-sm p-4 text-center">
                    <div className="flex justify-center mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-foreground">
                      {stats.pending}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-muted-foreground">
                      Pending
                    </div>
                  </div>

                  {/* Approved */}
                  <div className="rounded-xl bg-card border border-border shadow-sm p-4 text-center">
                    <div className="flex justify-center mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-foreground">
                      {stats.approved}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-muted-foreground">
                      Approved
                    </div>
                  </div>

                  {/* Rejected */}
                  <div className="rounded-xl bg-card border border-border shadow-sm p-4 text-center">
                    <div className="flex justify-center mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <X className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-foreground">
                      {stats.rejected}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-muted-foreground">
                      Rejected
                    </div>
                  </div>

                  {/* Completed */}
                  <div className="rounded-xl bg-card border border-border shadow-sm p-4 text-center">
                    <div className="flex justify-center mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-foreground">
                      {stats.completed}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-muted-foreground">
                      Completed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab-based Content Card */}
        <div className="rounded-2xl border border-border bg-card shadow-lg p-8">
          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="flex items-stretch gap-2 rounded-2xl bg-card border border-border p-1 shadow-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-card text-foreground shadow-sm border border-border"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          {activeTab === "settings" ? (
            <SettingsForm
              member={member}
              onUpdate={() => showToast("Profile updated successfully!")}
            />
          ) : (
            <ApplicationsList apps={filteredApps} status={activeTab} />
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsForm({
  member,
  onUpdate,
}: {
  member: any;
  onUpdate: () => void;
}) {
  const [updateProfile] = useUpdateProfileMutation();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    memberNick: member.memberNick || "",
    memberPhone: member.memberPhone || "",
    memberAddress: member.memberAddress || "",
    memberDesc: member.memberDesc || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log("=== SettingsForm Rendered ===");
  console.log("Current member prop:", member);
  console.log("Current formData state:", formData);

  // Sync form with member data when member changes
  useEffect(() => {
    console.log("useEffect: member changed, updating form");
    setFormData({
      memberNick: member.memberNick || "",
      memberPhone: member.memberPhone || "",
      memberAddress: member.memberAddress || "",
      memberDesc: member.memberDesc || "",
    });
  }, [member._id]); // Only re-sync when member ID changes

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    console.log(`Form field changed: ${name} = ${value}`);
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      console.log("Updated formData:", updated);
      return updated;
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("Image file selected:", file.name, file.size);

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("File size must be less than 5MB");
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      showToast("Only JPG, JPEG, PNG files are allowed");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setPreviewImage(preview);
      console.log("Image preview created");
    };
    reader.readAsDataURL(file);

    // Upload immediately
    uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    try {
      console.log("Starting image upload:", file.name);
      const formData = new FormData();
      formData.append("memberImage", file);

      const result = await updateProfile(formData as any).unwrap();
      console.log("Image upload successful:", result);
      setPreviewImage(null);
      onUpdate();
    } catch (err: any) {
      console.error("Image upload failed:", err);
      const errorMsg =
        err?.data?.message || err?.message || "Failed to upload image";
      showToast(errorMsg);
      setPreviewImage(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload: any = {};
      if (formData.memberNick !== member.memberNick)
        payload.memberNick = formData.memberNick;
      if (formData.memberPhone !== member.memberPhone)
        payload.memberPhone = formData.memberPhone;
      if (formData.memberAddress !== member.memberAddress)
        payload.memberAddress = formData.memberAddress;
      if (formData.memberDesc !== member.memberDesc)
        payload.memberDesc = formData.memberDesc;

      if (Object.keys(payload).length === 0) {
        console.log("No changes detected");
        setIsSaving(false);
        return;
      }

      console.log("=== handleSave Started ===");
      console.log("Current member:", member);
      console.log("Saving profile with payload:", payload);

      // Perform update via API
      console.log("Calling updateProfile mutation...");
      const result = await updateProfile(payload).unwrap();

      console.log("✅ Update successful! Result:", result);
      console.log("Result type:", typeof result);
      console.log("Result keys:", Object.keys(result));

      onUpdate();
    } catch (err: any) {
      console.error("❌ Failed to save profile");
      console.error("Error type:", typeof err);
      console.error("Full error object:", err);
      console.error("Error status:", err?.status);
      console.error("Error data:", err?.data);
      console.error("Error message:", err?.message);

      const errorMsg =
        err?.data?.message || err?.message || "Failed to update profile";
      console.error("Final error message:", errorMsg);
      showToast(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-foreground">
          Profile Settings
        </h2>
        <div className="mt-3 h-px bg-border" />
      </div>

      {/* Image Upload Section */}
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="relative">
          <div className="h-32 w-32 rounded-full bg-muted border-4 border-border flex items-center justify-center overflow-hidden">
            {member.memberImage ? (
              <img
                src={uploadUrlFromFilename("members", member.memberImage)}
                alt={member.memberNick}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-5xl font-extrabold text-foreground">
                {member.memberNick?.charAt(0).toUpperCase() || "U"}
              </span>
            )}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleImageSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleUploadClick}
          className="flex flex-col items-center justify-center w-48 h-24 border-2 border-dashed border-border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <Upload className="h-6 w-6 text-muted-foreground mb-1" />
          <span className="text-xs text-muted-foreground font-medium">
            Upload Photo
          </span>
        </button>
        <p className="text-xs text-muted-foreground">
          JPG, JPEG, PNG up to 5MB
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Username */}
        <div>
          <label className="text-sm font-semibold text-foreground">
            Username
          </label>
          <input
            type="text"
            name="memberNick"
            value={formData.memberNick}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg bg-muted/30 border border-border px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Enter username"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="text-sm font-semibold text-foreground">Phone</label>
          <input
            type="tel"
            name="memberPhone"
            value={formData.memberPhone}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg bg-muted/30 border border-border px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Enter phone number"
          />
        </div>

        {/* Address */}
        <div>
          <label className="text-sm font-semibold text-foreground">
            Address
          </label>
          <input
            type="text"
            name="memberAddress"
            value={formData.memberAddress}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg bg-muted/30 border border-border px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Enter address"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-semibold text-foreground">Bio</label>
          <textarea
            name="memberDesc"
            value={formData.memberDesc}
            onChange={handleChange}
            rows={4}
            className="mt-1 w-full rounded-lg bg-muted/30 border border-border px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            placeholder="Tell us about yourself"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-4">
        <button className="px-6 py-2 rounded-lg border border-border bg-background text-foreground font-semibold hover:bg-muted transition-colors">
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function ApplicationsList({
  apps,
  status,
}: {
  apps: any[];
  status: "pending" | "approved" | "rejected" | "completed";
}) {
  const statusIcons = {
    pending: <Clock className="h-4 w-4 text-primary" />,
    approved: <Check className="h-4 w-4 text-green-500" />,
    rejected: <X className="h-4 w-4 text-red-500" />,
    completed: <Zap className="h-4 w-4 text-purple-500" />,
  };

  if (apps.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No {status} applications yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {apps.map((app) => (
        <div
          key={app._id}
          className="rounded-lg border border-border bg-background/50 p-4 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-start gap-4">
            {/* Event Image */}
            {app.eventData?.eventImages?.[0] && (
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={uploadUrlFromFilename(
                      "events",
                      app.eventData.eventImages[0]
                    )}
                    alt={app.eventData.eventTitle || "Event"}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Event Info */}
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex items-center gap-2">
                {statusIcons[status]}
                <h3 className="font-semibold text-foreground truncate">
                  {app.eventData?.eventTitle || "Event"}
                </h3>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {app.eventData?.eventDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(app.eventData.eventDate).toLocaleDateString()}
                  </div>
                )}
                {app.eventData?.eventLocation && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">
                      {app.eventData.eventLocation}
                    </span>
                  </div>
                )}
              </div>
              {app.applicationNote && (
                <p className="text-sm text-muted-foreground italic line-clamp-2">
                  Note: {app.applicationNote}
                </p>
              )}
            </div>

            {/* Date */}
            <div className="flex-shrink-0 text-right">
              <p className="text-xs text-muted-foreground">
                {new Date(app.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
