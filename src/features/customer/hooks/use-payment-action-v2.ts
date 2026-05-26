"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { mutationKeys, queryKeys } from "@/lib/query-keys";
import type { PaymentIntentResponse } from "@/features/customer/types";

/** Type ini sengaja tidak dimasukkan ke types/index.ts agar flow baru berdiri sendiri */
export interface ConfirmBookingPayloadV2 {
  plateText: string;
  slotText: string;
  phone?: string;
  locationLat: number;
  locationLng: number;
  locationName: string;
}

export function usePaymentActionV2(bookingId: string, signedToken: string) {
  // ConfirmBookingPayloadV2 didefinisikan di atas, bukan dari types/index.ts
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    meta: { persist: false },
    mutationFn: async (payload: ConfirmBookingPayloadV2) => {
      const { plateText, slotText, ...rest } = payload;
      const response = await api.post<PaymentIntentResponse>(
        `/v1/bookings/${bookingId}/confirm`,
        { ...rest, plate: plateText, slot: slotText },
        {
          headers: {
            "Idempotency-Key": bookingId,
            "X-Booking-Token": signedToken,
          },
        }
      );
      return response.data;
    },
    mutationKey: mutationKeys.customer.confirmPayment(bookingId),
    onError: () => {
      setHasSubmitted(false);
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.customer.booking(bookingId),
      });
      const redirectUrl =
        data.redirectUrl ?? `/booking/${bookingId}/status?token=${signedToken}`;
      window.location.assign(redirectUrl);
    },
  });

  async function confirmAndRedirect(
    payload: ConfirmBookingPayloadV2
  ): Promise<PaymentIntentResponse | null> {
    if (mutation.isPending || hasSubmitted) return null;
    setHasSubmitted(true);
    return mutation.mutateAsync(payload);
  }

  const error =
    mutation.error instanceof Error
      ? mutation.error.message
      : mutation.error
        ? "payment_confirm_failed"
        : null;

  return {
    canSubmit: !mutation.isPending && !hasSubmitted,
    confirmAndRedirect,
    error,
    hasSubmitted,
    isOfflinePaused: mutation.isPaused,
    isSubmitting: mutation.isPending,
  };
}
