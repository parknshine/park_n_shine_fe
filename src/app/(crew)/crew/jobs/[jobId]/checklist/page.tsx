"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2, Timer } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { WashChecklist } from "@/features/crew/components";
import { useCrewJob, useWashChecklist } from "@/features/crew/hooks";
import type { CrewJob } from "@/features/crew/types";
import { useTranslation } from "@/i18n";
import api from "@/lib/axios-crew";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Inner component — has access to resolved job
// ---------------------------------------------------------------------------

function ChecklistContent({ jobId, job }: Readonly<{ jobId: string; job: CrewJob }>) {
  const router = useRouter();
  const { t } = useTranslation("crew");
  const [timeExtState, setTimeExtState] = useState<"idle" | "sending" | "pending" | "approved" | "rejected">("idle");
  const [showTimeExtConfirm, setShowTimeExtConfirm] = useState(false);

  async function handleRequestTimeExtension() {
    setTimeExtState("sending");
    try {
      await api.post(`/v1/crew/jobs/${jobId}/request-time-extension`);
      setTimeExtState("pending");
      toast.success(t("job.timeExt.pending"));
    } catch {
      setTimeExtState("idle");
      toast.error(t("job.requestTimeExtensionError"));
    }
  }

  const prevEtaRef = useRef<string | null | undefined>(job?.etaEndsAt);
  useEffect(() => {
    if (timeExtState !== "pending") return;
    if (job?.etaEndsAt !== prevEtaRef.current) {
      setTimeExtState("approved");
      toast.success(t("job.timeExt.approved"));
      prevEtaRef.current = job?.etaEndsAt;
    }
  }, [job?.etaEndsAt, timeExtState, t]);

  useEffect(() => {
    function handleRejected(e: Event) {
      const detail = (e as CustomEvent<{ bookingId: string }>).detail;
      if (detail.bookingId === jobId) {
        setTimeExtState("rejected");
        toast.error(t("job.timeExt.rejected"));
      }
    }
    globalThis.addEventListener("time-extension-rejected", handleRejected);
    return () => globalThis.removeEventListener("time-extension-rejected", handleRejected);
  }, [jobId, t]);

  const {
    items,
    nextItem,
    pendingItemId,
    completeItem,
    isComplete,
    error,
  } = useWashChecklist(jobId, job.checklist);

  const doneCount = items.filter((i) => Boolean(i.completedAt)).length;
  const total = items.length;

  // Translate label keys coming from the server, fall back to raw key
  const displayItems = items.map((item) => ({
    ...item,
    labelKey: t(`checklist.steps.${item.labelKey}`, { defaultValue: item.labelKey }),
  }));

  async function handleComplete(itemId: string) {
    try {
      await completeItem(itemId);
    } catch {
      toast.error(error ?? t("checklist.item.saveError", { defaultValue: "Gagal menyimpan langkah. Coba lagi." }));
    }
  }

  return (
    <>
      {/* Scrollable body — leave room for sticky CTA (~88px) */}
      <main className="mx-auto max-w-md px-4 pb-28 pt-4">

        {/* Page header */}
        <div className="mb-5">
          <h1 className="text-lg font-semibold text-foreground">
            {t("checklist.title")}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t("checklist.subtitle")}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {t("checklist.progress", { done: doneCount, total })}
            </span>
            {isComplete && (
              <span className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                {t("checklist.allDoneHint")}
              </span>
            )}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: total > 0 ? `${(doneCount / total) * 100}%` : "0%" }}
              role="progressbar"
              aria-valuenow={doneCount}
              aria-valuemin={0}
              aria-valuemax={total}
            />
          </div>
        </div>

        {/* Checklist */}
        {items.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            {t("checklist.empty", { defaultValue: "Tidak ada langkah tersedia." })}
          </p>
        ) : (
          <WashChecklist
            items={displayItems}
            nextItemId={nextItem?.id}
            pendingItemId={pendingItemId}
            onComplete={handleComplete}
            labels={{
              done: t("checklist.item.done"),
              saving: t("checklist.item.saving"),
            }}
          />
        )}
      </main>

      {/* Time extension confirmation modal */}
      <Dialog open={showTimeExtConfirm} onOpenChange={setShowTimeExtConfirm}>
        <DialogContent className="mx-auto max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-amber-500" />
              {t("job.timeExt.confirmTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("job.timeExt.confirmDesc")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowTimeExtConfirm(false)}
            >
              {t("job.timeExt.confirmCancel")}
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onClick={() => {
                setShowTimeExtConfirm(false);
                void handleRequestTimeExtension();
              }}
            >
              {t("job.timeExt.confirmOk")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sticky CTA */}
      <div className="fixed bottom-5 left-0 right-0 z-30 border-t border-border bg-background px-4 pb-[env(safe-area-inset-bottom,16px)] pt-3">
        <div className="mx-auto max-w-md flex flex-col gap-2">
          {isComplete ? (
            <Button
              size="lg"
              variant="default"
              className="h-14 w-full rounded-xl text-base font-bold"
              onClick={() => router.push(`/crew/jobs/${jobId}/finish`)}
              suffix={<ArrowRight className="h-5 w-5" />}
              aria-label={t("checklist.continueAriaLabel")}
            >
              {t("checklist.continueButton")}
            </Button>
          ) : (
            <Button
              size="md"
              variant={timeExtState === "approved" ? "default" : "outline"}
              className={cn(
                "w-full rounded-xl",
                timeExtState === "rejected" && "border-red-300 text-red-600",
                timeExtState === "approved" && "border-green-300 bg-green-50 text-green-700",
              )}
              onClick={
                timeExtState === "idle" || timeExtState === "rejected"
                  ? () => setShowTimeExtConfirm(true)
                  : undefined
              }
              disabled={
                timeExtState === "sending" ||
                timeExtState === "pending" ||
                timeExtState === "approved"
              }
              prefix={<Timer className="h-4 w-4" />}
            >
              {timeExtState === "sending" && t("job.timeExt.sending")}
              {timeExtState === "pending" && t("job.timeExt.pending")}
              {timeExtState === "approved" && t("job.timeExt.approved")}
              {timeExtState === "rejected" && t("job.timeExt.requestAgain")}
              {timeExtState === "idle" && t("job.requestTimeExtension")}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Page — guards until job is loaded
// ---------------------------------------------------------------------------

export function ChecklistPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { t } = useTranslation("crew");
  const { job, isLoading } = useCrewJob(jobId);

  if (isLoading || !job) {
    return (
      <main className="flex min-h-[calc(100dvh-44px)] items-center justify-center">
        <Loader2
          className="h-8 w-8 animate-spin text-muted-foreground"
          aria-label={t("job.loading")}
        />
      </main>
    );
  }

  return <ChecklistContent jobId={jobId} job={job} />;
}

export default ChecklistPage;
