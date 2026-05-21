import {
  createApiSuccessMessageResponse,
  createApiErrorMessageResponse,
} from "@/lib/api-messages";
import { API_RESPONSE_CODES } from "@/lib/api-response";
import { API_ERROR_CODES } from "@/lib/api-error";
import type { CustomerBooking } from "@/features/customer/types";
import type { CrewJob, CrewSession } from "@/features/crew/types";
import type {
  AdminQueueResponse,
  AdminBookingDetail,
  AdminReport,
} from "@/features/admin/types";

/**
 * Shared meta stub — swap with real requestId/timestamp in tests.
 */
const META = {
  requestId: "req_01HXZ6Q2M8K9A0Q3D2Z7X5C1B9",
  timestamp: "2026-05-21T09:00:00.000Z",
};

// ─── Customer — Success ───────────────────────────────────────────────────────

export const customerSuccessExamples = {
  /** FR-01: QR resolved, draft booking created */
  bookingCreated: createApiSuccessMessageResponse<CustomerBooking>({
    code: API_RESPONSE_CODES.BOOKING_CREATED,
    data: {
      id: "book_01HXZ6Q2K8F8G4V2K7YQJ9Z1A4",
      signedToken: "signed_booking_token_example",
      status: "DRAFT",
      siteName: "Park & Shine - Grand Indonesia",
      plateText: null,
      slotText: null,
      priceAmount: 75000,
      currency: "IDR",
      estimatedReadyAt: null,
      media: [],
      statusHistory: [],
    },
    meta: META,
  }),

  /** FR-04: Status page polling — booking IN_PROGRESS */
  bookingFetched: createApiSuccessMessageResponse<CustomerBooking>({
    code: API_RESPONSE_CODES.BOOKING_FETCHED,
    data: {
      id: "book_01HXZ6Q2K8F8G4V2K7YQJ9Z1A4",
      signedToken: "signed_booking_token_example",
      status: "IN_PROGRESS",
      siteName: "Park & Shine - Grand Indonesia",
      plateText: "B 1234 ABC",
      slotText: "P2-A17",
      priceAmount: 75000,
      currency: "IDR",
      estimatedReadyAt: "2026-05-21T09:30:00.000Z",
      media: [
        {
          id: "media_plate_01",
          kind: "plate",
          url: "https://cdn.park-shine.com/media/plate_example.jpg",
          ocrText: "B 1234 ABC",
        },
      ],
      statusHistory: [
        { status: "DRAFT", changedAt: "2026-05-21T09:00:00.000Z", labelKey: "status.draft" },
        { status: "PENDING", changedAt: "2026-05-21T09:01:00.000Z", labelKey: "status.pending" },
        { status: "PAID", changedAt: "2026-05-21T09:03:00.000Z", labelKey: "status.paid" },
        { status: "ASSIGNED", changedAt: "2026-05-21T09:05:00.000Z", labelKey: "status.assigned" },
        { status: "IN_PROGRESS", changedAt: "2026-05-21T09:10:00.000Z", labelKey: "status.inProgress" },
      ],
    },
    meta: META,
  }),

  /** FR-03: Confirm page → payment intent created, status PENDING */
  bookingConfirmed: createApiSuccessMessageResponse<CustomerBooking>({
    code: API_RESPONSE_CODES.BOOKING_CONFIRMED,
    data: {
      id: "book_01HXZ6Q2K8F8G4V2K7YQJ9Z1A4",
      signedToken: "signed_booking_token_example",
      status: "PENDING",
      siteName: "Park & Shine - Grand Indonesia",
      plateText: "B 1234 ABC",
      slotText: "P2-A17",
      priceAmount: 75000,
      currency: "IDR",
      estimatedReadyAt: null,
      media: [],
      statusHistory: [
        { status: "DRAFT", changedAt: "2026-05-21T09:00:00.000Z", labelKey: "status.draft" },
        { status: "PENDING", changedAt: "2026-05-21T09:01:00.000Z", labelKey: "status.pending" },
      ],
    },
    meta: META,
  }),

  /** FR-23: Customer-initiated payment status check — reconciled to PAID */
  paymentReconciled: createApiSuccessMessageResponse<CustomerBooking>({
    code: API_RESPONSE_CODES.PAYMENT_RECONCILED,
    data: {
      id: "book_01HXZ6Q2K8F8G4V2K7YQJ9Z1A4",
      signedToken: "signed_booking_token_example",
      status: "PAID",
      siteName: "Park & Shine - Grand Indonesia",
      plateText: "B 1234 ABC",
      slotText: "P2-A17",
      priceAmount: 75000,
      currency: "IDR",
      estimatedReadyAt: "2026-05-21T09:30:00.000Z",
      media: [],
      statusHistory: [
        { status: "DRAFT", changedAt: "2026-05-21T09:00:00.000Z", labelKey: "status.draft" },
        { status: "PENDING", changedAt: "2026-05-21T09:01:00.000Z", labelKey: "status.pending" },
        { status: "PAID", changedAt: "2026-05-21T09:03:00.000Z", labelKey: "status.paid" },
      ],
    },
    meta: META,
  }),

  /** FR-12: Post-wash rating submitted, booking CLOSED */
  ratingSubmitted: createApiSuccessMessageResponse<CustomerBooking>({
    code: API_RESPONSE_CODES.RATING_SUBMITTED,
    data: {
      id: "book_01HXZ6Q2K8F8G4V2K7YQJ9Z1A4",
      signedToken: "signed_booking_token_example",
      status: "CLOSED",
      siteName: "Park & Shine - Grand Indonesia",
      plateText: "B 1234 ABC",
      slotText: "P2-A17",
      priceAmount: 75000,
      currency: "IDR",
      estimatedReadyAt: "2026-05-21T09:28:00.000Z",
      media: [],
      statusHistory: [
        { status: "READY", changedAt: "2026-05-21T09:28:00.000Z", labelKey: "status.ready" },
        { status: "CLOSED", changedAt: "2026-05-21T09:35:00.000Z", labelKey: "status.closed" },
      ],
    },
    meta: META,
  }),
};

