// Component Props Types
import type { Member } from "./member";
import type { Application } from "./application";
import type { ProfileStats } from "./profileStats";

export interface ProfileOverviewProps {
  member: Member;
  stats: ProfileStats;
}

export interface SettingsFormProps {
  member: Member;
  onUpdate: () => void;
}

export interface TabNavigationProps {
  tabs: TabConfig[];
  activeTab: TabType;
  onTabChange: (tabId: TabType) => void;
}

export interface PendingApplicationsProps {
  apps: Application[];
}

export interface ApprovedApplicationsProps {
  apps: Application[];
}

export interface RejectedApplicationsProps {
  apps: Application[];
}

export interface CompletedApplicationsProps {
  apps: Application[];
}

// Utility types for form handling
export interface MemberUpdatePayload {
  memberNick?: string;
  memberPhone?: string;
  memberAddress?: string;
  memberDesc?: string;
}

export interface ApiError {
  status?: number;
  data?: {
    message?: string;
  };
  message?: string;
}

// Screen-Specific Types
export type TabType =
  | "pending"
  | "approved"
  | "rejected"
  | "completed"
  | "settings";

export interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

export type WhyTab = "volunteers" | "organizations" | "communities";

export type MemberTypeFilter = "USER" | "ORG";
