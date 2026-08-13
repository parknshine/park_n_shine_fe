"use client";

import { Suspense, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/i18n";
import { AppShell } from "@/components/shared";
import { BookingSummaryCard } from "@/features/customer/components/booking-summary-card";
import { BookingLocationCard } from "@/features/customer/components/booking-location-card";
import { StepProgressBar } from "@/features/customer/components/step-progress-bar";
import { PayButton } from "@/features/customer/components/pay-button";
import { useBookingStatus } from "@/features/customer/hooks";

const SKIP_PAYMENT_METHOD_SELECTION =
  process.env.NEXT_PUBLIC_SKIP_PAYMENT_METHOD_SELECTION === "true";

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

  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const token = searchParams.get("token");
  const phone = searchParams.get("phone");
  const plate = searchParams.get("plate");
  const slot = searchParams.get("slot");
  const loc = searchParams.get("loc");
  const addr = searchParams.get("addr");
  const siteId = searchParams.get("siteId");

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

  const locationName = loc ?? booking?.siteName ?? "";
  const locationAddress = addr ?? booking?.siteAddress ?? undefined;

  useEffect(() => {
    if (!booking || !bookingId || !token) return;
    if (booking.status === "PENDING") {
      // In Snap mode, usePaymentActionV2 navigates after the charge is created.
      // Redirecting here races that charge and briefly opens payment-method.
      if (SKIP_PAYMENT_METHOD_SELECTION) return;
      router.replace(`/booking/${bookingId}/payment-method?token=${token}`);
    } else if (booking.status !== "DRAFT") {
      router.replace(`/booking/${bookingId}/status?token=${token}`);
    }
  }, [booking, bookingId, token, router]);

  if (!bookingId || !token || !plate || !slot) {
    return null;
  }

  return (
    <AppShell surface='customer' className='pt-0! px-0!'>
      <StepProgressBar
        current={2}
        total={2}
        label={t("booking.step", { current: 2, total: 2 })}
      />

      <div className='space-y-4 px-4 pb-6'>
        <div>
          <h1 className='text-2xl font-bold text-foreground'>
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
            siteName={locationName}
            priceAmount={booking?.priceAmount}
            currency={booking?.currency}
            estimatedReadyAt={booking?.estimatedReadyAt}
          />

          {locationName && (
            <BookingLocationCard
              locationName={locationName}
              locationAddress={locationAddress}
              phone={phone ?? undefined}
            />
          )}
        </div>

        <PayButton
          bookingId={bookingId}
          signedToken={token}
          plateText={plate}
          slotText={slot}
          phone={phone ?? undefined}
          siteId={siteId ?? undefined}
        />
      </div>
    </AppShell>
  );
}
