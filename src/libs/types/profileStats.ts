// Local component types - for volunteer page specific use
import type { Member } from ".";

export interface ProfileStats {
  totalPoints: number;
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
}

// Use the shared Member type from lib
export type MemberData = Member;
