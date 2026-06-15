export type {
  ApiErrorResponse,
  ApiFieldError,
  ApiListResponse,
  ApiMeta,
  ApiPaginatedResponse,
  ApiPaginationMeta,
  ApiResponse,
  ApiResponseCode,
  ApiSuccessResponse,
} from "@/lib/api-response";

export type {
  ApiErrorCode,
  ApiErrorDefinition,
  ApiErrorSeverity,
  ApiErrorSurface,
} from "@/lib/api-error";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role?: "super_admin" | "admin";
  avatarUrl?: string;
}

// Authenticated customer account (Firebase-backed). `phone` starts null for
// email/Google signups until linked via PATCH /v1/me.
export interface Customer {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  photoUrl: string | null;
  washCount: number;
  verified: boolean;
  createdAt?: string;
}

// ─── UI ───────────────────────────────────────────────────────────────────────

export type ButtonVariant = "default" | "outline" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";
