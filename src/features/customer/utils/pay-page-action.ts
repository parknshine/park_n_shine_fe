import { BOOKING_STATUSES, type BookingStatus } from "@/features/customer/types";

const PAID_STATUSES = new Set<BookingStatus>([
  BOOKING_STATUSES.PAID,
  BOOKING_STATUSES.ASSIGNED,
  BOOKING_STATUSES.IN_PROGRESS,
  BOOKING_STATUSES.READY,
  BOOKING_STATUSES.CLOSED,
]);

export type PayPageAction =
  | "wait"
  | "redirect_status"
  | "redirect_payment_method"
  | "auto_charge";

interface ResolvePayPageActionParams {
  isSnapMode: boolean;
  status: BookingStatus;
  hasPaymentInstructions: boolean;
}

// SNAP mode never sends the customer back to /payment-method — that page
// unconditionally bounces to /pay, and bouncing back here on missing
// instructions would recreate the redirect loop. Instead /pay auto-charges.
export function resolvePayPageAction({
  isSnapMode,
  status,
  hasPaymentInstructions,
}: ResolvePayPageActionParams): PayPageAction {
  if (PAID_STATUSES.has(status)) return "redirect_status";
  if (hasPaymentInstructions) return "wait";
  if (isSnapMode) return "auto_charge";
  return "redirect_payment_method";
}
