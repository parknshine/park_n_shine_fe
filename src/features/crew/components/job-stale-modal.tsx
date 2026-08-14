"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Timer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/i18n";
import api from "@/lib/axios-crew";
import { toast } from "react-hot-toast";

interface JobStaleModalProps {
  open: boolean;
  jobId: string;
  onDone: () => void;
}

export function JobStaleModal({
  open,
  jobId,
  onDone,
}: Readonly<JobStaleModalProps>) {
  const { t } = useTranslation("crew");
  const [submitting, setSubmitting] = useState(false);

  async function handleRequestTimeAdjustment() {
    setSubmitting(true);
    try {
      await api.post(`/v1/crew/jobs/${jobId}/request-time-extension`);
      toast.success(t("job.timeExt.pending"));
      onDone();
    } catch {
      toast.error(t("job.requestTimeExtensionError"));
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className='max-w-sm'
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className='mb-2 flex justify-center'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950'>
              <AlertTriangle className='h-6 w-6 text-red-600 dark:text-red-400' />
            </div>
          </div>
          <DialogTitle className='text-center'>
            {t("job.staleModal.title")}
          </DialogTitle>
          <p className='text-center text-sm text-muted-foreground'>
            {t("job.staleModal.description")}
          </p>
        </DialogHeader>

        <div className='mt-2 space-y-3'>
          <button
            type='button'
            className='w-full rounded-lg border border-border bg-muted/40 p-4 text-left transition-colors hover:bg-muted disabled:opacity-50'
            onClick={handleRequestTimeAdjustment}
            disabled={submitting}
          >
            <div className='flex items-start gap-3'>
              {submitting ? (
                <Loader2 className='mt-0.5 h-5 w-5 shrink-0 animate-spin text-muted-foreground' />
              ) : (
                <Timer className='mt-0.5 h-5 w-5 shrink-0 text-muted-foreground' />
              )}
              <div>
                <p className='text-sm font-semibold text-foreground'>
                  {t("job.staleModal.requestTimeAdjustment")}
                </p>
                <p className='mt-0.5 text-xs text-muted-foreground'>
                  {t("job.staleModal.requestTimeAdjustmentDesc")}
                </p>
              </div>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
