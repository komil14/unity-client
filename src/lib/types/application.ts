// Synced from unity-backend/src/libs/types/application.ts
// Frontend-safe version (no mongoose Types.ObjectId, using string for IDs)
import { ApplicationStatus } from "../enums";
import type { Event } from "./event";

// 1. Frontend Application Interface
export interface Application {
  _id: string;
  applicationStatus: ApplicationStatus | string; // Accept both enum and raw string from API
  eventId: string;
  memberId: string;
  applicationNote?: string;
  createdAt?: string; // ISO date string, optional as API may not always include
  updatedAt?: string; // ISO date string, optional as API may not always include
  eventData?: Partial<Event>; // Populated event details for display
}

// 2. Input DTO
export interface ApplicationInput {
  eventId: string;
  memberId?: string;
  applicationNote?: string;
}
