"use client";

import { useParams } from "next/navigation";
import { useQueryState, parseAsString } from "nuqs";
import Link from "next/link";
import { Loader2, Bell } from "lucide-react";
import { useBookingStatus } from "@/features/customer/hooks/use-booking-status";
import { useCheckPayment } from "@/features/customer/hooks/use-check-payment";
import { usePaymentAutoPoll } from "@/features/customer/hooks/use-payment-auto-poll";
import { useRealtimeEvents } from "@/lib/use-realtime-events";
import { usePushNotification } from "@/lib/use-push-notification";
import { StatusHero } from "@/features/customer/components/status-hero";
import { PaymentCheckButton } from "@/features/customer/components/payment-check-button";
import { BookingStatusTimeline } from "@/features/customer/components/booking-status-timeline";
import { BOOKING_STATUSES } from "@/features/customer/types";
import { useTranslation } from "@/i18n";
import { usePublicSettings } from "@/features/customer/hooks/use-public-settings";
import { CleaningProgressBar } from "@/features/customer/components/cleaning-progress-bar";

export default function BookingStatusPage() {
  const { id: bookingId } = useParams<{ id: string }>();
  const [token] = useQueryState("token", parseAsString);
  const { t } = useTranslation("customer");
  const { whatsappNumber, avgCleaningMinutes } = usePublicSettings();

  const { booking, isLoading, error, refresh } = useBookingStatus({
    bookingId,
    signedToken: token ?? "",
    enabled: !!bookingId && !!token,
  });

  const { checkPayment, isChecking } = useCheckPayment({
    bookingId,
    signedToken: token ?? "",
    onPaid: () => void refresh(),
  });

  // Dev mode: auto-poll Midtrans as fallback when webhook/SSE not available.
  // Prod: no-op — webhook → SSE handles updates via useRealtimeEvents above.
  usePaymentAutoPoll({
    enabled: !!booking && booking.status === BOOKING_STATUSES.PENDING,
    onPoll: checkPayment,
    onPaid: () => void refresh(),
  });

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  const sseUrl =
    bookingId && token
      ? `${baseUrl}/v1/realtime/stream?channel=booking:${bookingId}&token=${token}`
      : "";

  useRealtimeEvents({
    url: sseUrl,
    enabled: !!bookingId && !!token,
    onEvent: (event) => {
      if (
        event.type === "payment_confirmed" ||
        event.type === "payment_failed" ||
        event.type === "booking_status_changed"
      ) {
        void refresh();
      }
    },
  });

  const { permission, subscribe: subscribePush } = usePushNotification({
    type: "booking",
    bookingId,
    bookingToken: token ?? undefined,
  });

  if (!token) {
    return (
      <div className='flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center'>
        <p className='text-sm text-muted-foreground'>
          {t("status.invalidLink")}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='flex min-h-[60vh] items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className='flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center'>
        <p className='text-sm text-muted-foreground'>{t("status.notFound")}</p>
      </div>
    );
  }

  const isTerminal =
    booking.status === BOOKING_STATUSES.CLOSED ||
    booking.status === BOOKING_STATUSES.EXPIRED ||
    booking.status === BOOKING_STATUSES.CANCELLED;

  const isPending = booking.status === BOOKING_STATUSES.PENDING;
  const isReady = booking.status === BOOKING_STATUSES.READY;
  const isCancelled = booking.status === BOOKING_STATUSES.CANCELLED;
  const isNeedsHelp = booking.status === BOOKING_STATUSES.NEEDS_HELP;
  const isInProgress = booking.status === BOOKING_STATUSES.IN_PROGRESS;

  const cancellationReason = booking.statusHistory.find(
    (e) => e.status === "CANCELLED"
  )?.reason ?? null;
  const startedAt = booking.startedAt ?? (isInProgress ? new Date().toISOString() : null);

  const waUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(t("status.whatsAppMessage", { bookingId }))}`
    : undefined;

  return (
    <div className='mx-auto max-w-md space-y-6 px-4 py-8'>
      <StatusHero
        status={booking.status}
        plate={booking.plateText}
        slot={booking.slotText}
      />

      {!isTerminal &&
        permission === "default" &&
        process.env.NEXT_PUBLIC_PUSH_ENABLED === "true" && (
          <button
            onClick={() => void subscribePush()}
            className='flex w-full items-center gap-3 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground transition-colors hover:bg-muted'
          >
            <Bell className='h-4 w-4 shrink-0 text-primary' />
            <span>
              {t("status.enableNotifications", {
                defaultValue: "Enable notifications when your car is ready",
              })}
            </span>
          </button>
        )}

      {isPending && (
        <div className='space-y-3'>
          <PaymentCheckButton
            onCheck={checkPayment}
            isChecking={isChecking}
            delayMs={30_000}
          />
        </div>
      )}

      {isReady && (
        <div className='rounded-2xl bg-primary/10 p-6 text-center space-y-4'>
          <p className='text-lg font-semibold text-primary'>
            {t("status.carReady")}
          </p>
          <p className='text-sm text-muted-foreground'>
            {t("status.thankYou")}
          </p>
          <Link
            href={`/booking/${bookingId}/rate?token=${token}`}
            className='inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground! transition-opacity hover:opacity-90'
          >
            {t("status.rateButton")}
          </Link>
        </div>
      )}

      {isNeedsHelp && (
        <div className='rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center space-y-4'>
          <p className='text-sm text-muted-foreground'>
            {t("status.needsHelp")}
          </p>
          <a
            href={waUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3 text-sm font-semibold text-white transition-opacity hover:bg-emerald-600'
          >
            {t("status.contactWhatsApp")}
          </a>
        </div>
      )}

      {isTerminal && booking.status === BOOKING_STATUSES.CLOSED && (
        <div className='rounded-2xl bg-muted p-6 text-center'>
          <p className='text-sm text-muted-foreground'>{t("status.closed")}</p>
        </div>
      )}

      {isCancelled && (
        <div className='rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center space-y-3'>
          <p className='text-sm text-muted-foreground'>
            {t("status.cancelledMessage")}
          </p>
          {cancellationReason && (
            <p className='text-xs text-muted-foreground'>
              {t("status.cancellationReason")}: <span className='font-medium'>{cancellationReason}</span>
            </p>
          )}
          <Link
            href={`/booking/${bookingId}/rate?token=${token}`}
            className='inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground! transition-opacity hover:opacity-90'
          >
            {t("status.leaveFeedback")}
          </Link>
        </div>
      )}

      {isInProgress && startedAt && (
        <CleaningProgressBar
          startedAt={startedAt}
          avgMinutes={avgCleaningMinutes}
          completedSteps={booking.completedSteps}
          estimatedReadyAt={booking.estimatedReadyAt}
        />
      )}

      <div className='rounded-2xl border border-border px-4 py-5'>
        <p className='mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
          {t("status.historyTitle", { defaultValue: "Booking Progress" })}
        </p>
        <BookingStatusTimeline
          status={booking.status}
          statusHistory={booking.statusHistory}
        />
      </div>
    </div>
  );
}
