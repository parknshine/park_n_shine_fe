import { AxiosError } from "axios";
import {
  isApiErrorResponse,
  type ApiErrorResponse,
  type ApiFieldError,
} from "@/lib/api-response";

export const API_ERROR_CODES = {
  ACTIVE_JOB_RESUME_FAILED: "ACTIVE_JOB_RESUME_FAILED",
  ADMIN_AUTH_REQUIRED: "ADMIN_AUTH_REQUIRED",
  ADMIN_INVALID_CREDENTIALS: "ADMIN_INVALID_CREDENTIALS",
  ADMIN_TOKEN_INVALID: "ADMIN_TOKEN_INVALID",
  AUTH_FORBIDDEN: "AUTH_FORBIDDEN",
  AUTH_UNAUTHORIZED: "AUTH_UNAUTHORIZED",
  BOOKING_ALREADY_CONFIRMED: "BOOKING_ALREADY_CONFIRMED",
  BOOKING_INVALID_STATUS_TRANSITION: "BOOKING_INVALID_STATUS_TRANSITION",
  BEFORE_PHOTOS_REQUIRED: "BEFORE_PHOTOS_REQUIRED",
  BOOKING_CANCELLED: "BOOKING_CANCELLED",
  BOOKING_CUTOFF_PASSED: "BOOKING_CUTOFF_PASSED",
  BOOKING_EXPIRED: "BOOKING_EXPIRED",
  BOOKING_NOT_FOUND: "BOOKING_NOT_FOUND",
  BOOKING_TOKEN_INVALID: "BOOKING_TOKEN_INVALID",
  CHECKLIST_OUT_OF_ORDER: "CHECKLIST_OUT_OF_ORDER",
  CHECKLIST_SAVE_FAILED: "CHECKLIST_SAVE_FAILED",
  CREW_INVALID_PIN: "CREW_INVALID_PIN",
  CREW_INVALID_SHIFT_CODE: "CREW_INVALID_SHIFT_CODE",
  CREW_SESSION_EXPIRED: "CREW_SESSION_EXPIRED",
  DOUBLE_SUBMIT_BLOCKED: "DOUBLE_SUBMIT_BLOCKED",
  IDEMPOTENCY_CONFLICT: "IDEMPOTENCY_CONFLICT",
  IMAGE_COMPRESSION_FAILED: "IMAGE_COMPRESSION_FAILED",
  IMAGE_TOO_LARGE: "IMAGE_TOO_LARGE",
  INTAKE_PAUSED: "INTAKE_PAUSED",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
  JOB_CLAIM_FAILED: "JOB_CLAIM_FAILED",
  JOB_NEEDS_HELP: "JOB_NEEDS_HELP",
  NETWORK_OFFLINE: "NETWORK_OFFLINE",
  NO_JOB_AVAILABLE: "NO_JOB_AVAILABLE",
  OCR_FAILED: "OCR_FAILED",
  OCR_LOW_CONFIDENCE: "OCR_LOW_CONFIDENCE",
  PAYMENT_GATEWAY_FAILED: "PAYMENT_GATEWAY_FAILED",
  PAYMENT_INTENT_EXISTS: "PAYMENT_INTENT_EXISTS",
  PAYMENT_RECONCILIATION_FAILED: "PAYMENT_RECONCILIATION_FAILED",
  PAYMENT_STATUS_PENDING: "PAYMENT_STATUS_PENDING",
  PIN_INVALID: "PIN_INVALID",
  PLATE_MISMATCH: "PLATE_MISMATCH",
  PLATE_PHOTO_REQUIRED: "PLATE_PHOTO_REQUIRED",
  PUSH_PERMISSION_DENIED: "PUSH_PERMISSION_DENIED",
  QR_NOT_FOUND: "QR_NOT_FOUND",
  QR_ROTATED: "QR_ROTATED",
  RATE_LIMITED: "RATE_LIMITED",
  RATING_INVALID: "RATING_INVALID",
  REASSIGN_FAILED: "REASSIGN_FAILED",
  REFUND_FAILED: "REFUND_FAILED",
  REFUND_REASON_REQUIRED: "REFUND_REASON_REQUIRED",
  REPORT_FETCH_FAILED: "REPORT_FETCH_FAILED",
  SERVER_ERROR: "SERVER_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  SHIFT_CODE_INVALID: "SHIFT_CODE_INVALID",
  SLOT_PHOTO_REQUIRED: "SLOT_PHOTO_REQUIRED",
  SSO_REQUIRED: "SSO_REQUIRED",
  STALE_JOB_TIMEOUT: "STALE_JOB_TIMEOUT",
  STATUS_OVERRIDE_INVALID: "STATUS_OVERRIDE_INVALID",
  STATUS_OVERRIDE_REASON_REQUIRED: "STATUS_OVERRIDE_REASON_REQUIRED",
  STATUS_POLL_FAILED: "STATUS_POLL_FAILED",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  UNSUPPORTED_LOCALE: "UNSUPPORTED_LOCALE",
  UPLOAD_FAILED: "UPLOAD_FAILED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  WHATSAPP_LINK_INVALID: "WHATSAPP_LINK_INVALID",
} as const;

