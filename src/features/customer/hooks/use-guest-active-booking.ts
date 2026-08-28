"use client";

import { useEffect } from "react";
import {
  clearGuestBookingPointer,
  getGuestBookingPointer,
  isGuestBookingResumable,
} from "@/lib/guest-booking-pointer";
import { useBookingStatus } from "./use-booking-status";

// Guests (no account) have no /v1/me/bookings history to fall back on, so the
// only way back to a booking they haven't finished (e.g. closed the browser
// mid-payment) is the pointer left by pay/status pages. The pointer is just
// bookingId+token — the server's live status is what actually decides
// whether there's still anything to resume, so a stale/finished pointer
// never resurfaces a closed booking; it just gets cleared here.
export function useGuestActiveBooking(enabled: boolean) {
  const pointer = enabled ? getGuestBookingPointer() : null;

  const { booking, isLoading } = useBookingStatus({
    bookingId: pointer?.bookingId ?? "",
    signedToken: pointer?.token ?? "",
    enabled: !!pointer,
    pollIntervalMs: 0,
  });

  const resumable = !!booking && isGuestBookingResumable(booking.status);

  useEffect(() => {
    if (pointer && booking && !resumable) {
      clearGuestBookingPointer();
    }
  }, [pointer, booking, resumable]);

  if (!pointer || isLoading || !resumable || !booking) return null;

  return {
    bookingId: pointer.bookingId,
    token: pointer.token,
    booking,
  };
}
