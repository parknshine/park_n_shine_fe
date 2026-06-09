import type { BookingStatus, CustomerBooking } from "@/features/customer/types";

export interface AdminQueueBooking extends CustomerBooking {
  crewName?: string | null;
  elapsedSeconds: number;
  rejectionCount?: number;
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
  nextStatus: Extract<BookingStatus, "PAID" | "CANCELLED" | "STALE" | "ASSIGNED" | "IN_PROGRESS" | "CLOSED">;
  reasonCode: string;
}

export interface ReassignBookingPayload {
  crewId: string;
  reasonCode?: string;
}

export interface ReportCrewPerformance {
  crewId: string;
  crewName: string;
  jobsCompleted: number;
  avgTurnaroundSeconds: number | null;
  estimatedRevenue: number;
  staleCount: number;
  needsHelpCount: number;
  rejectedCount: number;
  reliabilityScore: number | null;
  avgRating: number | null;
}

export interface AuditEntry {
  id: string;
  bookingId: string;
  plateText: string | null;
  action: "refund" | "status_override" | "reassign" | "crew.job_rejected";
  detail: string;
  adminEmail: string;
  createdAt: string;
}

export interface AdminReport {
  siteId: string;
  period: { from: string; to: string };
  bookings: {
    total: number;
    byStatus: Record<string, number>;
  };
  revenue: {
    totalGross: number;
    currency: "IDR";
  };
  avgTurnaroundSeconds: number | null;
  crew: ReportCrewPerformance[];
}

export interface ReportPhotoAsset {
  type: string;
  storageKey: string;
  url: string | null;
}

export interface ReportBookingDuration {
  locateSeconds: number | null;
  washSeconds: number | null;
  totalJobSeconds: number | null;
}

export interface ReportBookingRow {
  id: string;
  createdAt: string;
  siteName: string | null;
  slot: string | null;
  crewName: string | null;
  status: string;
  price: number;
  rating: number | null;
  ratingNote: string | null;
  duration: ReportBookingDuration;
  photos: ReportPhotoAsset[];
}

export interface AdminSettings {
  staleJobTimeoutMinutes: number;
  jobEtaMinutes: number;
  whatsappNumber: string;
  avgCleaningMinutes: number;
  paymentExpiryMinutes: number;
  crewTimeExtensionMinutes: number;
}

export interface AdminSite {
  id: string;
  name: string;
}

export interface AdminBookingDetail extends AdminQueueBooking {
  auditEntries: AuditEntry[];
}

export interface AdminSiteDetail {
  id: string;
  name: string;
  address: string;
  timezone: string;
  intakePaused: boolean;
  cutoffTime: string | null;
  lat?: number | null;
  lng?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminQrCode {
  id: string;
  siteId: string;
  label: string;
  rotatedAt: string | null;
  createdAt: string;
}

export interface CreateSitePayload {
  name: string;
  address: string;
  timezone: string;
  cutoffTime?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export interface UpdateSitePayload {
  name?: string;
  address?: string;
  timezone?: string;
  cutoffTime?: string | null;
  intakePaused?: boolean;
  lat?: number | null;
  lng?: number | null;
}

export interface GenerateQrPayload {
  label: string;
}

export interface RotateQrResult {
  oldQrId: string;
  newQr: AdminQrCode;
}

export interface AdminCrewMember {
  id: string;
  name: string;
  phone: string | null;
  active: boolean;
  createdAt: string;
  isBusy: boolean;
}

export interface AdminShiftCrewMember {
  id: string;
  name: string;
  active: boolean;
}

export interface AdminShift {
  id: string;
  siteId: string;
  shiftCode: string;
  startedAt: string;
  endedAt: string;
  isActive: boolean;
  createdAt: string;
  crewMembers: AdminShiftCrewMember[];
}

export interface CreateCrewPayload {
  name: string;
  pin: string;
  phone?: string;
}

export interface UpdateCrewPayload {
  name?: string;
  pin?: string;
  active?: boolean;
  phone?: string;
}

export interface CreateShiftPayload {
  crewMemberIds: string[];
}

export interface UpdateShiftCrewPayload {
  crewMemberIds: string[];
}