export type ApiErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export type ApiErrorSeverity = "info" | "warning" | "error" | "critical";
export type ApiErrorSurface = "customer" | "crew" | "admin" | "shared";

export interface ApiErrorDefinition {
  defaultHttpStatus: number;
  isRetryable: boolean;
  messageKey: string;
  requirement: "GLOBAL" | `FR-${number}`;
  severity: ApiErrorSeverity;
  surface: ApiErrorSurface;
}

export const API_ERROR_DEFINITIONS: Record<ApiErrorCode, ApiErrorDefinition> = {
  ACTIVE_JOB_RESUME_FAILED: {
    defaultHttpStatus: 409,
    isRetryable: true,
    messageKey: "errors.crew.activeJobResumeFailed",
    requirement: "FR-18",
    severity: "error",
    surface: "crew",
  },
  ADMIN_AUTH_REQUIRED: {
    defaultHttpStatus: 401,
    isRetryable: false,
    messageKey: "errors.admin.authRequired",
    requirement: "FR-09",
    severity: "error",
    surface: "admin",
  },
  ADMIN_INVALID_CREDENTIALS: {
    defaultHttpStatus: 401,
    isRetryable: false,
    messageKey: "errors.admin.invalidCredentials",
    requirement: "FR-09",
    severity: "error",
    surface: "admin",
  },
  ADMIN_TOKEN_INVALID: {
    defaultHttpStatus: 401,
    isRetryable: false,
    messageKey: "errors.admin.authRequired",
    requirement: "FR-09",
    severity: "error",
    surface: "admin",
  },
  AUTH_FORBIDDEN: {
    defaultHttpStatus: 403,
    isRetryable: false,
    messageKey: "errors.shared.forbidden",
    requirement: "GLOBAL",
    severity: "error",
    surface: "shared",
  },
  AUTH_UNAUTHORIZED: {
    defaultHttpStatus: 401,
    isRetryable: false,
    messageKey: "errors.shared.unauthorized",
    requirement: "GLOBAL",
    severity: "error",
    surface: "shared",
  },
  BEFORE_PHOTOS_REQUIRED: {
    defaultHttpStatus: 422,
    isRetryable: false,
    messageKey: "errors.crew.beforePhotosRequired",
    requirement: "FR-15",
    severity: "warning",
    surface: "crew",
  },
  BOOKING_CANCELLED: {
    defaultHttpStatus: 409,
    isRetryable: false,
    messageKey: "errors.customer.bookingCancelled",
    requirement: "FR-04",
    severity: "warning",
    surface: "customer",
  },
  BOOKING_CUTOFF_PASSED: {
    defaultHttpStatus: 409,
    isRetryable: false,
    messageKey: "errors.customer.bookingCutoffPassed",
    requirement: "FR-01",
    severity: "warning",
    surface: "customer",
  },
  BOOKING_EXPIRED: {
    defaultHttpStatus: 410,
    isRetryable: false,
    messageKey: "errors.customer.bookingExpired",
    requirement: "FR-04",
    severity: "warning",
    surface: "customer",
  },
  BOOKING_ALREADY_CONFIRMED: {
    defaultHttpStatus: 409,
    isRetryable: false,
    messageKey: "errors.customer.bookingAlreadyConfirmed",
    requirement: "FR-04",
    severity: "warning",
    surface: "customer",
  },
  BOOKING_INVALID_STATUS_TRANSITION: {
    defaultHttpStatus: 409,
    isRetryable: false,
    messageKey: "errors.shared.invalidStatusTransition",
    requirement: "GLOBAL",
    severity: "error",
    surface: "shared",
  },
  BOOKING_NOT_FOUND: {
    defaultHttpStatus: 404,
    isRetryable: false,
    messageKey: "errors.customer.bookingNotFound",
    requirement: "FR-04",
    severity: "error",
    surface: "customer",
  },
  BOOKING_TOKEN_INVALID: {
    defaultHttpStatus: 401,
    isRetryable: false,
    messageKey: "errors.customer.bookingTokenInvalid",
    requirement: "FR-04",
    severity: "error",
    surface: "customer",
  },
  CHECKLIST_OUT_OF_ORDER: {
    defaultHttpStatus: 409,
    isRetryable: false,
    messageKey: "errors.crew.checklistOutOfOrder",
    requirement: "FR-07",
    severity: "warning",
    surface: "crew",
  },
  CHECKLIST_SAVE_FAILED: {
    defaultHttpStatus: 503,
    isRetryable: true,
    messageKey: "errors.crew.checklistSaveFailed",
    requirement: "FR-07",
    severity: "error",
    surface: "crew",
  },
  CREW_INVALID_PIN: {
    defaultHttpStatus: 401,
    isRetryable: false,
    messageKey: "errors.crew.pinInvalid",
    requirement: "FR-22",
    severity: "error",
    surface: "crew",
  },
  CREW_INVALID_SHIFT_CODE: {
    defaultHttpStatus: 401,
    isRetryable: false,
    messageKey: "errors.crew.shiftCodeInvalid",
    requirement: "FR-22",
    severity: "error",
    surface: "crew",
  },
  CREW_SESSION_EXPIRED: {
    defaultHttpStatus: 401,
    isRetryable: false,
    messageKey: "errors.crew.sessionExpired",
    requirement: "FR-22",
    severity: "error",
    surface: "crew",
  },
  DOUBLE_SUBMIT_BLOCKED: {
    defaultHttpStatus: 409,
    isRetryable: false,
    messageKey: "errors.customer.doubleSubmitBlocked",
    requirement: "FR-19",
    severity: "info",
    surface: "customer",
  },
  IDEMPOTENCY_CONFLICT: {
    defaultHttpStatus: 409,
    isRetryable: false,
    messageKey: "errors.customer.idempotencyConflict",
    requirement: "FR-19",
    severity: "error",
    surface: "customer",
  },
  IMAGE_COMPRESSION_FAILED: {
    defaultHttpStatus: 422,
    isRetryable: false,
    messageKey: "errors.customer.imageCompressionFailed",
    requirement: "FR-20",
    severity: "error",
    surface: "customer",
  },
  IMAGE_TOO_LARGE: {
    defaultHttpStatus: 413,
    isRetryable: false,
    messageKey: "errors.customer.imageTooLarge",
    requirement: "FR-20",
    severity: "warning",
    surface: "customer",
  },
  INTAKE_PAUSED: {
    defaultHttpStatus: 409,
    isRetryable: false,
    messageKey: "errors.customer.intakePaused",
    requirement: "FR-01",
    severity: "warning",
    surface: "customer",
  },
  INVALID_FILE_TYPE: {
    defaultHttpStatus: 415,
    isRetryable: false,
    messageKey: "errors.shared.invalidFileType",
    requirement: "GLOBAL",
    severity: "warning",
    surface: "shared",
  },
  JOB_CLAIM_FAILED: {
    defaultHttpStatus: 409,
    isRetryable: true,
    messageKey: "errors.crew.jobClaimFailed",
    requirement: "FR-05",
    severity: "error",
    surface: "crew",
  },
  JOB_NEEDS_HELP: {
    defaultHttpStatus: 409,
    isRetryable: false,
    messageKey: "errors.crew.jobNeedsHelp",
    requirement: "FR-06",
    severity: "warning",
    surface: "crew",
  },
  NETWORK_OFFLINE: {
    defaultHttpStatus: 0,
    isRetryable: true,
    messageKey: "errors.shared.networkOffline",
    requirement: "GLOBAL",
    severity: "warning",
    surface: "shared",
  },
  NO_JOB_AVAILABLE: {
    defaultHttpStatus: 404,
    isRetryable: true,
    messageKey: "errors.crew.noJobAvailable",
    requirement: "FR-05",
    severity: "info",
    surface: "crew",
  },
  OCR_FAILED: {
    defaultHttpStatus: 422,
    isRetryable: false,
    messageKey: "errors.customer.ocrFailed",
    requirement: "FR-02",
    severity: "warning",
    surface: "customer",
  },
  OCR_LOW_CONFIDENCE: {
    defaultHttpStatus: 422,
    isRetryable: false,
    messageKey: "errors.customer.ocrLowConfidence",
    requirement: "FR-02",
    severity: "warning",
    surface: "customer",
  },
  PAYMENT_GATEWAY_FAILED: {
    defaultHttpStatus: 502,
    isRetryable: true,
    messageKey: "errors.customer.paymentGatewayFailed",
    requirement: "FR-03",
    severity: "error",
    surface: "customer",
  },
  PAYMENT_INTENT_EXISTS: {
    defaultHttpStatus: 409,
    isRetryable: false,
    messageKey: "errors.customer.paymentIntentExists",
    requirement: "FR-19",
    severity: "info",
    surface: "customer",
  },
  PAYMENT_RECONCILIATION_FAILED: {
    defaultHttpStatus: 502,
    isRetryable: true,
    messageKey: "errors.customer.paymentReconciliationFailed",
    requirement: "FR-23",
    severity: "error",
    surface: "customer",
  },
  PAYMENT_STATUS_PENDING: {
    defaultHttpStatus: 202,
    isRetryable: true,
    messageKey: "errors.customer.paymentStatusPending",
    requirement: "FR-23",
    severity: "info",
    surface: "customer",
  },
  PIN_INVALID: {
    defaultHttpStatus: 401,
    isRetryable: false,
    messageKey: "errors.crew.pinInvalid",
    requirement: "FR-22",
    severity: "error",
    surface: "crew",
  },
  PLATE_MISMATCH: {
    defaultHttpStatus: 409,
    isRetryable: false,
    messageKey: "errors.crew.plateMismatch",
    requirement: "FR-06",
    severity: "warning",
    surface: "crew",
  },
  PLATE_PHOTO_REQUIRED: {
    defaultHttpStatus: 422,
    isRetryable: false,
    messageKey: "errors.customer.platePhotoRequired",
    requirement: "FR-02",
    severity: "warning",
    surface: "customer",
  },
  PUSH_PERMISSION_DENIED: {
    defaultHttpStatus: 403,
    isRetryable: false,
    messageKey: "errors.customer.pushPermissionDenied",
    requirement: "FR-08",
    severity: "info",
    surface: "customer",
  },
  QR_NOT_FOUND: {
    defaultHttpStatus: 404,
    isRetryable: false,
    messageKey: "errors.customer.qrNotFound",
    requirement: "FR-01",
    severity: "error",
    surface: "customer",
  },
  QR_ROTATED: {
    defaultHttpStatus: 410,
    isRetryable: false,
    messageKey: "errors.customer.qrRotated",
    requirement: "FR-01",
    severity: "warning",
    surface: "customer",
  },
  RATE_LIMITED: {
    defaultHttpStatus: 429,
    isRetryable: true,
    messageKey: "errors.shared.rateLimited",
    requirement: "GLOBAL",
    severity: "warning",
    surface: "shared",
  },
  RATING_INVALID: {
    defaultHttpStatus: 422,
    isRetryable: false,
    messageKey: "errors.customer.ratingInvalid",
    requirement: "FR-12",
    severity: "warning",
    surface: "customer",
  },
  REASSIGN_FAILED: {
    defaultHttpStatus: 409,
    isRetryable: true,
    messageKey: "errors.admin.reassignFailed",
    requirement: "FR-09",
    severity: "error",
    surface: "admin",
  },
  REFUND_FAILED: {
    defaultHttpStatus: 502,
    isRetryable: true,
    messageKey: "errors.admin.refundFailed",
    requirement: "FR-10",
    severity: "error",
    surface: "admin",
  },
  REFUND_REASON_REQUIRED: {
    defaultHttpStatus: 422,
    isRetryable: false,
    messageKey: "errors.admin.refundReasonRequired",
    requirement: "FR-10",
    severity: "warning",
    surface: "admin",
  },
  REPORT_FETCH_FAILED: {
    defaultHttpStatus: 503,
    isRetryable: true,
    messageKey: "errors.admin.reportFetchFailed",
    requirement: "FR-11",
    severity: "error",
    surface: "admin",
  },
  SERVER_ERROR: {
    defaultHttpStatus: 500,
    isRetryable: true,
    messageKey: "errors.shared.serverError",
    requirement: "GLOBAL",
    severity: "critical",
    surface: "shared",
  },
  SERVICE_UNAVAILABLE: {
    defaultHttpStatus: 503,
    isRetryable: true,
    messageKey: "errors.shared.serviceUnavailable",
    requirement: "GLOBAL",
    severity: "error",
    surface: "shared",
  },
  SHIFT_CODE_INVALID: {
    defaultHttpStatus: 401,
    isRetryable: false,
    messageKey: "errors.crew.shiftCodeInvalid",
    requirement: "FR-22",
    severity: "error",
    surface: "crew",
  },
  SLOT_PHOTO_REQUIRED: {
    defaultHttpStatus: 422,
    isRetryable: false,
    messageKey: "errors.customer.slotPhotoRequired",
    requirement: "FR-02",
    severity: "warning",
    surface: "customer",
  },
  SSO_REQUIRED: {
    defaultHttpStatus: 401,
    isRetryable: false,
    messageKey: "errors.admin.ssoRequired",
    requirement: "FR-09",
    severity: "error",
    surface: "admin",
  },
  STALE_JOB_TIMEOUT: {
    defaultHttpStatus: 409,
    isRetryable: false,
    messageKey: "errors.admin.staleJobTimeout",
    requirement: "FR-21",
    severity: "warning",
    surface: "admin",
  },
  STATUS_OVERRIDE_INVALID: {
    defaultHttpStatus: 422,
    isRetryable: false,
    messageKey: "errors.admin.statusOverrideInvalid",
    requirement: "FR-17",
    severity: "warning",
    surface: "admin",
  },
  STATUS_OVERRIDE_REASON_REQUIRED: {
    defaultHttpStatus: 422,
    isRetryable: false,
    messageKey: "errors.admin.statusOverrideReasonRequired",
    requirement: "FR-17",
    severity: "warning",
    surface: "admin",
  },
  STATUS_POLL_FAILED: {
    defaultHttpStatus: 503,
    isRetryable: true,
    messageKey: "errors.customer.statusPollFailed",
    requirement: "FR-04",
    severity: "error",
    surface: "customer",
  },
  UNKNOWN_ERROR: {
    defaultHttpStatus: 500,
    isRetryable: false,
    messageKey: "errors.shared.unknown",
    requirement: "GLOBAL",
    severity: "error",
    surface: "shared",
  },
  UNSUPPORTED_LOCALE: {
    defaultHttpStatus: 422,
    isRetryable: false,
    messageKey: "errors.customer.unsupportedLocale",
    requirement: "FR-13",
    severity: "warning",
    surface: "customer",
  },
  UPLOAD_FAILED: {
    defaultHttpStatus: 503,
    isRetryable: true,
    messageKey: "errors.customer.uploadFailed",
    requirement: "FR-20",
    severity: "error",
    surface: "customer",
  },
  VALIDATION_ERROR: {
    defaultHttpStatus: 422,
    isRetryable: false,
    messageKey: "errors.shared.validation",
    requirement: "GLOBAL",
    severity: "warning",
    surface: "shared",
  },
  WHATSAPP_LINK_INVALID: {
    defaultHttpStatus: 422,
    isRetryable: false,
    messageKey: "errors.customer.whatsappLinkInvalid",
    requirement: "FR-16",
    severity: "warning",
    surface: "customer",
  },
};

