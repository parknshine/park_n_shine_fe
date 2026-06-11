"use client";

import { useState } from "react";
import api from "@/lib/axios";

interface UseCheckTipOptions {
  bookingId: string;
  token: string;
}

export function useCheckTip({ bookingId, token }: UseCheckTipOptions) {
  const [isChecking, setIsChecking] = useState(false);

  async function checkTip(): Promise<"PAID" | "PENDING" | null> {
    if (isChecking) return null;
    setIsChecking(true);
    try {
      const response = await api.get<{ tipId: string | null; status: string }>(
        `/v1/bookings/${bookingId}/tip`,
        { headers: { "X-Booking-Token": token } },
      );
      const { status } = response.data;
      return status === "PAID" || status === "DISBURSED" ? "PAID" : "PENDING";
    } catch {
      return null;
    } finally {
      setIsChecking(false);
    }
  }

  return { checkTip, isChecking };
}
