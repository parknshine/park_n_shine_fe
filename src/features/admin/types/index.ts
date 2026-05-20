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

export interface AuditEntry {
  id: string;
  bookingId: string;
  plateText: string | null;
  action: "refund" | "status_override" | "reassign";
  detail: string;
  adminEmail: string;
  createdAt: string;
}

export interface DailyBreakdown {
  date: string;
  totalBookings: number;
  completed: number;
  slaHitRate: number;
  averageRating: number | null;
  revenue: number;
}

export interface AdminReport {
  siteId: string;
  from: string;
  to: string;
  summary: DailySiteReport;
  breakdown: DailyBreakdown[];
}

export interface AdminSettings {
  siteId: string;
  staleJobTimeoutMinutes: number;
}

export interface AdminSite {
  id: string;
  name: string;
}

export interface AdminBookingDetail extends AdminQueueBooking {
  auditEntries: AuditEntry[];
}

export interface MockCrewMember {
  id: string;
  name: string;
  siteId: string;
}
