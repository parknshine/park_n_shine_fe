"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBookingActions } from "@/features/admin/hooks";
import { useTranslation } from "@/i18n";

const REFUND_REASONS: Array<{ value: string; labelKey: string }> = [
  { value: "Kendaraan tidak ditemukan", labelKey: "vehicleNotFound" },
  { value: "Kendaraan tidak bisa dicuci — terlalu rapat", labelKey: "vehicleTooTight" },
  { value: "Pembatalan oleh pelanggan", labelKey: "customerCancellation" },
  { value: "Kesalahan pembayaran", labelKey: "paymentError" },
  { value: "Lainnya", labelKey: "other" },
];

interface RefundModalProps {
  open: boolean;
  bookingId: string;
  priceAmount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function RefundModal({
  open,
  bookingId,
  priceAmount,
  onClose,
  onSuccess,
}: Readonly<RefundModalProps>) {
  const [reasonCode, setReasonCode] = useState("");
  const { refund, isSubmitting } = useBookingActions(bookingId);
  const { t } = useTranslation("admin");

  async function handleConfirm() {
    if (!reasonCode) return;
    try {
      await refund({ reasonCode });
      setReasonCode("");
      onSuccess();
    } catch {
      toast.error(t("refundModal.error"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("refundModal.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="rounded-md bg-muted px-3 py-2 text-sm text-foreground">
            {t("refundModal.confirmation", { amount: priceAmount.toLocaleString("id-ID") })}
          </p>

          <div className="space-y-1.5">
            <Label>{t("refundModal.reasonLabel")}</Label>
            <Select value={reasonCode} onValueChange={setReasonCode}>
              <SelectTrigger>
                <SelectValue placeholder={t("refundModal.reasonPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {REFUND_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {t(`refundModal.reasons.${r.labelKey}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t("refundModal.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reasonCode || isSubmitting}
          >
            {isSubmitting ? t("refundModal.processing") : t("refundModal.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
