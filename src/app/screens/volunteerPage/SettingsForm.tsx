import { useState, useEffect, useRef } from "react";
import { Upload } from "lucide-react";
import { useUpdateProfileMutation } from "../../services/authApi";
import { memberImageUrlFromFilename } from "../../../libs/shared/ui";
import { useToast } from "../../../libs/components/ui/toast";
import type {
  SettingsFormProps,
  MemberUpdatePayload,
  ApiError,
} from "../../../libs/types";

export default function SettingsForm({ member, onUpdate }: SettingsFormProps) {
  const [updateProfile] = useUpdateProfileMutation();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    memberNick: member.memberNick || "",
    memberPhone: member.memberPhone || "",
    memberAddress: member.memberAddress || "",
    memberDesc: member.memberDesc || "",
  });
  const [isSaving, setIsSaving] = useState(false);
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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

    // Upload immediately
    uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    try {
      console.log("Starting image upload:", file.name);
      const formData = new FormData();
      formData.append("memberImage", file);

      // RTK Query handles FormData serialization, so we need to cast it
      const result = await updateProfile(
        formData as unknown as MemberUpdatePayload,
      ).unwrap();
      console.log("Image upload successful:", result);
      onUpdate();
    } catch (err) {
      const error = err as ApiError;
      console.error("Image upload failed:", error);
      const errorMsg =
        error?.data?.message || error?.message || "Failed to upload image";
      showToast(errorMsg);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload: MemberUpdatePayload = {};
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
    } catch (err) {
      const error = err as ApiError;
      console.error("❌ Failed to save profile");
      console.error("Error type:", typeof error);
      console.error("Full error object:", error);
      console.error("Error status:", error?.status);
      console.error("Error data:", error?.data);
      console.error("Error message:", error?.message);

      const errorMsg =
        error?.data?.message || error?.message || "Failed to update profile";
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
                src={memberImageUrlFromFilename(member.memberImage)}
                alt={member.memberNick}
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src={memberImageUrlFromFilename(undefined, member.memberNick)}
                alt={member.memberNick}
                className="h-full w-full object-cover"
              />
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
