/**
 * Gross revenue a single booking contributes to reports. A booking counts its
 * full `price` if the customer actually paid — which includes refunded bookings
 * (`refundedAmount > 0`): the payment was received (+price) and the refund is
 * subtracted separately, so Net = revenue − refunded nets out correctly. Only
 * bookings that were never paid (CANCELLED/EXPIRED with no refund) contribute 0.
 */
export function bookingRevenue(booking: {
  status: string;
  price: number;
  refundedAmount?: number;
}): number {
  if ((booking.refundedAmount ?? 0) > 0) return booking.price;
  if (booking.status === "CANCELLED" || booking.status === "EXPIRED") return 0;
  return booking.price;
}
