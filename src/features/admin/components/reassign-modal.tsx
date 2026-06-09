"use client";

import { useEffect, useState } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

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
  const queryClient = useQueryClient();
  const crewOptions = crew.filter((c) => c.active);
  const { t } = useTranslation("admin");

  useEffect(() => {
    if (open) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.crew() });
    }
  }, [open, queryClient]);

  async function handleConfirm() {
    if (!crewId) return;
    try {
      await reassign({ crewId });
      onSuccess();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        setCrewId("");
        toast.error(t("reassignModal.crewBusy"));
      } else {
        toast.error(t("reassignModal.error"));
      }
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
                  <SelectItem key={c.id} value={c.id} disabled={c.isBusy}>
                    {c.name}{c.isBusy ? ` (${t("reassignModal.busyBadge")})` : ""}
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
