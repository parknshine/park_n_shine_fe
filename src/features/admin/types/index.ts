import type { BookingStatus, CustomerBooking } from "@/features/customer/types";

export interface AdminQueueBooking extends CustomerBooking {
  crewName?: string | null;
  elapsedSeconds: number;
}

export interface AdminQueueStatusGroup {
  status: BookingStatus;
  bookings: AdminQueueBooking[];
}

export interface AdminQueueResponse {
  siteId: string;
  fetchedAt: string;
  groups: AdminQueueStatusGroup[];
  escalations: AdminQueueBooking[];
}

export interface RefundPayload {
  amountType: "full" | "partial";
  amount?: number;
  reasonCode: string;
}

export interface StatusOverridePayload {
  nextStatus: Extract<BookingStatus, "PAID" | "CANCELLED">;
  reasonCode: string;
}

export interface ReassignBookingPayload {
  crewId: string;
  reasonCode?: string;
}

export interface DailySiteReport {
  siteId: string;
  date: string;
  totalBookings: number;
  completionRate: number;
  slaHitRate: number;
  averageRating: number | null;
  revenue: number;
}
