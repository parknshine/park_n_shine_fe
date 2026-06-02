"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { API_ERROR_CODES } from "@/lib/api-error";
import { mutationKeys, queryKeys } from "@/lib/query-keys";
import type {
  ConfirmBookingPayload,
  PaymentIntentResponse,
} from "@/features/customer/types";

export function usePaymentAction(bookingId: string, signedToken: string) {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    meta: { persist: false },
    mutationFn: async (payload: ConfirmBookingPayload) => {
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
      // Booking already PENDING from a previous attempt — redirect to pay page to resume
      if (code === API_ERROR_CODES.BOOKING_ALREADY_CONFIRMED) {
        window.location.assign(`/booking/${bookingId}/pay?token=${signedToken}`);
        return;
      }
      // Gateway failed: backend rolls booking back to DRAFT, allow retry on this page
      setHasSubmitted(false);
    },
    onSuccess: (paymentIntent) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.customer.booking(bookingId),
      });
      const redirectUrl =
        paymentIntent.redirectUrl ??
        `/booking/${bookingId}/status?token=${signedToken}`;
      window.location.assign(redirectUrl);
    },
  });

  async function confirmAndRedirect(payload: ConfirmBookingPayload) {
    if (mutation.isPending || hasSubmitted) {
      return null;
    }

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
