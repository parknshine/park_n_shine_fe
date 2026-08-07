"use client";

import { useEffect, useState } from "react";
import { Loader2, Zap } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
  usePaymentActionV2,
  type ConfirmBookingPayloadV2,
} from "@/features/customer/hooks/use-payment-action-v2";
import { useTranslation } from "@/i18n";

interface PayButtonProps {
  bookingId: string;
  signedToken: string;
  plateText: string;
  slotText: string;
  phone?: string;
  locationLat?: number;
  locationLng?: number;
  locationName?: string;
  siteId?: string;
  onBeforePay?: () => void;
  labels?: { pay: string; processing: string; errorFallback: string };
}

const DEFAULT_LABELS = {
  pay: "Bayar Sekarang",
  processing: "Memproses...",
  errorFallback: "Gagal memproses pembayaran. Coba lagi.",
};

export function PayButton({
  bookingId,
  signedToken,
  plateText,
  slotText,
  phone,
  locationLat,
  locationLng,
  locationName,
  siteId,
  onBeforePay,
  labels = DEFAULT_LABELS,
}: Readonly<PayButtonProps>) {
  const { t } = useTranslation("customer");
  const [isSimulating, setIsSimulating] = useState(false);
  const { canSubmit, confirmAndRedirect, error, isSubmitting } =
    usePaymentActionV2(bookingId, signedToken);

  useEffect(() => {
    if (!error) return;
    toast.error(
      error === "payment_confirm_failed" ? labels.errorFallback : error,
    );
  }, [error, labels.errorFallback]);

  function handlePay() {
    onBeforePay?.();
    const payload: ConfirmBookingPayloadV2 = {
      plateText,
      slotText,
      ...(phone ? { phone } : {}),
      ...(locationLat != null && locationLng != null
        ? { locationLat, locationLng }
        : {}),
      ...(locationName ? { locationName } : {}),
      ...(siteId?.trim() ? { siteId } : {}),
    };
    void confirmAndRedirect(payload);
  }

  async function handleSimulatePay() {
    if (isSimulating) return;
    setIsSimulating(true);
    try {
      await api.post(
        `/v1/dev/bookings/${bookingId}/simulate-payment`,
        { plate: plateText, slot: slotText, ...(phone ? { phone } : {}) },
        { headers: { "X-Booking-Token": signedToken } },
      );
      globalThis.location.assign(
        `/booking/${bookingId}/status?token=${signedToken}`,
      );
    } catch {
      toast.error("Simulasi pembayaran gagal");
      setIsSimulating(false);
    }
  }

  return (
    <div className='space-y-3'>
      <p className='text-xs text-muted-foreground'>
        <i> {t("booking.confirm.disclaimer")}</i>
      </p>

      <Button
        size='lg'
        className='w-full rounded-full'
        disabled={!canSubmit || isSubmitting}
        onClick={handlePay}
      >
        {isSubmitting ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            {labels.processing}
          </>
        ) : (
          labels.pay
        )}
      </Button>

      {process.env.NODE_ENV !== "production" && (
        <button
          type='button'
          disabled={isSimulating}
          onClick={handleSimulatePay}
          className='flex w-full items-center justify-center gap-1.5 rounded-full border border-dashed border-amber-400 bg-amber-50 py-2.5 text-sm font-medium text-amber-700 transition hover:bg-amber-100 disabled:opacity-60 dark:border-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
        >
          {isSimulating ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Zap className='h-4 w-4' />
          )}
          {isSimulating ? "Memproses..." : "⚡ Simulasi Bayar (Dev Only)"}
        </button>
      )}
    </div>
  );
}
