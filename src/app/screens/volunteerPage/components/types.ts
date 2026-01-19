export interface ProfileStats {
  totalPoints: number;
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
}

export interface MemberData {
  _id: string;
  memberNick: string;
  memberPhone: string;
  memberAddress?: string;
  memberDesc?: string;
  memberImage?: string;
  memberType: string;
  memberPoints?: number;
}

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
