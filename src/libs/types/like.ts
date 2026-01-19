// Synced from unity-backend/src/libs/types/like.ts
// Frontend-safe version (no mongoose Types.ObjectId, using string for IDs)
import { LikeGroup } from "../enums";

// 1. Frontend Like Interface
export interface Like {
  _id?: string;
  likeGroup?: LikeGroup | string; // Accept both enum and raw string from API
  likeRefId?: string; // ID of the liked entity
  memberId?: string; // Who liked it
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
}

// 2. Input DTO
export interface LikeInput {
  likeGroup: LikeGroup;
  likeRefId: string;
  memberId?: string;
}

// 3. Batch Like Check
export interface LikeCheckBatch {
  likeGroup: LikeGroup;
  likeRefIds: string[];
}

export interface LikeCheckResponse {
  likedRefIds: string[];
}
