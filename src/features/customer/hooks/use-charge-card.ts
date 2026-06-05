"use client";

import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { isAxiosError } from "axios";

interface ChargeCardResult {
  paid: boolean;
  redirectUrl?: string;
}

export function useChargeCard(bookingId: string, signedToken: string) {
  const mutation = useMutation({
    mutationFn: async ({ tokenId, callbackUrl }: { tokenId: string; callbackUrl?: string }) => {
      const response = await api.post<ChargeCardResult>(
        `/v1/bookings/${bookingId}/charge-card`,
        { tokenId, ...(callbackUrl ? { callbackUrl } : {}) },
        { headers: { "X-Booking-Token": signedToken } },
      );
      return response.data;
    },
  });

  return {
    chargeCard: mutation.mutate,
    isCharging: mutation.isPending,
    error: isAxiosError(mutation.error)
      ? (mutation.error.response?.data?.error ?? mutation.error.message)
      : mutation.error instanceof Error
        ? mutation.error.message
        : null,
  };
}
