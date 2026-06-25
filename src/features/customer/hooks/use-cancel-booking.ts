"use client";

import { useState } from "react";
import api from "@/lib/axios";

interface UseCancelBookingOptions {
  bookingId: string;
  signedToken: string;
  onSuccess: () => void;
}

export function useCancelBooking({ bookingId, signedToken, onSuccess }: UseCancelBookingOptions) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setIsPending(true);
    setError(null);
    try {
      await api.post(`/v1/bookings/${bookingId}/cancel`, {}, {
        headers: { "X-Booking-Token": signedToken },
      });
      onSuccess();
    } catch {
      setError("cancel_failed");
    } finally {
      setIsPending(false);
    }
  }

  return { cancel, isPending, error };
}
