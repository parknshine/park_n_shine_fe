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
import { useBookingActions, useAdminCrew } from "@/features/admin/hooks";
import { useTranslation } from "@/i18n";

interface ReassignModalProps {
  open: boolean;
  bookingId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReassignModal({
  open,
  bookingId,
  onClose,
  onSuccess,
}: Readonly<ReassignModalProps>) {
  const [crewId, setCrewId] = useState("");
  const { reassign, isSubmitting } = useBookingActions(bookingId);
  const { crew } = useAdminCrew();
  const crewOptions = crew.filter((c) => c.active);
  const { t } = useTranslation("admin");

  async function handleConfirm() {
    if (!crewId) return;
    try {
      await reassign({ crewId });
      onSuccess();
    } catch {
      toast.error(t("reassignModal.error"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("reassignModal.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label>{t("reassignModal.crewLabel")}</Label>
            <Select value={crewId} onValueChange={setCrewId}>
              <SelectTrigger>
                <SelectValue placeholder={t("reassignModal.crewPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {crewOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t("reassignModal.cancel")}
          </Button>
          <Button onClick={handleConfirm} disabled={!crewId || isSubmitting}>
            {isSubmitting ? t("reassignModal.saving") : t("reassignModal.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
