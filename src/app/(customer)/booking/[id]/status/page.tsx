"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Bell, Check, Car, Star, ChevronUp } from "lucide-react";
import { useBookingStatus } from "@/features/customer/hooks/use-booking-status";
import { useCheckPayment } from "@/features/customer/hooks/use-check-payment";
import { usePaymentAutoPoll } from "@/features/customer/hooks/use-payment-auto-poll";
import { useCancelBooking } from "@/features/customer/hooks/use-cancel-booking";
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
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
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

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [paymentDetailOpen, setPaymentDetailOpen] = useState(true);
  const { cancel, isPending: isCancelling } = useCancelBooking({
    bookingId,
    signedToken: token ?? "",
    onSuccess: () => {
      setShowCancelConfirm(false);
      void refresh();
    },
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
  const isPaid = booking.status === BOOKING_STATUSES.PAID;
  const isReady = booking.status === BOOKING_STATUSES.READY;
  const isCancelled = booking.status === BOOKING_STATUSES.CANCELLED;
  const isRefunded = isCancelled && (booking.refundedAmount ?? 0) > 0;
  const isNeedsHelp = booking.status === BOOKING_STATUSES.NEEDS_HELP;
  const isInProgress = booking.status === BOOKING_STATUSES.IN_PROGRESS;

  const plateMedia = booking.media.find((m) => m.kind === "plate");
  const slotMedia = booking.media.find((m) => m.kind === "slot");

  const paidAt =
    booking.statusHistory.find((e) => e.status === "PAID")?.changedAt ?? null;

  const PAYMENT_METHOD_LABELS: Record<string, string> = {
    gopay: "GoPay",
    qris: "QRIS",
    shopeepay: "ShopeePay",
    bank_transfer: "Transfer Bank",
    credit_card: "Kartu Kredit / Debit",
    bca_va: "BCA Virtual Account",
    bni_va: "BNI Virtual Account",
    bri_va: "BRI Virtual Account",
    permata_va: "Permata Virtual Account",
    mandiri_bill: "Mandiri Bill",
  };
  const paymentMethodLabel = booking.paymentMethod
    ? (PAYMENT_METHOD_LABELS[booking.paymentMethod.toLowerCase()] ??
      booking.paymentMethod)
    : null;

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatPaidAt = (iso: string) => {
    const d = new Date(iso);
    const time = d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const date = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    return `${time}, ${date}`;
  };

  const cancellationReason =
    booking.statusHistory.find((e) => e.status === "CANCELLED")?.reason ?? null;
  const startedAt =
    booking.startedAt ?? (isInProgress ? new Date().toISOString() : null);

  const waUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(t("status.whatsAppMessage", { bookingId }))}`
    : undefined;

  return (
    <div className='mx-auto max-w-md space-y-6 px-4 py-8'>
      {booking.status === BOOKING_STATUSES.CLOSED ? (
        <div className='space-y-3 text-center'>
          <div className='relative mx-auto flex h-36 w-full items-center justify-center'>
            <span className='confetti-fall confetti-fall-1 absolute left-10 top-3 h-4 w-4 rotate-45 rounded-sm bg-yellow-400' />
            <span className='confetti-fall confetti-fall-2 absolute right-14 top-5 h-3 w-3 rounded-full bg-emerald-400' />
            <span className='confetti-fall confetti-fall-3 absolute left-14 bottom-2 h-2.5 w-2.5 rotate-45 bg-sky-400' />
            <span className='confetti-fall confetti-fall-4 absolute right-10 bottom-4 h-3 w-3 rotate-12 rounded-sm bg-yellow-300' />
            <span className='confetti-fall confetti-fall-5 absolute left-4 top-12 h-5 w-3.5 overflow-hidden rounded-r-full bg-emerald-500' />
            <span className='confetti-fall confetti-fall-6 absolute right-4 bottom-8 h-5 w-3.5 overflow-hidden rounded-l-full bg-emerald-500' />
            <span className='confetti-fall confetti-fall-7 absolute right-20 top-3 h-2 w-2 rotate-45 bg-sky-500' />
            <div className='flex h-24 w-24 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/25'>
              <Check className='h-11 w-11 text-white' strokeWidth={2.5} />
            </div>
          </div>
          <div className='space-y-1'>
            <h2 className='text-xl font-bold tracking-tight text-foreground'>
              {t("status.closedHeadingPrefix")}{" "}
              <span className='text-primary'>
                {t("status.closedHeadingSuffix")}
              </span>
            </h2>
            <p className='text-sm text-muted-foreground'>
              {t("status.thankYou")}
            </p>
          </div>
        </div>
      ) : (
        <StatusHero status={booking.status} isRefunded={isRefunded} />
      )}

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

      {(isPending || isPaid) && !showCancelConfirm && (
        <button
          onClick={() => setShowCancelConfirm(true)}
          className='w-full rounded-xl border border-destructive bg-white py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5 dark:bg-card'
        >
          {t("status.cancelBooking", { defaultValue: "Cancel Booking" })}
        </button>
      )}

      {showCancelConfirm && (
        <div className='rounded-2xl border border-destructive/30 bg-destructive/5 p-5 space-y-3 text-center'>
          <p className='text-sm font-medium text-foreground'>
            {t("status.cancelConfirmTitle", {
              defaultValue: "Cancel this booking?",
            })}
          </p>
          <p className='text-xs text-muted-foreground'>
            {isPaid
              ? t("status.cancelConfirmPaid", {
                  defaultValue: "Your payment will be refunded.",
                })
              : t("status.cancelConfirmPending", {
                  defaultValue: "Your booking will be cancelled.",
                })}
          </p>
          <div className='flex gap-2 justify-center'>
            <button
              onClick={() => setShowCancelConfirm(false)}
              disabled={isCancelling}
              className='rounded-full border border-border px-5 py-2 text-sm text-foreground transition-colors hover:bg-muted'
            >
              {t("status.cancelBack", { defaultValue: "Go back" })}
            </button>
            <button
              onClick={() => void cancel()}
              disabled={isCancelling}
              className='rounded-full bg-destructive px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50'
            >
              {isCancelling
                ? t("status.cancellingLabel", { defaultValue: "Cancelling…" })
                : t("status.cancelConfirm", { defaultValue: "Yes, cancel" })}
            </button>
          </div>
        </div>
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
        <div className='rounded-2xl border border-[#D4E0E7] bg-white p-6 text-center space-y-4 dark:border-border dark:bg-card'>
          <p className='text-lg font-semibold text-primary'>
            {t("status.carReady")}
          </p>
          <p className='text-sm text-muted-foreground'>
            {t("status.thankYou")}
          </p>
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

      {!isPending && !isCancelled && booking.paymentMethod && (
        <div className='overflow-hidden rounded-2xl border border-sky-200 bg-card shadow-sm dark:border-sky-800'>
          <button
            onClick={() => setPaymentDetailOpen((o) => !o)}
            className='flex w-full items-center justify-between px-5 py-4'
          >
            <div className='flex items-center gap-3'>
              <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10'>
                <Check className='h-5 w-5 text-primary' strokeWidth={2.5} />
              </div>
              <span className='font-bold text-primary'>
                {t("status.paymentSuccess")}
              </span>
            </div>
            <ChevronUp
              className='h-5 w-5 text-muted-foreground transition-transform duration-200'
              style={{
                transform: paymentDetailOpen ? undefined : "rotate(180deg)",
              }}
            />
          </button>

          {paymentDetailOpen && (
            <div className='border-t border-sky-100 px-5 pb-5 pt-4 dark:border-sky-900'>
              <p className='mb-3 font-bold text-foreground'>
                {t("status.paymentDetail")} :
              </p>
              <div className='space-y-3 text-sm'>
                {paidAt && (
                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground'>
                      {t("status.orderTime")} :
                    </span>
                    <span className='font-medium text-foreground'>
                      {formatPaidAt(paidAt)}
                    </span>
                  </div>
                )}
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>
                    {t("status.paymentMethodLabel")} :
                  </span>
                  <span className='font-medium text-foreground'>
                    {paymentMethodLabel}
                  </span>
                </div>
                {booking.priceAmount != null && (
                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground'>
                      {t("status.amountLabel")} :
                    </span>
                    <span className='font-semibold text-foreground'>
                      {formatRupiah(booking.priceAmount)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {(booking.plateText ?? booking.slotText) && (
        <div className='overflow-hidden rounded-2xl border border-border bg-card'>
          {/* Header */}
          <div className='flex items-center gap-4 px-5 py-4'>
            <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10'>
              <Car className='h-7 w-7 text-primary' />
            </div>
            <div>
              <p className='font-bold text-foreground'>
                {t("status.vehicleInfoTitle")}
              </p>
              <p className='text-sm text-muted-foreground'>
                {t("status.vehicleInfoSubtitle")}
              </p>
            </div>
          </div>

          {/* Plate row */}
          <div className='border-t border-border' />
          <div className='flex p-5'>
            <div className='flex flex-1 flex-col gap-3 pr-4'>
              <div>
                <p className='font-bold text-foreground'>
                  {t("status.plateLabel")}
                </p>
                {plateMedia?.ocrText && (
                  <p className='text-sm text-muted-foreground'>
                    {plateMedia.ocrText}
                  </p>
                )}
              </div>
              {booking.plateText && (
                <div className='inline-flex items-center gap-3 self-start rounded-lg border-2 border-foreground px-3 py-2'>
                  <span className='h-2 w-2 shrink-0 rounded-full border border-foreground/40' />
                  <span className='font-mono text-lg font-black uppercase tracking-widest text-foreground'>
                    {booking.plateText}
                  </span>
                  <span className='h-2 w-2 shrink-0 rounded-full border border-foreground/40' />
                </div>
              )}
            </div>
            {plateMedia && (
              <>
                <div className='w-px shrink-0 self-stretch bg-border' />
                <div className='ml-4 w-32 shrink-0'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={plateMedia.url}
                    alt={t("status.plateLabel")}
                    className='h-36 w-full rounded-xl object-cover'
                  />
                </div>
              </>
            )}
          </div>

          {/* Slot row */}
          <div className='border-t border-border' />
          <div className='flex p-5'>
            <div className='flex flex-1 flex-col gap-3 pr-4'>
              <div>
                <p className='font-bold text-foreground'>
                  {t("status.slotLabel")}
                </p>
                <p className='text-sm text-muted-foreground'>
                  {t("status.vehiclePosition")}
                </p>
              </div>
              {booking.slotText && (
                <p className='text-4xl font-black text-foreground'>
                  {booking.slotText}
                </p>
              )}
            </div>
            {slotMedia && (
              <>
                <div className='w-px shrink-0 self-stretch bg-border' />
                <div className='ml-4 w-32 shrink-0'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slotMedia.url}
                    alt={t("status.slotLabel")}
                    className='h-36 w-full rounded-xl object-cover'
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {booking.status === BOOKING_STATUSES.CLOSED && (
        <div className='rounded-2xl border border-border bg-card p-5'>
          <div className='flex items-start gap-4'>
            <div className='flex h-17 w-17 shrink-0 items-center justify-center rounded-[20px] bg-primary/10'>
              <Car className='h-7 w-7 text-primary' />
            </div>
            <div className='flex min-w-0 flex-col gap-3'>
              <div>
                <p className='font-bold text-foreground'>
                  {t("status.allDoneTitle")}
                </p>
                <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>
                  {t("status.allDoneDesc")}
                </p>
              </div>
              {!booking.hasRated && (
                <Link
                  href={`/booking/${bookingId}/rate?token=${token}`}
                  className='inline-flex items-center gap-1.5 self-start rounded-full border-2 border-border px-5 py-2 text-sm font-extrabold text-primary transition-opacity hover:opacity-80'
                >
                  <Star className='h-4 w-4' />
                  {t("status.rateAndReview")}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {isCancelled && (
        <div
          className={`rounded-2xl border p-6 text-center space-y-3 ${isRefunded ? "border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950" : "border-destructive/30 bg-destructive/5"}`}
        >
          <p className='text-sm text-muted-foreground'>
            {isRefunded
              ? t("status.refundedMessage", {
                  defaultValue: "Pesanan kamu telah dibatalkan. Pembayaran kamu telah direfund.",
                })
              : t("status.cancelledMessage")}
          </p>
          {cancellationReason && (
            <p className='text-xs text-muted-foreground'>
              {t("status.cancellationReason")}:{" "}
              <span className='font-medium'>{cancellationReason}</span>
            </p>
          )}
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

      {!isCancelled && booking.status !== BOOKING_STATUSES.EXPIRED && (
        <div className='rounded-2xl border border-border bg-white px-4 py-5 dark:bg-card'>
          <p className='mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
            {t("status.historyTitle", { defaultValue: "Booking Progress" })}
          </p>
          <BookingStatusTimeline
            status={booking.status}
            statusHistory={booking.statusHistory}
          />
        </div>
      )}
    </div>
  );
}