// ─── Customer — Error ─────────────────────────────────────────────────────────

export const customerErrorExamples = {
  /** FR-01: QR sudah dirotasi */
  qrRotated: createApiErrorMessageResponse({
    code: API_ERROR_CODES.QR_ROTATED,
    details: {
      qrId: "qr_grand_indonesia_p2_a17_old",
      rotatedAt: "2026-05-21T08:00:00.000Z",
    },
    meta: META,
  }),

  /** FR-01: QR tidak ditemukan di sistem */
  qrNotFound: createApiErrorMessageResponse({
    code: API_ERROR_CODES.QR_NOT_FOUND,
    details: { qrId: "qr_unknown_12345" },
    meta: META,
  }),

  /** FR-01: Booking sudah ditutup untuk hari ini */
  bookingCutoffPassed: createApiErrorMessageResponse({
    code: API_ERROR_CODES.BOOKING_CUTOFF_PASSED,
    details: { cutoffTime: "2026-05-21T21:00:00.000Z" },
    meta: META,
  }),

  /** FR-04: Booking sudah kadaluarsa */
  bookingExpired: createApiErrorMessageResponse({
    code: API_ERROR_CODES.BOOKING_EXPIRED,
    details: { bookingId: "book_01HXZ6Q2K8F8G4V2K7YQJ9Z1A4" },
    meta: META,
  }),

  /** FR-02: OCR gagal baca foto plat/slot */
  ocrFailed: createApiErrorMessageResponse({
    code: API_ERROR_CODES.OCR_FAILED,
    details: { mediaId: "media_plate_01" },
    meta: META,
  }),

  /** FR-03: Payment gateway bermasalah */
  paymentGatewayFailed: createApiErrorMessageResponse({
    code: API_ERROR_CODES.PAYMENT_GATEWAY_FAILED,
    details: { bookingId: "book_01HXZ6Q2K8F8G4V2K7YQJ9Z1A4" },
    meta: META,
  }),

  /** FR-19: Double tap "Pay" dicegah */
  doubleSubmitBlocked: createApiErrorMessageResponse({
    code: API_ERROR_CODES.DOUBLE_SUBMIT_BLOCKED,
    meta: META,
  }),
};

