"use client";

export const dynamic = "force-dynamic";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Midtrans redirects here after 3DS authentication.
// The signed token was stored in sessionStorage before redirecting to the 3DS page.
// This page retrieves it and forwards the user to the booking status page.

export default function CardCallbackPage() {
  return (
    <Suspense>
      <CardCallbackContent />
    </Suspense>
  );
}

function CardCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const bookingId = searchParams.get("bookingId");
    if (!bookingId) {
      router.replace("/");
      return;
    }

    const token = sessionStorage.getItem(`card_payment_token_${bookingId}`);
    if (token) {
      sessionStorage.removeItem(`card_payment_token_${bookingId}`);
      router.replace(`/booking/${bookingId}/status?token=${token}`);
    } else {
      // Token not found — send to home
      router.replace("/");
    }
  }, [router, searchParams]);

  return (
    <div className='flex min-h-screen items-center justify-center bg-background'>
      <div className='flex flex-col items-center gap-3'>
        <div className='h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary' />
        <p className='text-sm text-muted-foreground'>Memproses pembayaran...</p>
      </div>
    </div>
  );
}
