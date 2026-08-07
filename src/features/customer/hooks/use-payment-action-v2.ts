"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { API_ERROR_CODES } from "@/lib/api-error";
import { mutationKeys, queryKeys } from "@/lib/query-keys";
import type { PaymentIntentResponse } from "@/features/customer/types";

// TEMPORARY: mirrors backend MIDTRANS_CHARGE_MODE=snap workaround. When set,
// every method on this list routes to the same Snap redirect anyway, so skip
// the payment-method selection screen and charge immediately after confirm.
// Remove alongside the backend flag once Core API channels are activated.
const SKIP_PAYMENT_METHOD_SELECTION = process.env.NEXT_PUBLIC_SKIP_PAYMENT_METHOD_SELECTION === "true";

/** Type ini sengaja tidak dimasukkan ke types/index.ts agar flow baru berdiri sendiri */
export interface ConfirmBookingPayloadV2 {
  plateText: string;
  slotText: string;
  phone?: string;
  locationLat?: number;
  locationLng?: number;
  locationName?: string;
  siteId?: string;
}

export function usePaymentActionV2(bookingId: string, signedToken: string) {
  // ConfirmBookingPayloadV2 didefinisikan di atas, bukan dari types/index.ts
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

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
          withCredentials: true,
        }
      );
      return response.data;
    },
    mutationKey: mutationKeys.customer.confirmPayment(bookingId),
    onError: (err: unknown) => {
      const code = (err as { code?: string }).code;
      if (code === API_ERROR_CODES.BOOKING_ALREADY_CONFIRMED) {
        // Booking already PENDING — avoid payment-method in Snap mode.
        const destination = SKIP_PAYMENT_METHOD_SELECTION
          ? "pay"
          : "payment-method";
        router.replace(`/booking/${bookingId}/${destination}?token=${signedToken}`);
        return;
      }
      setHasSubmitted(false);
    },
    onSuccess: async (_data) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.customer.booking(bookingId),
      });

      if (SKIP_PAYMENT_METHOD_SELECTION) {
        try {
          // Method is irrelevant in Snap mode — the backend routes any valid
          // value straight to Snap, which shows its own channel selector.
          await api.post(
            `/v1/bookings/${bookingId}/charge`,
            { paymentMethod: "QRIS" },
            { headers: { "X-Booking-Token": signedToken } }
          );
          void queryClient.invalidateQueries({
            queryKey: queryKeys.customer.booking(bookingId),
          });
          router.replace(`/booking/${bookingId}/pay?token=${signedToken}`);
          return;
        } catch {
          // Charge failed — fall back to manual method selection so the user can retry.
        }
      }

      // Client-side nav: satu navigasi saja, tanpa full reload yang balapan
      // dengan efek redirect status PENDING di halaman konfirmasi.
      router.replace(`/booking/${bookingId}/payment-method?token=${signedToken}`);
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
