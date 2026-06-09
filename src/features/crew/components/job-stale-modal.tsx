"use client";

import { useState } from "react";
import { AlertTriangle, HelpCircle, AlertCircle, ChevronLeft, Loader2 } from "lucide-react";
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

interface JobStaleModalProps {
  open: boolean;
  jobId: string;
  onDone: () => void;
}

export function JobStaleModal({ open, jobId, onDone }: JobStaleModalProps) {
  const { t } = useTranslation("crew");
  const [step, setStep] = useState<"choice" | "help-reason">("choice");
  const [selectedReason, setSelectedReason] = useState<HelpReason | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState<"help" | "stale" | null>(null);

  async function handleRequestHelp() {
    if (!selectedReason) return;
    setSubmitting("help");
    try {
      await api.post(`/v1/crew/jobs/${jobId}/request-help`, {
        reason: selectedReason,
        note: note.trim() || undefined,
      });
      toast.success(t("needsHelp.successToast"));
      onDone();
    } catch {
      toast.error(t("needsHelp.errorToast"));
    } finally {
      setSubmitting(null);
    }
  }

  async function handleMarkStale() {
    setSubmitting("stale");
    try {
      await api.post(`/v1/crew/jobs/${jobId}/mark-stale`);
      onDone();
    } finally {
      setSubmitting(null);
    }
  }

  function handleBack() {
    setStep("choice");
    setSelectedReason(null);
    setNote("");
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-sm"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {step === "choice" ? (
          <>
            <DialogHeader>
              <div className="mb-2 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <DialogTitle className="text-center">
                {t("job.staleModal.title")}
              </DialogTitle>
              <p className="text-center text-sm text-muted-foreground">
                {t("job.staleModal.description")}
              </p>
            </DialogHeader>

            <div className="mt-2 space-y-3">
              <button
                className="w-full rounded-lg border-2 border-blue-200 bg-blue-50 p-4 text-left transition-colors hover:bg-blue-100 disabled:opacity-50 dark:border-blue-800 dark:bg-blue-950 dark:hover:bg-blue-900"
                onClick={() => setStep("help-reason")}
                disabled={submitting !== null}
              >
                <div className="flex items-start gap-3">
                  <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                      {t("job.staleModal.requestHelp")}
                    </p>
                    <p className="mt-0.5 text-xs text-blue-700 dark:text-blue-300">
                      {t("job.staleModal.requestHelpDesc")}
                    </p>
                  </div>
                </div>
              </button>

              <button
                className="w-full rounded-lg border border-border bg-muted/40 p-4 text-left transition-colors hover:bg-muted disabled:opacity-50"
                onClick={handleMarkStale}
                disabled={submitting !== null}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {submitting === "stale"
                        ? t("job.staleModal.submitting")
                        : t("job.staleModal.markStale")}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t("job.staleModal.markStaleDesc")}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </>
        ) : (
          <>
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

            <div className="mt-2 flex gap-2">
              <Button
                variant="outline"
                size="md"
                className="flex-1"
                onClick={handleBack}
                disabled={submitting !== null}
                prefix={<ChevronLeft className="h-4 w-4" />}
              >
                {t("action.back", { ns: "common" })}
              </Button>
              <Button
                size="md"
                className="flex-1"
                disabled={!selectedReason || submitting !== null}
                onClick={handleRequestHelp}
              >
                {submitting === "help" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("needsHelp.submitButton")
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
