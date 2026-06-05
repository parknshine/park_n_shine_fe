"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { API_ERROR_CODES } from "@/lib/api-error";
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
    retry: 0,
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
    onError: (err: unknown) => {
      const code = (err as { code?: string }).code;
      if (code === API_ERROR_CODES.BOOKING_ALREADY_CONFIRMED) {
        // Booking already PENDING — go straight to payment method selection
        window.location.assign(`/booking/${bookingId}/payment-method?token=${signedToken}`);
        return;
      }
      setHasSubmitted(false);
    },
    onSuccess: (_data) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.customer.booking(bookingId),
      });
      window.location.assign(`/booking/${bookingId}/payment-method?token=${signedToken}`);
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
