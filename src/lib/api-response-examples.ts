import {
  API_RESPONSE_CODES,
  type ApiErrorResponse,
  type ApiSuccessResponse,
} from "@/lib/api-response";
import { API_ERROR_CODES } from "@/lib/api-error";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "@/lib/api-messages";
import type { CustomerBooking } from "@/features/customer/types";
import type { CrewJob } from "@/features/crew/types";

export const successResponseExamples = {
  bookingCreated: {
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
    message: getApiSuccessMessage(API_RESPONSE_CODES.BOOKING_CREATED),
    meta: {
      requestId: "req_01HXZ6Q2M8K9A0Q3D2Z7X5C1B9",
      timestamp: "2026-05-18T09:30:00.000Z",
    },
    success: true,
  } satisfies ApiSuccessResponse<CustomerBooking>,

  nextJobClaimed: {
    code: API_RESPONSE_CODES.NEXT_JOB_CLAIMED,
    data: {
      id: "job_01HXZ6Q5B8M2DN9S7W3R1T0K2P",
      bookingId: "book_01HXZ6Q2K8F8G4V2K7YQJ9Z1A4",
      status: "ASSIGNED",
      plateText: "B 1234 PNS",
      slotText: "P2-A17",
      assignedAt: "2026-05-18T09:35:00.000Z",
      etaEndsAt: "2026-05-18T10:05:00.000Z",
      media: [],
      checklist: [],
    },
    message: getApiSuccessMessage(API_RESPONSE_CODES.NEXT_JOB_CLAIMED),
    meta: {
      requestId: "req_01HXZ6Q5C9P0Y1N4V8K2J3S6T1",
      timestamp: "2026-05-18T09:35:00.000Z",
    },
    success: true,
  } satisfies ApiSuccessResponse<CrewJob>,
};

export const errorResponseExamples = {
  qrRotated: {
    code: API_ERROR_CODES.QR_ROTATED,
    details: {
      qrId: "qr_grand_indonesia_p2_a17_old",
      rotatedAt: "2026-05-18T08:00:00.000Z",
    },
    message: getApiErrorMessage(API_ERROR_CODES.QR_ROTATED),
    meta: {
      requestId: "req_01HXZ6R0S8Q9N4W2C6P1M3D7T5",
      timestamp: "2026-05-18T09:36:00.000Z",
    },
    success: false,
  } satisfies ApiErrorResponse,

  checklistOutOfOrder: {
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
        message: getApiErrorMessage(API_ERROR_CODES.CHECKLIST_OUT_OF_ORDER),
      },
    ],
    message: getApiErrorMessage(API_ERROR_CODES.CHECKLIST_OUT_OF_ORDER),
    meta: {
      requestId: "req_01HXZ6R5M1C8X7Z9K4Y2V0Q3P6",
      timestamp: "2026-05-18T09:37:00.000Z",
    },
    success: false,
  } satisfies ApiErrorResponse,
};
