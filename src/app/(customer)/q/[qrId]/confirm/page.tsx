"use client";

import { Suspense, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/shared";
import { BookingSummaryCard } from "@/features/customer/components/booking-summary-card";
import { BookingLocationCard } from "@/features/customer/components/booking-location-card";
import { StepProgressBar } from "@/features/customer/components/step-progress-bar";
import { PayButton } from "@/features/customer/components/pay-button";
import { useBookingStatus } from "@/features/customer/hooks";
import { useTranslation } from "@/i18n";

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmContent />
    </Suspense>
  );
}

function ConfirmContent() {
  const router = useRouter();
  const { qrId } = useParams<{ qrId: string }>();
  const { t } = useTranslation("customer");
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const token = searchParams.get("token");
  const plate = searchParams.get("plate");
  const slot = searchParams.get("slot");
  const phone = searchParams.get("phone");

  useEffect(() => {
    if (!bookingId || !token || !plate || !slot) {
      router.replace(`/q/${qrId}/capture`);
    }
  }, [bookingId, token, plate, slot, router, qrId]);

  // Fetch booking once to get price, site name, estimated ready time
  const { booking } = useBookingStatus({
    bookingId: bookingId ?? "",
    signedToken: token ?? "",
    pollIntervalMs: Infinity,
    enabled: !!bookingId && !!token,
  });

  if (!bookingId || !token || !plate || !slot) {
    return null;
  }

  return (
    <AppShell surface="customer" className="pt-0! px-0!">
      <StepProgressBar current={2} total={2} label={t("booking.step", { current: 2, total: 2 })} />

      <div className="space-y-4 px-4 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("booking.confirm.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("booking.confirm.subtitle")}
          </p>
        </div>

        <div className="space-y-3">
          <BookingSummaryCard
            plate={plate}
            slot={slot}
            siteName={booking?.siteName}
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
        </div>

        <PayButton
          bookingId={bookingId}
          signedToken={token}
          plateText={plate}
          slotText={slot}
          phone={phone ?? undefined}
        />
      </div>
    </AppShell>
  );
}
