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

export interface AdminSiteQueue {
  siteId: string;
  siteName: string;
  groups: AdminQueueStatusGroup[];
  escalations: AdminQueueBooking[];
}

export interface AdminAllSitesQueueResponse {
  fetchedAt: string;
  sites: AdminSiteQueue[];
}

export interface AdminEscalationBooking extends AdminQueueBooking {
  siteId: string;
}

export interface AdminEscalationsResponse {
  fetchedAt: string;
  escalations: AdminEscalationBooking[];
}

export interface AdminTimeExtensionRequestsResponse {
  requests: TimeExtensionRequest[];
}

export interface AdminExpiringJobsResponse {
  fetchedAt: string;
  jobs: AdminEscalationBooking[];
}

export interface RefundPayload {
  reasonCode: string;
}

export interface StatusOverridePayload {
  nextStatus: Extract<
    BookingStatus,
    "PAID" | "CANCELLED" | "STALE" | "ASSIGNED" | "IN_PROGRESS" | "CLOSED"
  >;
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
  timeExtensionCount: number;
}

export interface AuditEntry {
  id: string;
  bookingId: string;
  reference: string | null;
  plateText: string | null;
  action:
    | "refund"
    | "status_override"
    | "reassign"
    | "extend_time"
    | "crew.job_rejected"
    | "crew.requested_help"
    | "crew.requested_wait"
    | "crew.request_time_extension"
    | "booking.status_changed"
    | "approve_time_extension"
    | "reject_time_extension";
  detail: string;
  adminEmail: string;
  createdAt: string;
}

export interface AdminReport {
  siteId?: string;
  period: { from: string; to: string };
  bookings: {
    total: number;
    byStatus: Record<string, number>;
  };
  payments: {
    byStatus: Record<string, number>;
  };
  revenue: {
    totalGross: number;
    totalPaid: number;
    totalRefunded: number;
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
  reference: string | null;
  createdAt: string;
  siteName: string | null;
  slot: string | null;
  crewName: string | null;
  status: string;
  price: number;
  paidAt: string | null;
  refundedAmount: number;
  paymentMethod: string | null;
  paymentStatus: string;
  rating: number | null;
  ratingNote: string | null;
  duration: ReportBookingDuration;
  photos: ReportPhotoAsset[];
  phone: string | null;
  plate: string | null;
  notificationSentAt: string | null;
}

export interface AdminSettings {
  whatsappNumber: string;
  avgCleaningMinutes: number;
  paymentExpiryMinutes: number;
  crewTimeExtensionMinutes: number;
  washPrice: number;
  loyaltyEnabled: boolean;
  loyaltyOtpChannel: string;
  signupDiscountPercent: number;
  loyaltyWashThreshold: number;
  loyaltyRewardDiscountPercent: number;
}

export interface AdminSite {
  id: string;
  name: string;
}

export interface TimeExtensionRequest {
  id: string;
  bookingId: string;
  crewId: string;
  requestedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  minutes: number | null;
  respondedAt: string | null;
  respondedBy: string | null;
}

export interface AdminBookingDetail extends AdminQueueBooking {
  auditEntries: AuditEntry[];
  pendingTimeExtension?: TimeExtensionRequest | null;
  notificationSentAt: string | null;
}

export interface AdminSiteDetail {
  id: string;
  name: string;
  address: string;
  timezone: string;
  intakePaused: boolean;
  code: string | null;
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
  code?: string | null;
  cutoffTime?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export interface UpdateSitePayload {
  name?: string;
  address?: string;
  timezone?: string;
  code?: string | null;
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
  busyStatus: string | null;
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

export interface AdminTestimonial {
  id: string;
  bookingId: string | null;
  authorName: string;
  rating: number;
  body: string;
  title: string | null;
  location: string | null;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestimonialPayload {
  bookingId?: string | null;
  authorName: string;
  rating: number;
  body: string;
  title?: string;
  location?: string;
  featured?: boolean;
  order?: number;
}

export interface UpdateTestimonialPayload {
  authorName?: string;
  rating?: number;
  body?: string;
  title?: string | null;
  location?: string | null;
  featured?: boolean;
  order?: number;
}

// ── WhatsApp Chat ────────────────────────────────────────────────────────────

export interface ChatConversation {
  id: string;
  phone: string;
  customerId: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  windowOpen: boolean;
}

export type MessageDirection = "INBOUND" | "OUTBOUND";
export type MessageStatus = "SENT" | "FAILED" | "RECEIVED";

export interface ChatMessage {
  id: string;
  conversationId: string;
  direction: MessageDirection;
  type: string;
  body: string;
  status: MessageStatus;
  providerMessageId: string | null;
  errorCode: string | null;
  createdAt: string;
}
