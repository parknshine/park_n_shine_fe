"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryState, parseAsString, parseAsBoolean } from "nuqs";
import { Loader2, AlertCircle, CreditCard } from "lucide-react";
import { useBookingStatus } from "@/features/customer/hooks/use-booking-status";
import { useResumePayment } from "@/features/customer/hooks/use-resume-payment";
import { useCheckPayment } from "@/features/customer/hooks/use-check-payment";
import { usePaymentAutoPoll } from "@/features/customer/hooks/use-payment-auto-poll";
import { PaymentCheckButton } from "@/features/customer/components/payment-check-button";
import { BOOKING_STATUSES } from "@/features/customer/types";
import { useTranslation } from "@/i18n";

export default function BookingPayPage() {
  const { id: bookingId } = useParams<{ id: string }>();
  const [token] = useQueryState("token", parseAsString);
  const [paymentError] = useQueryState("paymentError", parseAsBoolean);
  const router = useRouter();
  const { t } = useTranslation("customer");

  const { booking, isLoading } = useBookingStatus({
    bookingId,
    signedToken: token ?? "",
    enabled: !!bookingId && !!token,
  });

  const { resume, isSubmitting, canResume, error: resumeError } = useResumePayment(
    bookingId,
    token ?? ""
  );

  const { checkPayment, isChecking } = useCheckPayment({
    bookingId,
    signedToken: token ?? "",
    onPaid: () => router.replace(`/booking/${bookingId}/status?token=${token}`),
  });

  // Dev mode: auto-poll Midtrans every 5s so no ngrok needed.
  // Prod: no-op — webhook → SSE handles updates.
  usePaymentAutoPoll({
    enabled: !!booking && booking.status === BOOKING_STATUSES.PENDING,
    onPoll: checkPayment,
    onPaid: () => router.replace(`/booking/${bookingId}/status?token=${token}`),
  });

  useEffect(() => {
    if (!booking) return;
    if (booking.status === BOOKING_STATUSES.PAID ||
        booking.status === BOOKING_STATUSES.ASSIGNED ||
        booking.status === BOOKING_STATUSES.IN_PROGRESS ||
        booking.status === BOOKING_STATUSES.READY ||
        booking.status === BOOKING_STATUSES.CLOSED) {
      router.replace(`/booking/${bookingId}/status?token=${token}`);
    }
  }, [booking, bookingId, token, router]);

  if (!token) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm text-muted-foreground">{t("status.invalidLink")}</p>
      </div>
    );
  }

  if (isLoading || !booking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (booking.status === BOOKING_STATUSES.CANCELLED ||
      booking.status === BOOKING_STATUSES.EXPIRED) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="text-lg font-semibold text-foreground">
          {t("pay.bookingCancelled", { defaultValue: "Booking tidak tersedia" })}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("pay.bookingCancelledDesc", { defaultValue: "Booking ini sudah dibatalkan atau kadaluarsa." })}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-8">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <CreditCard className="h-7 w-7 text-primary" />
        </div>
        <h1 className="mt-3 text-xl font-semibold text-foreground">
          {t("pay.title", { defaultValue: "Selesaikan Pembayaran" })}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("pay.subtitle", { defaultValue: "Klik tombol di bawah untuk membuka halaman pembayaran." })}
        </p>
      </div>

      {/* Booking info */}
      {(booking.plateText || booking.slotText) && (
        <div className="rounded-2xl border border-border px-5 py-4 space-y-2">
          {booking.plateText && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("pay.plate", { defaultValue: "Plat" })}</span>
              <span className="font-semibold tracking-wide">{booking.plateText}</span>
            </div>
          )}
          {booking.slotText && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("pay.slot", { defaultValue: "Slot" })}</span>
              <span className="font-semibold">{booking.slotText}</span>
            </div>
          )}
          {booking.priceAmount != null && (
            <div className="flex justify-between text-sm border-t border-border pt-2 mt-2">
              <span className="text-muted-foreground">{t("pay.total", { defaultValue: "Total" })}</span>
              <span className="font-bold text-primary">
                Rp {booking.priceAmount.toLocaleString("id-ID")}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Payment error notice */}
      {(paymentError || resumeError) && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">
            {resumeError
              ? t("pay.gatewayError", { defaultValue: "Gagal terhubung ke payment gateway. Coba lagi dalam beberapa detik." })
              : t("pay.paymentFailed", { defaultValue: "Pembayaran gagal atau dibatalkan. Silakan coba lagi." })}
          </p>
        </div>
      )}

      {/* Pay button */}
      <div className="space-y-3">
        <button
          onClick={() => void resume()}
          disabled={!canResume || isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("pay.processing", { defaultValue: "Memproses..." })}
            </>
          ) : (
            t("pay.payButton", { defaultValue: "Bayar Sekarang" })
          )}
        </button>

        <PaymentCheckButton
          onCheck={checkPayment}
          isChecking={isChecking}
          delayMs={0}
          label={t("pay.checkStatus", { defaultValue: "Sudah Bayar? Cek Status" })}
        />
      </div>
    </div>
  );
}
