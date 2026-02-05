import { useState, useEffect, useRef } from "react";
import { Upload } from "lucide-react";
import { useUpdateProfileMutation } from "../../services/authApi";
import { memberImageUrlFromFilename } from "../../../libs/shared/ui";
import { useToast } from "../../../libs/components/ui/toast";
import type { Member } from "../../../libs/types";

interface OrganizerSettingsFormProps {
  member: Member;
  onUpdate: () => void;
}

interface MemberUpdatePayload {
  memberNick?: string;
  memberPhone?: string;
  memberAddress?: string;
  memberDesc?: string;
}

interface ApiError {
  status?: number;
  data?: {
    message?: string;
  };
  message?: string;
}

export default function OrganizerSettingsForm({
  member,
  onUpdate,
}: OrganizerSettingsFormProps) {
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

  // Sync form with member data when member changes
  useEffect(() => {
    setFormData({
      memberNick: member.memberNick || "",
      memberPhone: member.memberPhone || "",
      memberAddress: member.memberAddress || "",
      memberDesc: member.memberDesc || "",
    });
  }, [member._id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      const formData = new FormData();
      formData.append("memberImage", file);

      await updateProfile(formData as unknown as MemberUpdatePayload).unwrap();
      showToast("Profile picture updated successfully!");
      onUpdate();
    } catch (err) {
      const error = err as ApiError;
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
        setIsSaving(false);
        return;
      }

      await updateProfile(payload).unwrap();
      onUpdate();
    } catch (err) {
      const error = err as ApiError;
      const errorMsg =
        error?.data?.message || error?.message || "Failed to update profile";
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
          Organization Settings
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Update your organization's profile information
        </p>
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
            Upload Logo
          </span>
        </button>
        <p className="text-xs text-muted-foreground">
          JPG, JPEG, PNG up to 5MB
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Organization Name */}
        <div>
          <label className="text-sm font-semibold text-foreground">
            Organization Name
          </label>
          <input
            type="text"
            name="memberNick"
            value={formData.memberNick}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg bg-muted/30 border border-border px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Enter organization name"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="text-sm font-semibold text-foreground">
            Contact Phone
          </label>
          <input
            type="tel"
            name="memberPhone"
            value={formData.memberPhone}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg bg-muted/30 border border-border px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Enter contact phone number"
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
            placeholder="Enter organization address"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-semibold text-foreground">
            About Organization
          </label>
          <textarea
            name="memberDesc"
            value={formData.memberDesc}
            onChange={handleChange}
            rows={4}
            className="mt-1 w-full rounded-lg bg-muted/30 border border-border px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            placeholder="Tell volunteers about your organization..."
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-border">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
