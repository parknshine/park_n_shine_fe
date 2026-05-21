"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { parseAsString, useQueryStates } from "nuqs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Phone } from "lucide-react";
import api from "@/lib/axios";
import { useTranslation } from "@/i18n";
import { AppShell } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookingSummaryCard } from "@/features/customer/components/booking-summary-card";
import { useBookingStatus } from "@/features/customer/hooks";
import { mutationKeys, queryKeys } from "@/lib/query-keys";
import type { PaymentIntentResponse } from "@/features/customer/types";

interface QrConfirmPayload {
  plateText: string;
  slotText: string;
  phone: string;
}

export default function BookConfirmPage() {
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
    if (!bookingId || !token || !phone || !plate || !slot) {
      router.replace(`/q/${qrId}/book/capture`);
    }
  }, [bookingId, token, phone, plate, slot, router, qrId]);

  const { booking } = useBookingStatus({
    bookingId: bookingId ?? "",
    signedToken: token ?? "",
    pollIntervalMs: Infinity,
    enabled: !!bookingId && !!token,
  });

  const [hasSubmitted, setHasSubmitted] = useState(false);

  const mutation = useMutation({
    meta: { persist: false },
    mutationFn: async (payload: QrConfirmPayload) => {
      const response = await api.post<PaymentIntentResponse>(
        `/v1/bookings/${bookingId}/confirm`,
        payload,
        {
          headers: {
            "Idempotency-Key": bookingId,
            "X-Booking-Token": token,
          },
        }
      );
      return response.data;
    },
    mutationKey: mutationKeys.customer.confirmPayment(bookingId ?? ""),
    onError: () => {
      setHasSubmitted(false);
    },
    onSuccess: (paymentIntent) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.customer.booking(bookingId ?? ""),
      });
      window.location.assign(paymentIntent.redirectUrl);
    },
  });

  if (!bookingId || !token || !phone || !plate || !slot) {
    return null;
  }

  function handlePay() {
    if (mutation.isPending || hasSubmitted) return;
    setHasSubmitted(true);
    mutation.mutate({ plateText: plate!, slotText: slot!, phone: phone! });
  }

  const canSubmit = !mutation.isPending && !hasSubmitted;
  const error =
    mutation.error instanceof Error
      ? mutation.error.message
      : mutation.error
        ? "payment_confirm_failed"
        : null;

  return (
    <AppShell surface="customer">
      <div className="space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("booking.step", { current: 2, total: 2 })}
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

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{t("booking.capture.phoneLabel")}</p>
                <p className="font-semibold text-foreground">{phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <button
          type="button"
          className="flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-2 hover:underline"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("booking.confirm.back")}
        </button>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          size="lg"
          className="w-full rounded-full"
          disabled={!canSubmit}
          onClick={handlePay}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("booking.confirm.processing")}
            </>
          ) : (
            t("booking.confirm.pay")
          )}
        </Button>
      </div>
    </AppShell>
  );
}
