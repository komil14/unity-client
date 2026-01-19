// Synced from unity-backend/src/libs/types/group.ts
// Frontend-safe version (no mongoose Types.ObjectId, using string for IDs)
import { GroupStatus, GroupMemberRole } from "../enums";

// 1. Frontend Group Interface
export interface Group {
  _id: string;
  groupStatus?: GroupStatus | string; // Accept both enum and raw string from API
  groupName?: string;
  groupDesc?: string;
  groupImage?: string;
  memberId?: string; // Creator (Organization)
  groupMembers?: GroupMember[];
  groupLikes?: number;
  groupViews?: number;
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
}

// 2. Group Member Interface
export interface GroupMember {
  _id?: string;
  memberId?: string;
  groupId?: string;
  groupMemberRole?: GroupMemberRole | string; // Accept both enum and raw string from API
  createdAt?: string;
  updatedAt?: string;
}

// 3. Input DTOs
export interface GroupInput {
  groupName: string;
  groupDesc: string;
  groupImage?: string;
  memberId?: string;
}

export interface GroupMemberInput {
  memberId: string;
  groupId: string;
  groupMemberRole?: GroupMemberRole;
}
