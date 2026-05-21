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
import { useBookingActions } from "@/features/admin/hooks";
import { useTranslation } from "@/i18n";

const MOCK_CREW: Record<string, Array<{ id: string; name: string }>> = {
  "site-1": [
    { id: "crew-1", name: "Budi Santoso" },
    { id: "crew-2", name: "Agus Wijaya" },
  ],
  "site-2": [{ id: "crew-3", name: "Rudi Hartono" }],
};

interface ReassignModalProps {
  open: boolean;
  siteId: string;
  bookingId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReassignModal({
  open,
  siteId,
  bookingId,
  onClose,
  onSuccess,
}: ReassignModalProps) {
  const [crewId, setCrewId] = useState("");
  const { reassign, isSubmitting, error } = useBookingActions(bookingId);
  const crewOptions = MOCK_CREW[siteId] ?? [];
  const { t } = useTranslation("admin");

  async function handleConfirm() {
    if (!crewId) return;
    try {
      await reassign({ crewId });
      onSuccess();
    } catch {
      // error displayed via `error` state
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
            <Label htmlFor="crew-select">{t("reassignModal.crewLabel")}</Label>
            <select
              id="crew-select"
              value={crewId}
              onChange={(e) => setCrewId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">{t("reassignModal.crewPlaceholder")}</option>
              {crewOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {error && (
            <p className="text-sm text-destructive">{t("reassignModal.error")}</p>
          )}
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
