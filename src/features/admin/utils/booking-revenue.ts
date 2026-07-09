/**
 * Gross revenue a single booking contributes to reports. A booking counts its
 * full `price` if the customer actually paid (paidAt is set) — which includes
 * refunded bookings (`refundedAmount > 0`): the payment was received (+price)
 * and the refund is subtracted separately. CANCELLED/EXPIRED bookings that were
 * paid but not refunded still count as revenue (money was kept). Only bookings
 * that were never paid contribute 0.
 */
export function bookingRevenue(booking: {
  status: string;
  price: number;
  paidAt?: string | null;
  refundedAmount?: number;
}): number {
  if ((booking.refundedAmount ?? 0) > 0) return booking.price;
  return booking.paidAt ? booking.price : 0;
}
