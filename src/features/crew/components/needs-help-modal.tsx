"use client";

import { useState } from "react";
import { HelpCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import api from "@/lib/axios-crew";

const HELP_REASONS = [
  "VEHICLE_INACCESSIBLE",
  "MECHANICAL_ISSUE",
  "CUSTOMER_DISPUTE",
  "HAZARD",
  "OTHER",
] as const;

type HelpReason = typeof HELP_REASONS[number];

interface NeedsHelpModalProps {
  open: boolean;
  jobId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function NeedsHelpModal({ open, jobId, onClose, onSuccess }: NeedsHelpModalProps) {
  const { t } = useTranslation("crew");
  const [selectedReason, setSelectedReason] = useState<HelpReason | null>(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!selectedReason) return;
    setIsSubmitting(true);
    try {
      await api.post(`/v1/crew/jobs/${jobId}/request-help`, {
        reason: selectedReason,
        note: note.trim() || undefined,
      });
      toast.success(t("needsHelp.successToast"));
      onSuccess();
    } catch {
      toast.error(t("needsHelp.errorToast"));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open && !isSubmitting) onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-sm"
        onInteractOutside={(e) => { if (isSubmitting) e.preventDefault(); }}
        onEscapeKeyDown={(e) => { if (isSubmitting) e.preventDefault(); }}
      >
        <DialogHeader>
          <div className="mb-2 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
              <HelpCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <DialogTitle className="text-center">{t("needsHelp.modalTitle")}</DialogTitle>
          <p className="text-center text-sm text-muted-foreground">{t("needsHelp.modalDesc")}</p>
        </DialogHeader>

        <div className="mt-2 grid grid-cols-2 gap-2">
          {HELP_REASONS.map((reason) => (
            <button
              key={reason}
              type="button"
              onClick={() => setSelectedReason(reason)}
              className={cn(
                "rounded-lg border-2 p-3 text-left text-sm font-medium transition-colors",
                selectedReason === reason
                  ? "border-amber-500 bg-amber-50 text-amber-900 dark:border-amber-400 dark:bg-amber-950 dark:text-amber-100"
                  : "border-border bg-background text-foreground hover:bg-muted"
              )}
            >
              {t(`needsHelp.reasons.${reason}`)}
            </button>
          ))}
        </div>

        <div className="mt-3">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            {t("needsHelp.noteLabel")}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("needsHelp.notePlaceholder")}
            maxLength={300}
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <Button
          size="lg"
          className="mt-2 w-full"
          disabled={!selectedReason || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("needsHelp.submitting")}
            </>
          ) : (
            t("needsHelp.submitButton")
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
