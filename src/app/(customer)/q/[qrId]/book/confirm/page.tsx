"use client";

import { Suspense, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import { parseAsString, useQueryStates } from "nuqs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Zap } from "lucide-react";
import api from "@/lib/axios";
import { useTranslation } from "@/i18n";
import { AppShell } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { BookingSummaryCard } from "@/features/customer/components/booking-summary-card";
import { BookingLocationCard } from "@/features/customer/components/booking-location-card";
import { useBookingStatus } from "@/features/customer/hooks";
import { mutationKeys, queryKeys } from "@/lib/query-keys";
import type { PaymentIntentResponse } from "@/features/customer/types";

interface QrConfirmPayload {
  plateText: string;
  slotText: string;
  phone?: string;
}

export default function BookConfirmPage() {
  return (
    <Suspense>
      <BookConfirmContent />
    </Suspense>
  );
}

function BookConfirmContent() {
  const router = useRouter();
  const { t } = useTranslation("customer");
  const { qrId } = useParams<{ qrId: string }>();
  const queryClient = useQueryClient();

  const [{ bookingId, token, phone, plate, slot }] = useQueryStates({
    bookingId: parseAsString,
    token: parseAsString,
    phone: parseAsString,
    plate: parseAsString,
    slot: parseAsString,
  });

  useEffect(() => {
    if (!bookingId || !token || !plate || !slot) {
      router.replace(`/q/${qrId}/book/capture`);
    }
  }, [bookingId, token, plate, slot, router, qrId]);

  const { booking } = useBookingStatus({
    bookingId: bookingId ?? "",
    signedToken: token ?? "",
    pollIntervalMs: Infinity,
    enabled: !!bookingId && !!token,
  });

  useEffect(() => {
    if (!booking || !bookingId || !token) return;
    if (booking.status === "PENDING") {
      router.replace(`/booking/${bookingId}/payment-method?token=${token}`);
    } else if (booking.status !== "DRAFT") {
      router.replace(`/booking/${bookingId}/status?token=${token}`);
    }
  }, [booking, bookingId, token, router]);

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const mutation = useMutation({
    meta: { persist: false },
    mutationFn: async (payload: QrConfirmPayload) => {
      const { plateText, slotText, ...rest } = payload;
      const response = await api.post<PaymentIntentResponse>(
        `/v1/bookings/${bookingId}/confirm`,
        { ...rest, plate: plateText, slot: slotText },
        {
          headers: {
            "Idempotency-Key": bookingId,
            "X-Booking-Token": token,
          },
        },
      );
      return response.data;
    },
    mutationKey: mutationKeys.customer.confirmPayment(bookingId ?? ""),
    onError: (err) => {
      setHasSubmitted(false);
      const msg = err instanceof Error ? err.message : "payment_confirm_failed";
      toast.error(msg);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.customer.booking(bookingId ?? ""),
      });
      window.location.assign(`/booking/${bookingId}/payment-method?token=${token}`);
    },
  });

  if (!bookingId || !token || !plate || !slot) {
    return null;
  }

  function handlePay() {
    if (mutation.isPending || hasSubmitted) return;
    setHasSubmitted(true);
    mutation.mutate({
      plateText: plate!,
      slotText: slot!,
      ...(phone ? { phone } : {}),
    });
  }

  async function handleSimulatePay() {
    if (isSimulating) return;
    setIsSimulating(true);
    try {
      await api.post(
        `/v1/dev/bookings/${bookingId}/simulate-payment`,
        { plate: plate!, slot: slot!, ...(phone ? { phone } : {}) },
        { headers: { "X-Booking-Token": token } },
      );
      window.location.assign(`/booking/${bookingId}/status?token=${token}`);
    } catch {
      toast.error("Simulasi pembayaran gagal");
      setIsSimulating(false);
    }
  }

  const canSubmit = !mutation.isPending && !hasSubmitted;

  return (
    <AppShell surface='customer'>
      <div className='space-y-6'>
        <div>
          <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
            {t("booking.step", { current: 2, total: 2 })}
          </p>
          <h1 className='mt-1 text-2xl font-bold text-foreground'>
            {t("booking.confirm.title")}
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            {t("booking.confirm.subtitle")}
          </p>
        </div>

        <BookingSummaryCard
          plate={plate}
          slot={slot}
          priceAmount={booking?.priceAmount}
          currency={booking?.currency}
          estimatedReadyAt={booking?.estimatedReadyAt}
        />

        {booking?.siteName && (
          <BookingLocationCard
            locationName={booking.siteName}
            locationAddress={booking.siteAddress ?? undefined}
            phone={phone ?? undefined}
          />
        )}

        <Button
          size='lg'
          className='w-full rounded-full'
          disabled={!canSubmit}
          onClick={handlePay}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              {t("booking.confirm.processing")}
            </>
          ) : (
            t("booking.confirm.pay")
          )}
        </Button>

        {/* ── Dev-only: skip payment gateway ─────────────────────────────── */}
        {process.env.NODE_ENV !== "production" && (
          <button
            type='button'
            disabled={isSimulating}
            onClick={handleSimulatePay}
            className='flex w-full items-center justify-center gap-1.5 rounded-full border border-dashed border-amber-400 bg-amber-50 py-2.5 text-sm font-medium text-amber-700 transition hover:bg-amber-100 disabled:opacity-60 dark:border-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
          >
            {isSimulating ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Zap className='h-4 w-4' />
            )}
            {isSimulating ? "Memproses..." : "⚡ Simulasi Bayar (Dev Only)"}
          </button>
        )}
      </div>
    </AppShell>
  );
}
