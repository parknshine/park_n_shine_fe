import type { ApiErrorCode } from "@/lib/api-error";

export const API_RESPONSE_CODES = {
  ACCEPTED: "ACCEPTED",
  ADMIN_QUEUE_FETCHED: "ADMIN_QUEUE_FETCHED",
  BEFORE_PHOTO_UPLOADED: "BEFORE_PHOTO_UPLOADED",
  BOOKING_CONFIRMED: "BOOKING_CONFIRMED",
  BOOKING_CREATED: "BOOKING_CREATED",
  BOOKING_FETCHED: "BOOKING_FETCHED",
  CHECKLIST_ITEM_COMPLETED: "CHECKLIST_ITEM_COMPLETED",
  CREATED: "CREATED",
  DELETED: "DELETED",
  DAILY_REPORT_FETCHED: "DAILY_REPORT_FETCHED",
  EMPTY: "EMPTY",
  JOB_COMPLETED: "JOB_COMPLETED",
  JOB_REASSIGNED: "JOB_REASSIGNED",
  MEDIA_UPLOADED: "MEDIA_UPLOADED",
  NEXT_JOB_CLAIMED: "NEXT_JOB_CLAIMED",
  OK: "OK",
  PAYMENT_RECONCILED: "PAYMENT_RECONCILED",
  PLATE_VERIFIED: "PLATE_VERIFIED",
  QR_RESOLVED: "QR_RESOLVED",
  RATING_SUBMITTED: "RATING_SUBMITTED",
  REFUND_CREATED: "REFUND_CREATED",
  SESSION_CREATED: "SESSION_CREATED",
  STATUS_OVERRIDDEN: "STATUS_OVERRIDDEN",
  UPDATED: "UPDATED",
} as const;

export type ApiResponseCode =
  (typeof API_RESPONSE_CODES)[keyof typeof API_RESPONSE_CODES];

export interface ApiMeta {
  correlationId?: string;
  requestId?: string;
  timestamp: string;
}

export interface ApiPaginationMeta {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccessResponse<TData> {
  code: ApiResponseCode;
  data: TData;
  message: string;
  meta?: ApiMeta;
  success: true;
}

export interface ApiPaginatedResponse<TData>
  extends ApiSuccessResponse<TData[]> {
  pagination: ApiPaginationMeta;
}

export interface ApiFieldError {
  code?: ApiErrorCode;
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  code: ApiErrorCode;
  details?: Record<string, unknown>;
  fieldErrors?: ApiFieldError[];
  message: string;
  meta?: ApiMeta;
  success: false;
}

export type ApiResponse<TData> =
  | ApiSuccessResponse<TData>
  | ApiErrorResponse;

export type ApiListResponse<TData> =
  | ApiPaginatedResponse<TData>
  | ApiErrorResponse;

export function isApiErrorResponse(
  response: unknown
): response is ApiErrorResponse {
  return (
    isRecord(response) &&
    response.success === false &&
    typeof response.code === "string" &&
    typeof response.message === "string"
  );
}

export function isApiSuccessResponse<TData>(
  response: unknown
): response is ApiSuccessResponse<TData> {
  return (
    isRecord(response) &&
    response.success === true &&
    typeof response.code === "string" &&
    "data" in response
  );
}

export function unwrapApiData<TData>(response: TData | ApiSuccessResponse<TData>) {
  if (isApiSuccessResponse<TData>(response)) {
    return response.data;
  }

  return response;
}

export function createApiSuccessResponse<TData>({
  code = API_RESPONSE_CODES.OK,
  data,
  message = code,
  meta,
}: {
  code?: ApiResponseCode;
  data: TData;
  message?: string;
  meta?: ApiMeta;
}): ApiSuccessResponse<TData> {
  return {
    code,
    data,
    message,
    meta,
    success: true,
  };
}

export function createApiErrorResponse({
  code,
  details,
  fieldErrors,
  message = code,
  meta,
}: Omit<ApiErrorResponse, "success">): ApiErrorResponse {
  return {
    code,
    details,
    fieldErrors,
    message,
    meta,
    success: false,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
