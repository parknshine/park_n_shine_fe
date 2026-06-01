"use client";

import { useState } from "react";
import api from "@/lib/axios";

interface UseCheckPaymentOptions {
  bookingId: string;
  signedToken: string;
  onPaid?: () => void;
}

export function useCheckPayment({
  bookingId,
  signedToken,
  onPaid,
}: UseCheckPaymentOptions) {
  const [isChecking, setIsChecking] = useState(false);

  async function checkPayment(): Promise<"PAID" | "PENDING" | null> {
    if (isChecking) return null;
    setIsChecking(true);
    try {
      const response = await api.post<{ bookingId: string; status: string }>(
        `/v1/bookings/${bookingId}/check-payment`,
        {},
        { headers: { "X-Booking-Token": signedToken } }
      );
      const status = response.data.status;
      if (status === "PAID") onPaid?.();
      return status === "PAID" ? "PAID" : "PENDING";
    } catch {
      return null;
    } finally {
      setIsChecking(false);
    }
  }

  return { checkPayment, isChecking };
}