export class ApiContractError extends Error {
  code: ApiErrorCode;
  details?: Record<string, unknown>;
  fieldErrors?: ApiFieldError[];
  httpStatus: number;
  isRetryable: boolean;
  messageKey: string;
  severity: ApiErrorSeverity;
  surface: ApiErrorSurface;

  constructor({
    code,
    details,
    fieldErrors,
    httpStatus,
    message,
  }: ApiErrorResponse & { httpStatus?: number }) {
    const safeCode = isApiErrorCode(code) ? code : API_ERROR_CODES.UNKNOWN_ERROR;
    const definition = getApiErrorDefinition(safeCode);
    const safeDetails =
      safeCode === code ? details : { ...details, originalCode: code };

    super(message || definition.messageKey);
    this.name = "ApiContractError";
    this.code = safeCode;
    this.details = safeDetails;
    this.fieldErrors = fieldErrors;
    this.httpStatus = httpStatus ?? definition.defaultHttpStatus;
    this.isRetryable = definition.isRetryable;
    this.messageKey = definition.messageKey;
    this.severity = definition.severity;
    this.surface = definition.surface;
  }
}

export function getApiErrorDefinition(code: ApiErrorCode) {
  return API_ERROR_DEFINITIONS[code] ?? API_ERROR_DEFINITIONS.UNKNOWN_ERROR;
}

