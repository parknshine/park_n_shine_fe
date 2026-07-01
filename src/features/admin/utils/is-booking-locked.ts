/**
 * A booking is "locked" — no further admin actions (refund/override) allowed —
 * once it is cancelled or any refund has been applied. `refundedAmount > 0` is
 * the single source of truth for the refunded state.
 */
export function isBookingLocked(booking: {
  status: string;
  refundedAmount?: number;
}): boolean {
  return booking.status === "CANCELLED" || (booking.refundedAmount ?? 0) > 0;
}
