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
  avatarUrl?: string;
}

// ─── UI ───────────────────────────────────────────────────────────────────────

export type ButtonVariant = "default" | "outline" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";
