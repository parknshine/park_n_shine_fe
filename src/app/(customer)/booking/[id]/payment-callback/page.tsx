"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function PaymentCallbackPage() {
  const { id: bookingId } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem(`booking_payment_token_${bookingId}`);
    if (!token) {
      router.replace(`/booking/${bookingId}/status`);
      return;
    }
    const bookingToken = token;

    const result = new URLSearchParams(window.location.search).get("result");
    let cancelled = false;

    async function handleCallback() {
      if (result !== "finish") {
        router.replace(`/booking/${bookingId}/pay?token=${encodeURIComponent(bookingToken)}`);
        return;
      }

      // Midtrans only honors callbacks.finish — closing the Snap page without
      // paying also lands here with result=finish (transaction_status=pending),
      // so the actual payment status decides where to go, not the result param.
      try {
        const response = await api.post<{ status: string }>(
          `/v1/bookings/${bookingId}/check-payment`,
          {},
          { headers: { "X-Booking-Token": bookingToken } },
        );
        if (cancelled) return;
        if (response.data.status === "PAID") {
          router.replace(`/booking/${bookingId}/status?token=${encodeURIComponent(bookingToken)}`);
        } else {
          router.replace(`/booking/${bookingId}/pay?token=${encodeURIComponent(bookingToken)}`);
        }
      } catch {
        if (!cancelled) {
          router.replace(`/booking/${bookingId}/status?token=${encodeURIComponent(bookingToken)}`);
        }
      }
    }

    void handleCallback();
    return () => {
      cancelled = true;
    };
  }, [bookingId, router]);

  return <div className="flex min-h-screen items-center justify-center" />;
}
