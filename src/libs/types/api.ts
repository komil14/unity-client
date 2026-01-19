// API Request/Response types for services layer
// Synced with backend DTOs and adapted for frontend use

import type { Member, MemberUpdateInput } from "./member";
import type { Application } from "./application";
import type { Event } from "./event";
import type { Group } from "./group";
import { LikeGroup } from "../enums";

// ============ AUTH API ============
export interface MemberDto extends Member {}

export interface AuthResponse {
  member: MemberDto;
  accessToken: string;
}

export interface LoginInput {
  memberNick: string;
  memberPassword: string;
}

export interface SignupInput {
  memberType: "USER" | "ORG";
  memberNick: string;
  memberPhone: string;
  memberPassword: string;
  memberAddress?: string;
  memberDesc?: string;
  memberImage?: string;
}

export interface UpdateProfileInput extends MemberUpdateInput {}

// ============ APPLICATIONS API ============
export interface ApplicationDto extends Application {}

export interface JoinEventInput {
  eventId: string;
  applicationNote?: string;
}

// ============ EVENTS API ============
export interface MemberData {
  _id: string;
  memberNick: string;
  memberType: string;
  memberStatus: string;
  memberImage?: string;
  memberDesc?: string;
  isVerified?: boolean;
}

export interface EventDto extends Event {
  memberData?: MemberData;
}

export interface GetEventsParams {
  page?: number;
  limit?: number;
  order?: string;
  direction?: "asc" | "desc";
  search?: string;
  startDate?: string;
  endDate?: string;
  memberId?: string;
}

export interface WeeklyPopularParams {
  days?: number;
  limit?: number;
}

export interface WeeklyPopularEventDto extends EventDto {
  weeklyApplicants?: number;
  weeklyApplyRate?: number;
}

// ============ GROUPS API ============
export interface GroupDto extends Group {
  memberCount?: number;
  memberData?: MemberData;
}

export interface GroupDetailDto extends GroupDto {
  meJoined?: boolean;
  groupMemberRole?: string;
  joinDate?: string;
}

export interface GetGroupsParams {
  page?: number;
  limit?: number;
  order?: string;
  search?: string;
  memberId?: string;
}

export interface JoinGroupInput {
  groupId: string;
}

export interface JoinGroupResponse {
  joined: boolean;
  message?: string;
}

export interface CreateGroupInput {
  groupName: string;
  groupDesc: string;
  groupCategories?: string[] | string;
  groupImage?: File;
}

export interface UpdateGroupInput {
  _id: string;
  groupName?: string;
  groupDesc?: string;
  groupCategories?: string[] | string;
  groupImage?: File;
}

// ============ LIKES API ============
// Re-export LikeGroup from enums
export type { LikeGroup };

export interface ToggleLikeInput {
  likeGroup: LikeGroup | string; // Accept both enum and raw string from API
  likeRefId: string;
}

export interface ToggleLikeResponse {
  status: "liked" | "unliked";
  data: unknown;
}

export interface CheckLikesBatchInput {
  likeGroup: LikeGroup | string; // Accept both enum and raw string from API
  likeRefIds: string[];
}

export interface CheckLikesBatchResponse {
  likedRefIds: string[];
}

// ============ ORGANIZERS API ============
export interface OrganizerDto extends Member {
  bannerImage?: string;
  eventsOrganizedCount?: number;
  groupsOrganizedCount?: number;
  // Top organizers aggregates
  eventsCount?: number;
  eventsLikesTotal?: number;
  eventsViewsTotal?: number;
  articlesCount?: number;
  articleCommentsCount?: number;
  topScore?: number;
}

export interface GetOrganizersParams {
  page?: number;
  limit?: number;
  order?: string;
  direction?: "asc" | "desc";
  search?: string;
  onlyActive?: boolean;
}

export interface OrganizerDetailDto extends OrganizerDto {
  organizedEvents?: EventDto[];
  organizedGroups?: GroupDto[];
}
