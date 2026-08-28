import { BOOKING_STATUSES } from "@/features/customer/types";

// A PENDING booking hasn't paid yet, so "resume" means going back to the
// payment page; every other non-terminal status already has a payment and
// "resume" means going back to the live status page. Shared by the guest
// resume card, the logged-in active-booking card, and history rows so all
// three route the same way.
export function resolveBookingResumeHref(
  bookingId: string,
  token: string,
  status: string,
): string {
  if (status === BOOKING_STATUSES.PENDING) {
    return `/booking/${bookingId}/pay?token=${token}`;
  }
  return `/booking/${bookingId}/status?token=${token}`;
}

export function resolveBookingResumeCtaLabelKey(status: string): string {
  if (status === BOOKING_STATUSES.PENDING) {
    return "home.resumePaymentCta";
  }
  return "home.activeBookingCta";
}
