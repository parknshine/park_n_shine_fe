import type { BookingMedia, BookingStatus } from "@/features/customer/types";

export interface CrewSession {
  id: string;
  crewId: string;
  crewName: string;
  siteId: string;
  expiresAt: string;
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
  media: BookingMedia[];
  checklist: WashChecklistItem[];
}

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
  kind: "front" | "back" | "left" | "right";
  labelKey: string;
  mediaId?: string;
  progress: number;
  isComplete: boolean;
}

export interface CompleteChecklistPayload {
  checklistItemId: string;
  completedAt: string;
}
