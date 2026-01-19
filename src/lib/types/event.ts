// Synced from unity-backend/src/libs/types/event.ts
// Frontend-safe version (no mongoose Types.ObjectId, using string for IDs)
import { EventStatus } from "../enums";

// 1. Frontend Event Interface
export interface Event {
  _id: string;
  eventStatus?: EventStatus | string; // Accept both enum and raw string from API
  eventTitle?: string;
  eventDesc?: string;
  eventLocation?: string;
  eventDate?: string; // ISO date string
  eventCapacity?: number;
  eventJoined?: number;
  eventImages?: string[];
  eventPoints?: number;
  memberId?: string; // Creator (Organization)
  eventLikes?: number;
  eventViews?: number;
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
}

// 2. Input DTO
export interface EventInput {
  eventTitle: string;
  eventDesc: string;
  eventLocation: string;
  eventDate: string; // ISO date string
  eventCapacity: number;
  eventImages?: string[];
  memberId?: string;
}

// 3. Event Search/Filter Query
export interface EventInquiry {
  page: number;
  limit: number;
  order?: string; // 'createdAt' | 'eventDate' | 'eventViews' | 'eventLikes'
  direction?: "asc" | "desc";
  search?: string; // For search bar
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  memberId?: string; // To filter events by a specific Organization
}
