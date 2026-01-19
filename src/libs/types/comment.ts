// Synced from unity-backend/src/libs/types/comment.ts
// Frontend-safe version (no mongoose Types.ObjectId, using string for IDs)
import { CommentStatus } from "../enums";

// 1. Frontend Comment Interface
export interface Comment {
  _id: string;
  commentStatus?: CommentStatus | string; // Accept both enum and raw string from API
  commentText?: string;
  commentRef?: string; // ID of the entity being commented on
  commentRefType?: string; // Type: 'EVENT', 'GROUP', 'ARTICLE', etc.
  memberId?: string; // Who commented
  parentCommentId?: string; // For nested replies
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
}

// 2. Input DTO
export interface CommentInput {
  commentText: string;
  commentRef: string;
  commentRefType: string;
  memberId?: string;
  parentCommentId?: string;
}
