"use client";

import { useState } from "react";
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
import { useBookingActions } from "@/features/admin/hooks";

const REFUND_REASON_CODES = [
  "Kendaraan tidak ditemukan",
  "Kendaraan tidak bisa dicuci — terlalu rapat",
  "Pembatalan oleh pelanggan",
  "Kesalahan pembayaran",
  "Lainnya",
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
      // error displayed via `error` state
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
          <DialogTitle>Proses Refund</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Tipe refund</Label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={amountType === "full" ? "default" : "outline"}
                onClick={() => setAmountType("full")}
              >
                Full — Rp {priceAmount.toLocaleString("id-ID")}
              </Button>
              <Button
                size="sm"
                variant={amountType === "partial" ? "default" : "outline"}
                onClick={() => setAmountType("partial")}
              >
                Partial
              </Button>
            </div>
          </div>

          {amountType === "partial" && (
            <div className="space-y-1.5">
              <Label htmlFor="partial-amount">Nominal refund (Rp)</Label>
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
            <Label htmlFor="refund-reason">Alasan refund (wajib)</Label>
            <select
              id="refund-reason"
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">— pilih alasan —</option>
              {REFUND_REASON_CODES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {canConfirm && (
            <p className="rounded-md bg-muted px-3 py-2 text-sm text-foreground">
              Refund{" "}
              <strong>Rp {refundAmount.toLocaleString("id-ID")}</strong> akan
              diproses ke customer.
            </p>
          )}

          {error && (
            <p className="text-sm text-destructive">
              Gagal proses refund. Coba lagi.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canConfirm || isSubmitting}
          >
            {isSubmitting ? "Memproses..." : "Konfirmasi Refund"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
