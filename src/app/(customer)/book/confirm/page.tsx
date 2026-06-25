"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/shared";
import { BookingSummaryCard } from "@/features/customer/components/booking-summary-card";
import { BookingLocationCard } from "@/features/customer/components/booking-location-card";
import { StepProgressBar } from "@/features/customer/components/step-progress-bar";
import { PayButton } from "@/features/customer/components/pay-button";
import { useBookingStatus } from "@/features/customer/hooks";
import { useTranslation } from "@/i18n";
import { useBookingCaptureStore } from "@/store/booking-capture-store";

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
  const clearCapture = useBookingCaptureStore((s) => s.clear);

  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const token = searchParams.get("token");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const loc = searchParams.get("loc");
  const addr = searchParams.get("addr");
  const siteId = searchParams.get("siteId");
  const phone = searchParams.get("phone");
  const plate = searchParams.get("plate");
  const slot = searchParams.get("slot");

  useEffect(() => {
    if (!bookingId || !token || !plate || !slot) {
      router.replace("/book/capture");
    }
  }, [bookingId, token, plate, slot, router]);

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

  if (!bookingId || !token || !plate || !slot) {
    return null;
  }

  return (
    <AppShell surface='customer' className="pt-0! px-0!">
      <StepProgressBar current={2} total={2} label={t("booking.step", { current: 2, total: 2 })} />

      <div className='space-y-4 px-4 pb-6'>
        <div>
          <h1 className='text-2xl font-bold leading-tight text-foreground'>
            {t("booking.confirm.title")}
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            {t("booking.confirm.subtitle")}
          </p>
        </div>

        <div className='space-y-3'>
          <BookingSummaryCard
            plate={plate}
            slot={slot}
            priceAmount={booking?.priceAmount}
            currency={booking?.currency}
            estimatedReadyAt={booking?.estimatedReadyAt}
          />

          <BookingLocationCard
            locationName={loc ?? ""}
            locationAddress={addr ?? undefined}
            phone={phone ?? undefined}
          />
        </div>

        <PayButton
          bookingId={bookingId}
          signedToken={token}
          plateText={plate}
          slotText={slot}
          phone={phone ?? undefined}
          locationLat={lat ? Number.parseFloat(lat) : undefined}
          locationLng={lng ? Number.parseFloat(lng) : undefined}
          locationName={loc ?? undefined}
          siteId={siteId ?? undefined}
          onBeforePay={clearCapture}
        />
      </div>
    </AppShell>
  );
}
