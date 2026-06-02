"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { API_ERROR_CODES } from "@/lib/api-error";
import { mutationKeys } from "@/lib/query-keys";
import type { PaymentIntentResponse } from "@/features/customer/types";

export function useResumePayment(bookingId: string, signedToken: string) {
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const mutation = useMutation({
    meta: { persist: false },
    mutationFn: async () => {
      const response = await api.post<PaymentIntentResponse>(
        `/v1/bookings/${bookingId}/resume-payment`,
        {},
        { headers: { "X-Booking-Token": signedToken } }
      );
      return response.data;
    },
    mutationKey: mutationKeys.customer.resumePayment(bookingId),
    onError: (err: unknown) => {
      const code = (err as { code?: string }).code;
      // Gateway error after retry — let user try again after short delay
      if (code === API_ERROR_CODES.PAYMENT_INTENT_EXISTS) {
        setTimeout(() => setHasSubmitted(false), 3000);
        return;
      }
      setHasSubmitted(false);
    },
    onSuccess: (data) => {
      const redirectUrl = data.redirectUrl ?? `/booking/${bookingId}/status?token=${signedToken}`;
      window.location.assign(redirectUrl);
    },
  });

  async function resume() {
    if (mutation.isPending || hasSubmitted) return;
    setHasSubmitted(true);
    return mutation.mutateAsync();
  }

  return {
    canResume: !mutation.isPending && !hasSubmitted,
    error: mutation.error instanceof Error ? mutation.error.message : null,
    isSubmitting: mutation.isPending,
    resume,
  };
}