// ─── Crew — Success ───────────────────────────────────────────────────────────

export const crewSuccessExamples = {
  /** FR-22: Crew login dengan shift code + PIN */
  sessionCreated: createApiSuccessMessageResponse<CrewSession>({
    code: API_RESPONSE_CODES.SESSION_CREATED,
    data: {
      id: "session_01HXZ6Q5B8M2DN9S7W3R1T0K2P",
      crewId: "crew_01HXZ6Q5B8M2DN9S7W3R1T0K01",
      crewName: "Budi Santoso",
      siteId: "site_grand_indonesia",
      expiresAt: "2026-05-22T07:00:00.000Z",
      token: "crew_jwt_token_example",
    },
    meta: META,
  }),

  /** FR-05: Claim job berikutnya dari antrian */
  nextJobClaimed: createApiSuccessMessageResponse<CrewJob>({
    code: API_RESPONSE_CODES.NEXT_JOB_CLAIMED,
    data: {
      id: "job_01HXZ6Q5B8M2DN9S7W3R1T0K2P",
      bookingId: "book_01HXZ6Q2K8F8G4V2K7YQJ9Z1A4",
      status: "ASSIGNED",
      plateText: "B 1234 PNS",
      slotText: "P2-A17",
      supervisorPhone: "+6281234567890",
      assignedAt: "2026-05-21T09:05:00.000Z",
      etaEndsAt: "2026-05-21T09:35:00.000Z",
      media: [],
      checklist: [
        { id: "step_rinse", labelKey: "checklist.rinse", order: 1, completedAt: null },
        { id: "step_apply_waterless", labelKey: "checklist.applyWaterless", order: 2, completedAt: null },
        { id: "step_wipe", labelKey: "checklist.wipe", order: 3, completedAt: null },
        { id: "step_final_wipe", labelKey: "checklist.finalWipe", order: 4, completedAt: null },
      ],
    },
    meta: META,
  }),

  /** FR-06: Konfirmasi plat cocok → status IN_PROGRESS, SLA timer mulai */
  plateVerified: createApiSuccessMessageResponse<CrewJob>({
    code: API_RESPONSE_CODES.PLATE_VERIFIED,
    data: {
      id: "job_01HXZ6Q5B8M2DN9S7W3R1T0K2P",
      bookingId: "book_01HXZ6Q2K8F8G4V2K7YQJ9Z1A4",
      status: "IN_PROGRESS",
      plateText: "B 1234 PNS",
      slotText: "P2-A17",
      supervisorPhone: "+6281234567890",
      assignedAt: "2026-05-21T09:05:00.000Z",
      etaEndsAt: "2026-05-21T09:35:00.000Z",
      media: [],
      checklist: [
        { id: "step_rinse", labelKey: "checklist.rinse", order: 1, completedAt: null },
      ],
    },
    meta: META,
  }),

  /** FR-15: 4 foto before kendaraan berhasil diunggah semua */
  beforePhotoUploaded: createApiSuccessMessageResponse<CrewJob>({
    code: API_RESPONSE_CODES.BEFORE_PHOTO_UPLOADED,
    data: {
      id: "job_01HXZ6Q5B8M2DN9S7W3R1T0K2P",
      bookingId: "book_01HXZ6Q2K8F8G4V2K7YQJ9Z1A4",
      status: "IN_PROGRESS",
      plateText: "B 1234 PNS",
      slotText: "P2-A17",
      supervisorPhone: "+6281234567890",
      assignedAt: "2026-05-21T09:05:00.000Z",
      etaEndsAt: "2026-05-21T09:35:00.000Z",
      media: [
        { id: "media_before_front", kind: "front", url: "https://cdn.park-shine.com/media/before_front.jpg" },
        { id: "media_before_back", kind: "back", url: "https://cdn.park-shine.com/media/before_back.jpg" },
        { id: "media_before_left", kind: "left", url: "https://cdn.park-shine.com/media/before_left.jpg" },
        { id: "media_before_right", kind: "right", url: "https://cdn.park-shine.com/media/before_right.jpg" },
      ],
      checklist: [],
    },
    meta: META,
  }),

  /** FR-07: Satu langkah checklist berhasil disimpan ke server */
  checklistItemCompleted: createApiSuccessMessageResponse<CrewJob>({
    code: API_RESPONSE_CODES.CHECKLIST_ITEM_COMPLETED,
    data: {
      id: "job_01HXZ6Q5B8M2DN9S7W3R1T0K2P",
      bookingId: "book_01HXZ6Q2K8F8G4V2K7YQJ9Z1A4",
      status: "IN_PROGRESS",
      plateText: "B 1234 PNS",
      slotText: "P2-A17",
      supervisorPhone: "+6281234567890",
      assignedAt: "2026-05-21T09:05:00.000Z",
      etaEndsAt: "2026-05-21T09:35:00.000Z",
      media: [],
      checklist: [
        { id: "step_rinse", labelKey: "checklist.rinse", order: 1, completedAt: "2026-05-21T09:12:00.000Z" },
        { id: "step_apply_waterless", labelKey: "checklist.applyWaterless", order: 2, completedAt: null },
        { id: "step_wipe", labelKey: "checklist.wipe", order: 3, completedAt: null },
        { id: "step_final_wipe", labelKey: "checklist.finalWipe", order: 4, completedAt: null },
      ],
    },
    meta: META,
  }),

  /** FR-07: Semua checklist selesai, foto after diunggah, job READY */
  jobCompleted: createApiSuccessMessageResponse<CrewJob>({
    code: API_RESPONSE_CODES.JOB_COMPLETED,
    data: {
      id: "job_01HXZ6Q5B8M2DN9S7W3R1T0K2P",
      bookingId: "book_01HXZ6Q2K8F8G4V2K7YQJ9Z1A4",
      status: "READY",
      plateText: "B 1234 PNS",
      slotText: "P2-A17",
      supervisorPhone: "+6281234567890",
      assignedAt: "2026-05-21T09:05:00.000Z",
      etaEndsAt: "2026-05-21T09:35:00.000Z",
      media: [
        { id: "media_after", kind: "after", url: "https://cdn.park-shine.com/media/after.jpg" },
      ],
      checklist: [
        { id: "step_rinse", labelKey: "checklist.rinse", order: 1, completedAt: "2026-05-21T09:12:00.000Z" },
        { id: "step_apply_waterless", labelKey: "checklist.applyWaterless", order: 2, completedAt: "2026-05-21T09:15:00.000Z" },
        { id: "step_wipe", labelKey: "checklist.wipe", order: 3, completedAt: "2026-05-21T09:20:00.000Z" },
        { id: "step_final_wipe", labelKey: "checklist.finalWipe", order: 4, completedAt: "2026-05-21T09:25:00.000Z" },
      ],
    },
    meta: META,
  }),
};

