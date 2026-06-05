"use client";

import { useState } from "react";
import { AlertTriangle, HelpCircle, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/i18n";
import api from "@/lib/axios-crew";

interface JobStaleModalProps {
  open: boolean;
  jobId: string;
  onDone: () => void;
}

export function JobStaleModal({ open, jobId, onDone }: JobStaleModalProps) {
  const { t } = useTranslation("crew");
  const [submitting, setSubmitting] = useState<"help" | "stale" | null>(null);

  async function handleRequestHelp() {
    setSubmitting("help");
    try {
      await api.post(`/v1/crew/jobs/${jobId}/request-help`);
      onDone();
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

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-sm"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
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
            onClick={handleRequestHelp}
            disabled={submitting !== null}
          >
            <div className="flex items-start gap-3">
              <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  {submitting === "help"
                    ? t("job.staleModal.submitting")
                    : t("job.staleModal.requestHelp")}
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
      </DialogContent>
    </Dialog>
  );
}
