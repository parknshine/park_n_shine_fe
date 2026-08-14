import type { BookingMedia, BookingStatus } from "@/features/customer/types";

export interface CrewSession {
  id: string;
  crewId: string;
  crewName: string;
  siteId: string;
  expiresAt: string;
  token: string;
}

export interface CrewLoginPayload {
  shiftCode: string;
  pin: string;
}

export interface CrewJob {
  id: string;
  bookingId: string;
  status: BookingStatus;
  plateText: string;
  slotText: string;
  assignedAt?: string | null;
  etaEndsAt?: string | null;
  supervisorPhone: string;
  media: BookingMedia[];
  checklist: WashChecklistItem[];
}

// Statuses where the ETA countdown timer is no longer relevant and should be
// hidden from the crew UI (header pill + job detail page).
// NEEDS_HELP / STALE: crew is waiting for admin intervention — timer adds noise.
// READY / CLOSED: job past the wash phase — no ETA to count down.
// CANCELLED / EXPIRED: terminal — no timer needed.
export const TIMER_HIDDEN_STATUSES = new Set<BookingStatus>([
  "NEEDS_HELP",
  "STALE",
  "READY",
  "CLOSED",
  "CANCELLED",
  "EXPIRED",
]);

export interface WashChecklistItem {
  id: string;
  labelKey: string;
  order: number;
  completedAt?: string | null;
}

export interface VerifyPlatePayload {
  result: "matched" | "not_found";
  reason?: string;
}

export interface BeforePhotoRequirement {
  kind: "before_front" | "before_back" | "before_left" | "before_right";
  labelKey: string;
  mediaId?: string;
  progress: number;
  isComplete: boolean;
}

export interface CompleteChecklistPayload {
  checklistItemId: string;
  completedAt: string;
}

export interface JobPreview {
  id: string;
  plateText: string;
  slotText: string;
}

export const REJECTION_REASONS = [
  "VEHICLE_TOO_DIRTY",
  "PARKING_TOO_TIGHT",
  "SPECIAL_CARE_NEEDED",
  "CREW_UNAVAILABLE",
] as const;

export type RejectionReason = (typeof REJECTION_REASONS)[number];