// ─── Crew — Error ─────────────────────────────────────────────────────────────

export const crewErrorExamples = {
  /** FR-05: Tidak ada job tersedia di antrian */
  noJobAvailable: createApiErrorMessageResponse({
    code: API_ERROR_CODES.NO_JOB_AVAILABLE,
    details: { siteId: "site_grand_indonesia" },
    meta: META,
  }),

  /** FR-05: Claim job gagal (race condition) */
  jobClaimFailed: createApiErrorMessageResponse({
    code: API_ERROR_CODES.JOB_CLAIM_FAILED,
    details: { jobId: "job_01HXZ6Q5B8M2DN9S7W3R1T0K2P" },
    meta: META,
  }),

  /** FR-06: Plat tidak cocok → eskalasi ke supervisor */
  plateMismatch: createApiErrorMessageResponse({
    code: API_ERROR_CODES.PLATE_MISMATCH,
    details: {
      jobId: "job_01HXZ6Q5B8M2DN9S7W3R1T0K2P",
      expectedPlate: "B 1234 PNS",
    },
    meta: META,
  }),

  /** FR-15: Belum semua 4 foto before diunggah */
  beforePhotosRequired: createApiErrorMessageResponse({
    code: API_ERROR_CODES.BEFORE_PHOTOS_REQUIRED,
    details: {
      jobId: "job_01HXZ6Q5B8M2DN9S7W3R1T0K2P",
      missingKinds: ["left", "right"],
    },
    meta: META,
  }),

  /** FR-07: Mencoba skip langkah checklist */
  checklistOutOfOrder: createApiErrorMessageResponse({
    code: API_ERROR_CODES.CHECKLIST_OUT_OF_ORDER,
    details: {
      currentStepId: "step_apply_waterless_solution",
      attemptedStepId: "step_final_wipe",
      jobId: "job_01HXZ6Q5B8M2DN9S7W3R1T0K2P",
    },
    fieldErrors: [
      {
        code: API_ERROR_CODES.CHECKLIST_OUT_OF_ORDER,
        field: "checklistItemId",
        message: "Checklist harus diselesaikan sesuai urutan.",
      },
    ],
    meta: META,
  }),

  /** FR-22: Sesi crew sudah expire setelah 12 jam */
  crewSessionExpired: createApiErrorMessageResponse({
    code: API_ERROR_CODES.CREW_SESSION_EXPIRED,
    details: { expiredAt: "2026-05-21T09:00:00.000Z" },
    meta: META,
  }),

  /** FR-22: Shift code salah saat login */
  shiftCodeInvalid: createApiErrorMessageResponse({
    code: API_ERROR_CODES.SHIFT_CODE_INVALID,
    fieldErrors: [
      { field: "shiftCode", message: "Shift code tidak valid." },
    ],
    meta: META,
  }),
};