export function isApiErrorCode(code: unknown): code is ApiErrorCode {
  return (
    typeof code === "string" &&
    Object.values(API_ERROR_CODES).includes(code as ApiErrorCode)
  );
}

// Maps backend error codes that differ from frontend API_ERROR_CODES names
const BACKEND_CODE_MAP: Record<string, string> = {
  EXTERNAL_SERVICE_ERROR: "PAYMENT_GATEWAY_FAILED",
  EXTERNAL_SERVICE_TIMEOUT: "PAYMENT_GATEWAY_FAILED",
  EXTERNAL_SERVICE_UNAVAILABLE: "PAYMENT_GATEWAY_FAILED",
  SITE_INTAKE_PAUSED: "INTAKE_PAUSED",
  SITE_CUTOFF_REACHED: "BOOKING_CUTOFF_PASSED",
  FILE_TOO_LARGE: "IMAGE_TOO_LARGE",
  MEDIA_UPLOAD_FAILED: "UPLOAD_FAILED",
  PAYMENT_ALREADY_EXISTS: "PAYMENT_INTENT_EXISTS",
  IDEMPOTENCY_KEY_CONFLICT: "IDEMPOTENCY_CONFLICT",
  VALIDATION_FAILED: "VALIDATION_ERROR",
  RATE_LIMIT_EXCEEDED: "RATE_LIMITED",
  UNAUTHORIZED_ACCESS: "AUTH_UNAUTHORIZED",
  FORBIDDEN_ACCESS: "AUTH_FORBIDDEN",
  CREW_REFRESH_TOKEN_INVALID: "CREW_SESSION_EXPIRED",
  QR_ALREADY_ROTATED: "QR_ROTATED",
};

