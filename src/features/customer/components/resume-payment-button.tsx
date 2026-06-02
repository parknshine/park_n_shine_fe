"use client";

import { Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResumePayment } from "@/features/customer/hooks/use-resume-payment";

interface ResumePaymentButtonProps {
  bookingId: string;
  token: string;
}

export function ResumePaymentButton({ bookingId, token }: ResumePaymentButtonProps) {
  const { resume, isSubmitting, canResume } = useResumePayment(bookingId, token);

  return (
    <Button
      className="w-full"
      disabled={!canResume || isSubmitting}
      onClick={() => void resume()}
    >
      {isSubmitting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="mr-2 h-4 w-4" />
      )}
      {isSubmitting ? "Memproses..." : "Lanjutkan Pembayaran"}
    </Button>
  );
}
