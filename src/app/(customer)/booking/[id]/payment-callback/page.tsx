"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PaymentCallbackPage() {
  const { id: bookingId } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem(`booking_payment_token_${bookingId}`);
    if (!token) {
      router.replace(`/booking/${bookingId}/status`);
      return;
    }

    // Snap may use the finish callback even when its payment page is closed.
    // Let the pay page check the booking status without blocking navigation.
    // It redirects to status automatically when the payment is confirmed.
    function returnToPayment() {
      router.replace(`/booking/${bookingId}/pay?token=${token}`);
    }

    returnToPayment();
  }, [bookingId, router]);

  return <div className="flex min-h-screen items-center justify-center" />;
}
