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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBookingActions } from "@/features/admin/hooks";
import type { BookingStatus } from "@/features/customer/types";
import type { StatusOverridePayload } from "@/features/admin/types";

const VALID_TRANSITIONS: Array<{
  label: string;
  nextStatus: StatusOverridePayload["nextStatus"];
}> = [
  { label: "PENDING → PAID", nextStatus: "PAID" },
  { label: "PENDING → CANCELLED", nextStatus: "CANCELLED" },
  { label: "PAID → CANCELLED", nextStatus: "CANCELLED" },
];

interface StatusOverrideModalProps {
  open: boolean;
  bookingId: string;
  currentStatus: BookingStatus;
  onClose: () => void;
  onSuccess: () => void;
}

export function StatusOverrideModal({
  open,
  bookingId,
  onClose,
  onSuccess,
}: StatusOverrideModalProps) {
  const [nextStatus, setNextStatus] =
    useState<StatusOverridePayload["nextStatus"] | "">("");
  const [reasonCode, setReasonCode] = useState("");
  const { overrideStatus, isSubmitting, error } = useBookingActions(bookingId);

  async function handleConfirm() {
    if (!nextStatus || !reasonCode.trim()) return;
    try {
      await overrideStatus({ nextStatus, reasonCode: reasonCode.trim() });
      setNextStatus("");
      setReasonCode("");
      onSuccess();
    } catch {
      // error displayed via `error` state
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Override Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="transition-select">Transisi status</Label>
            <select
              id="transition-select"
              value={nextStatus}
              onChange={(e) =>
                setNextStatus(
                  e.target.value as StatusOverridePayload["nextStatus"] | ""
                )
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">— pilih transisi —</option>
              {VALID_TRANSITIONS.map((t) => (
                <option key={t.label} value={t.nextStatus}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reason">Alasan (wajib)</Label>
            <Textarea
              id="reason"
              placeholder="Masukkan alasan override..."
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
              rows={3}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">
              Gagal override status. Coba lagi.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!nextStatus || !reasonCode.trim() || isSubmitting}
          >
            {isSubmitting ? "Menyimpan..." : "Konfirmasi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
