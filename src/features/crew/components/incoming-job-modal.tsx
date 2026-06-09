"use client";

import { useState } from "react";
import { BriefcaseBusiness, Clock, XCircle, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import { REJECTION_REASONS } from "@/features/crew/types";
import type { JobPreview, RejectionReason } from "@/features/crew/types";

type Step = "choose" | "wait-pick" | "reject-pick";
type Submitting = "accept" | "wait" | "reject" | null;

interface IncomingJobModalProps {
  readonly open: boolean;
  readonly preview: JobPreview;
  readonly onAccept: () => Promise<void>;
  readonly onWait: (minutes: 10 | 30) => Promise<void>;
  readonly onReject: (reason: RejectionReason) => Promise<void>;
  readonly onClose: () => void;
}

export function IncomingJobModal({
  open,
  preview,
  onAccept,
  onWait,
  onReject,
  onClose,
}: IncomingJobModalProps) {
  const { t } = useTranslation("crew");
  const [step, setStep] = useState<Step>("choose");
  const [selectedReason, setSelectedReason] = useState<RejectionReason | null>(null);
  const [submitting, setSubmitting] = useState<Submitting>(null);

  async function handleAccept() {
    setSubmitting("accept");
    try { await onAccept(); } finally { setSubmitting(null); }
  }

  async function handleWait(minutes: 10 | 30) {
    setSubmitting("wait");
    try { await onWait(minutes); } finally { setSubmitting(null); }
  }

  async function handleReject() {
    if (!selectedReason) return;
    setSubmitting("reject");
    try { await onReject(selectedReason); } finally { setSubmitting(null); }
  }

  const isSubmitting = submitting !== null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent
        className="max-w-sm"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mb-2 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <BriefcaseBusiness className="h-6 w-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center">
            {t("job.incomingModal.title")}
          </DialogTitle>
          <p className="text-center text-sm text-muted-foreground">
            {t("job.incomingModal.description")}
          </p>
        </DialogHeader>

        {/* Job info chip */}
        <div className="flex items-center justify-center gap-3 rounded-lg bg-muted/50 px-4 py-2.5">
          <span className="text-xs text-muted-foreground">{t("job.incomingModal.plate")}</span>
          <span className="font-mono text-sm font-bold text-foreground">
            {preview.plateText || "—"}
          </span>
          <span className="text-border">·</span>
          <span className="text-xs text-muted-foreground">{t("job.incomingModal.slot")}</span>
          <span className="font-mono text-sm font-bold text-foreground">
            {preview.slotText || t("job.incomingModal.noSlot")}
          </span>
        </div>

        {/* Step: choose action */}
        {step === "choose" && (
          <div className="mt-1 space-y-2.5">
            {/* Accept */}
            <button
              className="w-full rounded-lg border-2 border-primary/30 bg-primary/5 p-4 text-left transition-colors hover:bg-primary/10 disabled:opacity-50"
              onClick={handleAccept}
              disabled={isSubmitting}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <BriefcaseBusiness className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {submitting === "accept" ? t("job.incomingModal.submitting") : t("job.incomingModal.accept")}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{t("job.incomingModal.acceptDesc")}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-primary/50" />
              </div>
            </button>

            {/* Wait */}
            <button
              className="w-full rounded-lg border border-border bg-muted/30 p-4 text-left transition-colors hover:bg-muted disabled:opacity-50"
              onClick={() => setStep("wait-pick")}
              disabled={isSubmitting}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t("job.incomingModal.wait")}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{t("job.incomingModal.waitDesc")}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
              </div>
            </button>

            {/* Reject */}
            <button
              className="w-full rounded-lg border border-border bg-muted/30 p-4 text-left transition-colors hover:bg-muted disabled:opacity-50"
              onClick={() => setStep("reject-pick")}
              disabled={isSubmitting}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t("job.incomingModal.reject")}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{t("job.incomingModal.rejectDesc")}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
              </div>
            </button>
          </div>
        )}

        {/* Step: pick wait duration */}
        {step === "wait-pick" && (
          <div className="mt-1 space-y-2.5">
            {([10, 30] as const).map((minutes) => (
              <button
                key={minutes}
                className="w-full rounded-lg border border-border bg-muted/30 p-4 text-left transition-colors hover:bg-muted disabled:opacity-50"
                onClick={() => handleWait(minutes)}
                disabled={isSubmitting}
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <p className="text-sm font-semibold text-foreground">
                    {submitting === "wait"
                      ? t("job.incomingModal.submitting")
                      : t(`job.incomingModal.wait${minutes}` as `job.incomingModal.wait10`)}
                  </p>
                </div>
              </button>
            ))}
            <button
              className="w-full rounded-lg border border-border p-3 text-center text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              onClick={() => setStep("choose")}
              disabled={isSubmitting}
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step: pick rejection reason */}
        {step === "reject-pick" && (
          <div className="mt-1 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("job.incomingModal.reasonLabel")}
            </p>
            <div className="space-y-1.5">
              {REJECTION_REASONS.map((reason) => (
                <button
                  key={reason}
                  className={cn(
                    "w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                    selectedReason === reason
                      ? "border-primary bg-primary/10 font-semibold text-primary"
                      : "border-border bg-muted/30 text-foreground hover:bg-muted"
                  )}
                  onClick={() => setSelectedReason(reason)}
                  disabled={isSubmitting}
                >
                  {t(`job.incomingModal.reasons.${reason}` as "job.incomingModal.reasons.VEHICLE_TOO_DIRTY")}
                </button>
              ))}
            </div>
            <button
              className="w-full rounded-lg border-2 border-destructive/30 bg-destructive/5 p-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
              onClick={handleReject}
              disabled={!selectedReason || isSubmitting}
            >
              {submitting === "reject" ? t("job.incomingModal.submitting") : t("job.incomingModal.rejectConfirm")}
            </button>
            <button
              className="w-full rounded-lg border border-border p-3 text-center text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              onClick={() => { setStep("choose"); setSelectedReason(null); }}
              disabled={isSubmitting}
            >
              ← Back
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