// ─── Admin — Success ──────────────────────────────────────────────────────────

export const adminSuccessExamples = {
  /** FR-09: Live queue berhasil dimuat, dikelompokkan per status */
  adminQueueFetched: createApiSuccessMessageResponse<AdminQueueResponse>({
    code: API_RESPONSE_CODES.ADMIN_QUEUE_FETCHED,
    data: {
      siteId: "site_grand_indonesia",
      fetchedAt: "2026-05-21T09:00:00.000Z",
      escalations: [
        {
          id: "book_stale_01",
          signedToken: "token_stale",
          status: "STALE",
          siteName: "Park & Shine - Grand Indonesia",
          plateText: "B 9999 STL",
          slotText: "P1-B02",
          priceAmount: 75000,
          currency: "IDR",
          estimatedReadyAt: null,
          media: [],
          statusHistory: [],
          crewName: null,
          elapsedSeconds: 1380,
        },
      ],
      groups: [
        {
          status: "PAID",
          bookings: [
            {
              id: "book_01HXZ6Q2K8F8G4V2K7YQJ9Z1A4",
              signedToken: "signed_booking_token_example",
              status: "PAID",
              siteName: "Park & Shine - Grand Indonesia",
              plateText: "B 1234 ABC",
              slotText: "P2-A17",
              priceAmount: 75000,
              currency: "IDR",
              estimatedReadyAt: "2026-05-21T09:30:00.000Z",
              media: [],
              statusHistory: [],
              crewName: null,
              elapsedSeconds: 240,
            },
          ],
        },
        {
          status: "IN_PROGRESS",
          bookings: [
            {
              id: "book_01HXZ6Q2K8F8G4V2K7YQJ9Z002",
              signedToken: "signed_booking_token_2",
              status: "IN_PROGRESS",
              siteName: "Park & Shine - Grand Indonesia",
              plateText: "D 5678 XYZ",
              slotText: "P1-A05",
              priceAmount: 75000,
              currency: "IDR",
              estimatedReadyAt: "2026-05-21T09:20:00.000Z",
              media: [],
              statusHistory: [],
              crewName: "Budi Santoso",
              elapsedSeconds: 720,
            },
          ],
        },
      ],
    },
    meta: META,
  }),

  /** FR-09: Job berhasil direassign ke crew lain + audit trail */
  jobReassigned: createApiSuccessMessageResponse<AdminBookingDetail>({
    code: API_RESPONSE_CODES.JOB_REASSIGNED,
    data: {
      id: "book_01HXZ6Q2K8F8G4V2K7YQJ9Z1A4",
      signedToken: "signed_booking_token_example",
      status: "ASSIGNED",
      siteName: "Park & Shine - Grand Indonesia",
      plateText: "B 1234 ABC",
      slotText: "P2-A17",
      priceAmount: 75000,
      currency: "IDR",
      estimatedReadyAt: "2026-05-21T09:30:00.000Z",
      media: [],
      statusHistory: [],
      crewName: "Agus Widodo",
      elapsedSeconds: 300,
      auditEntries: [
        {
          id: "audit_01",
          bookingId: "book_01HXZ6Q2K8F8G4V2K7YQJ9Z1A4",
          plateText: "B 1234 ABC",
          action: "reassign",
          detail: "Dialihkan ke Agus Widodo. Alasan: Crew sebelumnya tidak hadir.",
          adminEmail: "supervisor@park-shine.com",
          createdAt: "2026-05-21T09:05:00.000Z",
        },
      ],
    },
    meta: META,
  }),

  /** FR-10: Refund full berhasil diproses + audit trail */
  refundCreated: createApiSuccessMessageResponse<AdminBookingDetail>({
    code: API_RESPONSE_CODES.REFUND_CREATED,
    data: {
      id: "book_01HXZ6Q2K8F8G4V2K7YQJ9Z1A4",
      signedToken: "signed_booking_token_example",
      status: "CANCELLED",
      siteName: "Park & Shine - Grand Indonesia",
      plateText: "B 1234 ABC",
      slotText: "P2-A17",
      priceAmount: 75000,
      currency: "IDR",
      estimatedReadyAt: null,
      media: [],
      statusHistory: [],
      crewName: null,
      elapsedSeconds: 180,
      auditEntries: [
        {
          id: "audit_02",
          bookingId: "book_01HXZ6Q2K8F8G4V2K7YQJ9Z1A4",
          plateText: "B 1234 ABC",
          action: "refund",
          detail: "Refund penuh Rp75.000. Alasan: Mobil tidak bisa dicuci.",
          adminEmail: "supervisor@park-shine.com",
          createdAt: "2026-05-21T09:10:00.000Z",
        },
      ],
    },
    meta: META,
  }),

  /** FR-17: Manual status override PENDING → PAID + audit trail */
  statusOverridden: createApiSuccessMessageResponse<AdminBookingDetail>({
    code: API_RESPONSE_CODES.STATUS_OVERRIDDEN,
    data: {
      id: "book_01HXZ6Q2K8F8G4V2K7YQJ9Z1A4",
      signedToken: "signed_booking_token_example",
      status: "PAID",
      siteName: "Park & Shine - Grand Indonesia",
      plateText: "B 1234 ABC",
      slotText: "P2-A17",
      priceAmount: 75000,
      currency: "IDR",
      estimatedReadyAt: "2026-05-21T09:30:00.000Z",
      media: [],
      statusHistory: [],
      crewName: null,
      elapsedSeconds: 120,
      auditEntries: [
        {
          id: "audit_03",
          bookingId: "book_01HXZ6Q2K8F8G4V2K7YQJ9Z1A4",
          plateText: "B 1234 ABC",
          action: "status_override",
          detail: "Status diubah dari PENDING ke PAID. Alasan: Bank konfirmasi lunas, webhook tidak masuk.",
          adminEmail: "supervisor@park-shine.com",
          createdAt: "2026-05-21T09:03:00.000Z",
        },
      ],
    },
    meta: META,
  }),

  /** FR-11: Laporan harian KPI site berhasil dimuat */
  dailyReportFetched: createApiSuccessMessageResponse<AdminReport>({
    code: API_RESPONSE_CODES.DAILY_REPORT_FETCHED,
    data: {
      siteId: "site_grand_indonesia",
      from: "2026-05-21",
      to: "2026-05-21",
      summary: {
        siteId: "site_grand_indonesia",
        date: "2026-05-21",
        totalBookings: 42,
        completionRate: 0.93,
        slaHitRate: 0.88,
        averageRating: 4.6,
        revenue: 3150000,
      },
      breakdown: [
        {
          date: "2026-05-21",
          totalBookings: 42,
          completed: 39,
          slaHitRate: 0.88,
          averageRating: 4.6,
          revenue: 3150000,
        },
      ],
    },
    meta: META,
  }),
};

