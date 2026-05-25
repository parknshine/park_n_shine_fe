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
import { Input } from "@/components/ui/input";
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
}: RefundModalProps) {
  const [amountType, setAmountType] = useState<"full" | "partial">("full");
  const [partialAmount, setPartialAmount] = useState("");
  const [reasonCode, setReasonCode] = useState("");
  const { refund, isSubmitting, error } = useBookingActions(bookingId);
  const { t } = useTranslation("admin");

  const refundAmount =
    amountType === "full" ? priceAmount : Number(partialAmount) || 0;

  async function handleConfirm() {
    if (!reasonCode) return;
    try {
      await refund({
        amountType,
        amount: amountType === "partial" ? Number(partialAmount) : undefined,
        reasonCode,
      });
      setAmountType("full");
      setPartialAmount("");
      setReasonCode("");
      onSuccess();
    } catch {
      toast.error(t("refundModal.error"));
    }
  }

  const canConfirm =
    !!reasonCode &&
    (amountType === "full" ||
      (amountType === "partial" && Number(partialAmount) > 0));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("refundModal.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>{t("refundModal.typeLabel")}</Label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={amountType === "full" ? "default" : "outline"}
                onClick={() => setAmountType("full")}
              >
                {t("refundModal.fullLabel", { amount: priceAmount.toLocaleString("id-ID") })}
              </Button>
              <Button
                size="sm"
                variant={amountType === "partial" ? "default" : "outline"}
                onClick={() => setAmountType("partial")}
              >
                {t("refundModal.partial")}
              </Button>
            </div>
          </div>

          {amountType === "partial" && (
            <div className="space-y-1.5">
              <Label htmlFor="partial-amount">{t("refundModal.amountLabel")}</Label>
              <Input
                id="partial-amount"
                type="number"
                min={1}
                max={priceAmount}
                placeholder="0"
                value={partialAmount}
                onChange={(e) => setPartialAmount(e.target.value)}
              />
            </div>
          )}

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

          {canConfirm && (
            <p className="rounded-md bg-muted px-3 py-2 text-sm text-foreground">
              {t("refundModal.confirmation", { amount: refundAmount.toLocaleString("id-ID") })}
            </p>
          )}

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t("refundModal.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canConfirm || isSubmitting}
          >
            {isSubmitting ? t("refundModal.processing") : t("refundModal.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
