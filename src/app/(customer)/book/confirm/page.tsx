"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryStates } from "nuqs";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AppShell } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { BookingSummaryCard } from "@/features/customer/components/booking-summary-card";
import { BookingLocationCard } from "@/features/customer/components/booking-location-card";
import { useBookingStatus } from "@/features/customer/hooks";
import {
  usePaymentActionV2,
  type ConfirmBookingPayloadV2,
} from "@/features/customer/hooks/use-payment-action-v2";

export default function WalkInConfirmPage() {
  const router = useRouter();

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
    if (!bookingId || !token || !lat || !lng || !loc || !phone || !plate || !slot) {
      router.replace("/book/location");
    }
  }, [bookingId, token, lat, lng, loc, phone, plate, slot, router]);

  const { booking } = useBookingStatus({
    bookingId: bookingId ?? "",
    signedToken: token ?? "",
    pollIntervalMs: Infinity,
    enabled: !!bookingId && !!token,
  });

  const { canSubmit, confirmAndRedirect, error, isSubmitting } =
    usePaymentActionV2(bookingId ?? "", token ?? "");

  if (!bookingId || !token || !lat || !lng || !loc || !phone || !plate || !slot) {
    return null;
  }

  function handlePay() {
    const payload: ConfirmBookingPayloadV2 = {
      plateText: plate!,
      slotText: slot!,
      phone: phone!,
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
            Langkah 3 dari 3
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">
            Konfirmasi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Periksa detail booking sebelum membayar.
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

        <BookingLocationCard locationName={loc} phone={phone} />

        <button
          type="button"
          className="flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-2 hover:underline"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Ubah foto
        </button>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          size="lg"
          className="w-full rounded-full"
          disabled={!canSubmit}
          onClick={handlePay}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memproses...
            </>
          ) : (
            "Bayar Sekarang"
          )}
        </Button>
      </div>
    </AppShell>
  );
}
