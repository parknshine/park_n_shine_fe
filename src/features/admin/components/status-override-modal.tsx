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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBookingActions } from "@/features/admin/hooks";
import type { BookingStatus } from "@/features/customer/types";
import type { StatusOverridePayload } from "@/features/admin/types";
import { useTranslation } from "@/i18n";

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
  const [selectedLabel, setSelectedLabel] = useState("");
  const [reasonCode, setReasonCode] = useState("");
  const { overrideStatus, isSubmitting } = useBookingActions(bookingId);
  const { t } = useTranslation("admin");

  async function handleConfirm() {
    const transition = VALID_TRANSITIONS.find((tr) => tr.label === selectedLabel);
    if (!transition || !reasonCode.trim()) return;
    try {
      await overrideStatus({ nextStatus: transition.nextStatus, reasonCode: reasonCode.trim() });
      setSelectedLabel("");
      setReasonCode("");
      onSuccess();
    } catch {
      toast.error(t("overrideModal.error"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("overrideModal.title")}</DialogTitle>
        </DialogHeader>

        <div className='space-y-3 py-2'>
          <div className='space-y-1.5'>
            <Label>{t("overrideModal.transitionLabel")}</Label>
            <Select value={selectedLabel} onValueChange={setSelectedLabel}>
              <SelectTrigger>
                <SelectValue
                  placeholder={t("overrideModal.transitionPlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
                {VALID_TRANSITIONS.map((transition) => (
                  <SelectItem key={transition.label} value={transition.label}>
                    {transition.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='reason'>{t("overrideModal.reasonLabel")}</Label>
            <Textarea
              id='reason'
              placeholder={t("overrideModal.reasonPlaceholder")}
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose} disabled={isSubmitting}>
            {t("overrideModal.cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedLabel || !reasonCode.trim() || isSubmitting}
          >
            {isSubmitting
              ? t("overrideModal.saving")
              : t("overrideModal.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
