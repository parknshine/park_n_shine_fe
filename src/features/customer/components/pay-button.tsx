"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { usePaymentAction } from "@/features/customer/hooks";

interface PayButtonProps {
  bookingId: string;
  signedToken: string;
  plateText: string;
  slotText: string;
  labels?: {
    pay: string;
    processing: string;
    errorFallback: string;
  };
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
  labels = DEFAULT_LABELS,
}: PayButtonProps) {
  const { canSubmit, confirmAndRedirect, error, isSubmitting } =
    usePaymentAction(bookingId, signedToken);

  useEffect(() => {
    if (!error) return;
    toast.error(error === "payment_confirm_failed" ? labels.errorFallback : error);
  }, [error, labels.errorFallback]);

  return (
    <div className="space-y-3">
      <Button
        size="lg"
        className="w-full rounded-full"
        disabled={!canSubmit || isSubmitting}
        onClick={() => confirmAndRedirect({ plateText, slotText })}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {labels.processing}
          </>
        ) : (
          labels.pay
        )}
      </Button>
    </div>
  );
}
