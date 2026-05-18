import type { StatusBadgeTone } from "@/components/shared";

export const BOOKING_STATUSES = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  PAID: "PAID",
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  READY: "READY",
  CLOSED: "CLOSED",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
  NEEDS_HELP: "NEEDS_HELP",
  STALE: "STALE",
} as const;

export type BookingStatus =
  (typeof BOOKING_STATUSES)[keyof typeof BOOKING_STATUSES];

export const BOOKING_STATUS_TONES: Record<BookingStatus, StatusBadgeTone> = {
  DRAFT: "neutral",
  PENDING: "warning",
  PAID: "info",
  ASSIGNED: "info",
  IN_PROGRESS: "info",
  READY: "success",
  CLOSED: "success",
  EXPIRED: "danger",
  CANCELLED: "danger",
  NEEDS_HELP: "danger",
  STALE: "danger",
};

export interface SiteQrResolution {
  qrId: string;
  siteName: string;
  intakePaused: boolean;
  cutoffTime: string;
  rotatedAt?: string | null;
}

export interface BookingMedia {
  id: string;
  kind: "plate" | "slot" | "before" | "after";
  url: string;
  ocrText?: string | null;
}

export interface BookingStatusEvent {
  status: BookingStatus;
  changedAt: string;
  labelKey: string;
}

export interface CustomerBooking {
  id: string;
  signedToken: string;
  status: BookingStatus;
  siteName: string;
  plateText?: string | null;
  slotText?: string | null;
  priceAmount?: number;
  currency?: "IDR";
  estimatedReadyAt?: string | null;
  media: BookingMedia[];
  statusHistory: BookingStatusEvent[];
}

export interface CreateBookingPayload {
  qrId: string;
  locale: "id-ID" | "en-US";
}

export interface ConfirmBookingPayload {
  plateText: string;
  slotText: string;
}

export interface PaymentIntentResponse {
  bookingId: string;
  redirectUrl: string;
  idempotencyKey: string;
}

export interface RatingPayload {
  score: 1 | 2 | 3 | 4 | 5;
  reason?: string;
}

export interface UploadState {
  progress: number;
  status: "idle" | "uploading" | "retrying" | "success" | "failed";
  error: string | null;
  media: BookingMedia | null;
}