export function normalizeApiError(error: unknown): ApiContractError {
  if (error instanceof ApiContractError) {
    return error;
  }

  if (error instanceof AxiosError) {
    if (isApiErrorResponse(error.response?.data)) {
      return new ApiContractError({
        ...error.response.data,
        httpStatus: error.response.status,
      });
    }

    // Backend wraps error details under an `error` key:
    // { success: false, error: { code, message, ... } } or { success: false, error: "message string" }
    const responseData = error.response?.data;
    if (
      responseData &&
      typeof responseData === "object" &&
      responseData.success === false &&
      responseData.error &&
      typeof responseData.error === "string"
    ) {
      return new ApiContractError({
        code: mapHttpStatusToErrorCode(error.response?.status),
        message: responseData.error,
        success: false,
        httpStatus: error.response?.status,
      });
    }

    if (
      responseData &&
      typeof responseData === "object" &&
      responseData.success === false &&
      responseData.error &&
      typeof responseData.error === "object"
    ) {
      const errBody = responseData.error as Record<string, unknown>;
      const rawCode = typeof errBody.code === "string" ? errBody.code : null;
      return new ApiContractError({
        code: rawCode ? ((BACKEND_CODE_MAP[rawCode] ?? rawCode) as ApiErrorCode) : mapHttpStatusToErrorCode(error.response?.status),
        message: typeof errBody.message === "string" ? errBody.message : error.message,
        success: false,
        httpStatus: error.response?.status,
      });
    }

    return new ApiContractError({
      code: mapHttpStatusToErrorCode(error.response?.status),
      message: error.message,
      success: false,
      httpStatus: error.response?.status,
    });
  }

  if (error instanceof Error) {
    return new ApiContractError({
      code: API_ERROR_CODES.UNKNOWN_ERROR,
      message: error.message,
      success: false,
    });
  }

  return new ApiContractError({
    code: API_ERROR_CODES.UNKNOWN_ERROR,
    message: "errors.shared.unknown",
    success: false,
  });
}

function mapHttpStatusToErrorCode(status?: number): ApiErrorCode {
  if (!status) {
    return API_ERROR_CODES.NETWORK_OFFLINE;
  }

  if (status === 401) {
    return API_ERROR_CODES.AUTH_UNAUTHORIZED;
  }

  if (status === 403) {
    return API_ERROR_CODES.AUTH_FORBIDDEN;
  }

  if (status === 413) {
    return API_ERROR_CODES.IMAGE_TOO_LARGE;
  }

  if (status === 415) {
    return API_ERROR_CODES.INVALID_FILE_TYPE;
  }

  if (status === 422) {
    return API_ERROR_CODES.VALIDATION_ERROR;
  }

  if (status === 429) {
    return API_ERROR_CODES.RATE_LIMITED;
  }

  if (status === 503) {
    return API_ERROR_CODES.SERVICE_UNAVAILABLE;
  }

  if (status >= 500) {
    return API_ERROR_CODES.SERVER_ERROR;
  }

  return API_ERROR_CODES.UNKNOWN_ERROR;
}
