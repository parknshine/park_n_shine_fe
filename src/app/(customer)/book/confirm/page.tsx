"use client";

import { Suspense, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryStates } from "nuqs";
import { ArrowLeft, Loader2, Zap } from "lucide-react";
import api from "@/lib/axios";
import { AppShell } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { BookingSummaryCard } from "@/features/customer/components/booking-summary-card";
import { BookingLocationCard } from "@/features/customer/components/booking-location-card";
import { useBookingStatus } from "@/features/customer/hooks";
import {
  usePaymentActionV2,
  type ConfirmBookingPayloadV2,
} from "@/features/customer/hooks/use-payment-action-v2";
import { useTranslation } from "@/i18n";

export default function WalkInConfirmPage() {
  return (
    <Suspense>
      <WalkInConfirmContent />
    </Suspense>
  );
}

function WalkInConfirmContent() {
  const router = useRouter();
  const { t } = useTranslation("customer");

  const [{ bookingId, token, lat, lng, loc, phone, plate, slot }] =
    useQueryStates({
      bookingId: parseAsString,
      token: parseAsString,
      lat: parseAsString,
      lng: parseAsString,
      loc: parseAsString,
      phone: parseAsString,
      plate: parseAsString,
      slot: parseAsString,
    });

  useEffect(() => {
    if (!bookingId || !token || !lat || !lng || !loc || !plate || !slot) {
      router.replace("/book/location");
    }
  }, [bookingId, token, lat, lng, loc, plate, slot, router]);

  const { booking } = useBookingStatus({
    bookingId: bookingId ?? "",
    signedToken: token ?? "",
    pollIntervalMs: Infinity,
    enabled: !!bookingId && !!token,
  });

  // If booking already confirmed (PENDING or beyond), go straight to pay page
  useEffect(() => {
    if (!booking || !bookingId || !token) return;
    if (booking.status !== "DRAFT") {
      router.replace(`/booking/${bookingId}/pay?token=${token}`);
    }
  }, [booking, bookingId, token, router]);

  const [isSimulating, setIsSimulating] = useState(false);

  const { canSubmit, confirmAndRedirect, error, isSubmitting } =
    usePaymentActionV2(bookingId ?? "", token ?? "");

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  if (!bookingId || !token || !lat || !lng || !loc || !plate || !slot) {
    return null;
  }

  async function handleSimulatePay() {
    if (isSimulating) return;
    setIsSimulating(true);
    try {
      await api.post(
        `/v1/dev/bookings/${bookingId}/simulate-payment`,
        { plate: plate!, slot: slot!, ...(phone ? { phone } : {}) },
        { headers: { "X-Booking-Token": token } }
      );
      window.location.assign(`/booking/${bookingId}/status?token=${token}`);
    } catch {
      toast.error("Simulasi pembayaran gagal");
      setIsSimulating(false);
    }
  }

  function handlePay() {
    const payload: ConfirmBookingPayloadV2 = {
      plateText: plate!,
      slotText: slot!,
      ...(phone ? { phone } : {}),
      locationLat: parseFloat(lat!),
      locationLng: parseFloat(lng!),
      locationName: loc!,
    };
    void confirmAndRedirect(payload);
  }

  return (
    <AppShell surface="customer">
      <div className="space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("booking.step", { current: 3, total: 3 })}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">
            {t("booking.confirm.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("booking.confirm.subtitle")}
          </p>
        </div>

        <BookingSummaryCard
          plate={plate}
          slot={slot}
          siteName={booking?.siteName}
          priceAmount={booking?.priceAmount}
          currency={booking?.currency}
          estimatedReadyAt={booking?.estimatedReadyAt}
        />

        <BookingLocationCard locationName={loc ?? ""} phone={phone ?? undefined} />

        <button
          type="button"
          className="flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-2 hover:underline"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("booking.confirm.back")}
        </button>

        <Button
          size="lg"
          className="w-full rounded-full"
          disabled={!canSubmit}
          onClick={handlePay}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("booking.confirm.processing")}
            </>
          ) : (
            t("booking.confirm.pay")
          )}
        </Button>

        {/* ── Dev-only: skip payment gateway ─────────────────────────────── */}
        {process.env.NODE_ENV !== "production" && (
          <button
            type="button"
            disabled={isSimulating}
            onClick={handleSimulatePay}
            className="flex w-full items-center justify-center gap-1.5 rounded-full border border-dashed border-amber-400 bg-amber-50 py-2.5 text-sm font-medium text-amber-700 transition hover:bg-amber-100 disabled:opacity-60 dark:border-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
          >
            {isSimulating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            {isSimulating ? "Memproses..." : "⚡ Simulasi Bayar (Dev Only)"}
          </button>
        )}
      </div>
    </AppShell>
  );
}
