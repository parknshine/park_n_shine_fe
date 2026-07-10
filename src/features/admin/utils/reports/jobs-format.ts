import { formatDate as formatDateShared } from "./format";

export { formatRupiah, toISODate, formatTurnaround } from "./format";

export const BEFORE_TYPES = new Set([
  "BEFORE_FRONT",
  "BEFORE_BACK",
  "BEFORE_LEFT",
  "BEFORE_RIGHT",
]);
export const AFTER_TYPES = new Set([
  "AFTER_PHOTO",
  "AFTER_FRONT",
  "AFTER_BACK",
  "AFTER_LEFT",
  "AFTER_RIGHT",
]);

export const ZOOM_STEP = 0.5;
export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 4;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const STATUS_STYLES: Record<string, string> = {
  CLOSED:
    "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400",
  REFUNDED: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400",
  EXPIRED:
    "bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
  STALE:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-500",
  NEEDS_HELP: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  IN_PROGRESS:
    "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  LOCATED:
    "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  ASSIGNED:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400",
  PAID: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
};

export const PAYMENT_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-muted text-muted-foreground",
  PAID: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  PARTIAL_REFUND:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  REFUNDED: "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400",
  FAILED: "bg-red-200 text-red-800 dark:bg-red-950/60 dark:text-red-300",
};

export function formatDate(iso: string): string {
  return formatDateShared(iso, { withTime: true });
}
