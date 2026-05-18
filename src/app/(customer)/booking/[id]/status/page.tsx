"use client";

import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { parseAsString } from "nuqs";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useBookingStatus } from "@/features/customer/hooks/use-booking-status";
import { StatusHero } from "@/features/customer/components/status-hero";
import { PaymentCheckButton } from "@/features/customer/components/payment-check-button";
import { BookingStatusTimeline } from "@/features/customer/components/booking-status-timeline";
import { BOOKING_STATUSES } from "@/features/customer/types";

export default function BookingStatusPage() {
  const { id: bookingId } = useParams<{ id: string }>();
  const [token] = useQueryState("token", parseAsString);

  const { booking, isLoading, error, refresh } = useBookingStatus({
    bookingId,
    signedToken: token ?? "",
    enabled: !!bookingId && !!token,
  });

  if (!token) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm text-muted-foreground">
          Link tidak valid. Silakan scan ulang QR code.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm text-muted-foreground">
          Booking tidak ditemukan.
        </p>
      </div>
    );
  }

  const isTerminal =
    booking.status === BOOKING_STATUSES.CLOSED ||
    booking.status === BOOKING_STATUSES.EXPIRED ||
    booking.status === BOOKING_STATUSES.CANCELLED;

  const isPending = booking.status === BOOKING_STATUSES.PENDING;
  const isReady = booking.status === BOOKING_STATUSES.READY;

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-8">
      <StatusHero
        status={booking.status}
        plate={booking.plateText}
        slot={booking.slotText}
      />

      {isPending && (
        <PaymentCheckButton
          onCheck={refresh}
          delayMs={30_000}
        />
      )}

      {isReady && (
        <div className="rounded-2xl bg-primary/10 p-6 text-center space-y-4">
          <p className="text-lg font-semibold text-primary">
            Mobil kamu sudah bersih!
          </p>
          <p className="text-sm text-muted-foreground">
            Terima kasih telah menggunakan Park &amp; Shine.
          </p>
          <Link
            href={`/booking/${bookingId}/rate?token=${token}`}
            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Beri Rating
          </Link>
        </div>
      )}

      {isTerminal && booking.status === BOOKING_STATUSES.CLOSED && (
        <div className="rounded-2xl bg-muted p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Booking ini telah selesai.
          </p>
        </div>
      )}

      {booking.statusHistory.length > 0 && (
        <details className="rounded-xl border border-border">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-foreground select-none">
            Riwayat Status
          </summary>
          <div className="px-4 pb-4 pt-2">
            <BookingStatusTimeline events={booking.statusHistory} />
          </div>
        </details>
      )}
    </div>
  );
}
