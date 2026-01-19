// Synced from unity-backend/src/libs/types/member.ts
// Frontend-safe version (no mongoose Types.ObjectId, using string for IDs)
import { MemberStatus, MemberType } from "../enums";

// 1. Frontend Member Interface
export interface Member {
  _id: string;
  memberType: MemberType | string; // Accept both enum and raw string from API
  memberStatus: MemberStatus | string; // Accept both enum and raw string from API
  memberNick: string;
  memberPhone: string;
  memberAddress?: string;
  memberDesc?: string;
  memberImage?: string;
  memberPoints?: number; // Optional as API may not always include
  memberLikes?: number; // Optional as API may not always include
  memberViews?: number; // Optional as API may not always include
  isVerified?: boolean; // Optional as API may not always include
  createdAt?: string; // ISO date string, optional as API may not always include
  updatedAt?: string; // ISO date string, optional as API may not always include
}

// 2. Frontend Input DTOs
export interface MemberUpdateInput {
  memberNick?: string;
  memberPhone?: string;
  memberAddress?: string;
  memberDesc?: string;
  memberImage?: string;
}
