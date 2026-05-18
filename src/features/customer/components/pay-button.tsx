"use client";

import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { usePaymentAction } from "@/features/customer/hooks";

interface PayButtonProps {
  bookingId: string;
  signedToken: string;
  plateText: string;
  slotText: string;
}

export function PayButton({
  bookingId,
  signedToken,
  plateText,
  slotText,
}: PayButtonProps) {
  const { canSubmit, confirmAndRedirect, error, isSubmitting } =
    usePaymentAction(bookingId, signedToken);

  return (
    <div className="space-y-3">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error === "payment_confirm_failed"
              ? "Gagal memproses pembayaran. Coba lagi."
              : error}
          </AlertDescription>
        </Alert>
      )}
      <Button
        size="lg"
        className="w-full rounded-full"
        disabled={!canSubmit || isSubmitting}
        onClick={() => confirmAndRedirect({ plateText, slotText })}
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
  );
}
