import type { StatusBadgeTone } from "@/components/shared";
import type { MediaKind } from "@/types/media";

export const BOOKING_STATUSES = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  PAID: "PAID",
  ASSIGNED: "ASSIGNED",
  LOCATED: "LOCATED",
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
  LOCATED: "info",
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
  kind: MediaKind;
  url: string;
  ocrText?: string | null;
}

export interface BookingStatusEvent {
  status: BookingStatus;
  changedAt: string;
  labelKey: string;
  reason?: string | null;
}

export type PaymentInstructions =
  | { type: "VA"; bank: string; vaNumber: string; expiryTime: string }
  | { type: "MANDIRI"; companyCode: string; billCode: string; expiryTime: string }
  | { type: "QRIS"; qrUrl: string; expiryTime: string }
  | { type: "EWALLET"; provider: string; deepLinkUrl: string; expiryTime: string }
  | { type: "REDIRECT"; redirectUrl: string };

export interface CustomerBooking {
  id: string;
  signedToken: string;
  status: BookingStatus;
  siteName: string;
  siteAddress?: string | null;
  plateText?: string | null;
  slotText?: string | null;
  phone?: string | null;
  priceAmount?: number;
  currency?: "IDR";
  estimatedReadyAt?: string | null;
  paymentMethod: string | null;
  paymentInstructions: PaymentInstructions | null;
  media: BookingMedia[];
  statusHistory: BookingStatusEvent[];
  startedAt: string | null;
  completedSteps: number;
  hasRated: boolean;
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
  status: string;
  plate: string;
  slot: string;
  price: number;
  payment: { message: string };
}

export interface ResumePaymentResponse {
  bookingId: string;
  snapToken: string;
  redirectUrl: string;
}

export interface RatingPayload {
  score: 1 | 2 | 3 | 4 | 5;
  reason?: string;
  authorName?: string;
  title?: string;
}

export interface UploadState {
  progress: number;
  status: "idle" | "uploading" | "retrying" | "success" | "failed";
  error: string | null;
  media: BookingMedia | null;
}

export interface PublicTestimonial {
  id: string;
  authorName: string;
  rating: number;
  body: string;
  title?: string;
  location?: string;
  order: number;
  createdAt: string;
}