// ─── Admin — Error ────────────────────────────────────────────────────────────

export const adminErrorExamples = {
  /** FR-09: Reassign gagal (crew tidak tersedia / conflict) */
  reassignFailed: createApiErrorMessageResponse({
    code: API_ERROR_CODES.REASSIGN_FAILED,
    details: {
      bookingId: "book_01HXZ6Q2K8F8G4V2K7YQJ9Z1A4",
      targetCrewId: "crew_02",
    },
    meta: META,
  }),

  /** FR-10: Refund gagal di payment gateway */
  refundFailed: createApiErrorMessageResponse({
    code: API_ERROR_CODES.REFUND_FAILED,
    details: {
      bookingId: "book_01HXZ6Q2K8F8G4V2K7YQJ9Z1A4",
      gateway: "midtrans",
    },
    meta: META,
  }),

  /** FR-10: Reason code refund tidak diisi */
  refundReasonRequired: createApiErrorMessageResponse({
    code: API_ERROR_CODES.REFUND_REASON_REQUIRED,
    fieldErrors: [
      { field: "reasonCode", message: "Pilih alasan refund terlebih dahulu." },
    ],
    meta: META,
  }),

  /** FR-17: Transisi status tidak valid (misal READY → PAID) */
  statusOverrideInvalid: createApiErrorMessageResponse({
    code: API_ERROR_CODES.STATUS_OVERRIDE_INVALID,
    details: {
      currentStatus: "READY",
      attemptedStatus: "PAID",
    },
    meta: META,
  }),

  /** FR-17: Reason code override tidak diisi */
  statusOverrideReasonRequired: createApiErrorMessageResponse({
    code: API_ERROR_CODES.STATUS_OVERRIDE_REASON_REQUIRED,
    fieldErrors: [
      { field: "reasonCode", message: "Alasan perubahan status wajib diisi." },
    ],
    meta: META,
  }),

  /** FR-11: Laporan gagal dimuat dari server */
  reportFetchFailed: createApiErrorMessageResponse({
    code: API_ERROR_CODES.REPORT_FETCH_FAILED,
    details: {
      siteId: "site_grand_indonesia",
      from: "2026-05-21",
      to: "2026-05-21",
    },
    meta: META,
  }),

  /** FR-21: Booking PAID belum di-claim melewati threshold (default 20 menit) */
  staleJobTimeout: createApiErrorMessageResponse({
    code: API_ERROR_CODES.STALE_JOB_TIMEOUT,
    details: {
      bookingId: "book_stale_01",
      elapsedMinutes: 23,
      thresholdMinutes: 20,
    },
    meta: META,
  }),

  /** FR-09: Akses admin tanpa SSO Google Workspace */
  adminAuthRequired: createApiErrorMessageResponse({
    code: API_ERROR_CODES.ADMIN_AUTH_REQUIRED,
    meta: META,
  }),
};

// ─── Backward-compat flat exports ─────────────────────────────────────────────

export const successResponseExamples = {
  ...customerSuccessExamples,
  ...crewSuccessExamples,
  ...adminSuccessExamples,
};

export const errorResponseExamples = {
  ...customerErrorExamples,
  ...crewErrorExamples,
  ...adminErrorExamples,
};
