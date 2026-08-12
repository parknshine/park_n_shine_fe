"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function PaymentCallbackPage() {
  const { id: bookingId } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    // Same-tab checkout keeps this in sessionStorage. Mobile browsers often
    // return from Snap (e.g. after handing off to the GoPay/bank app) in a
    // different tab or context, losing it — fall back to the short-lived
    // server-side code the backend put in the callback URL for that case.
    async function resolveToken(): Promise<string | null> {
      const stored = sessionStorage.getItem(`booking_payment_token_${bookingId}`);
      if (stored) return stored;

      const code = new URLSearchParams(window.location.search).get("c");
      if (!code) return null;
      try {
        const response = await api.get<{ token: string }>(
          `/v1/bookings/payment-callback-token/${code}`,
        );
        return response.data.token;
      } catch {
        return null;
      }
    }

    async function handleCallback() {
      const bookingToken = await resolveToken();
      if (cancelled) return;
      if (!bookingToken) {
        router.replace(`/booking/${bookingId}/status`);
        return;
      }

      const result = new URLSearchParams(window.location.search).get("result");
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
