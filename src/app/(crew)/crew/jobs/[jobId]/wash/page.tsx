"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  ArrowRight,
  CheckCircle2,
  Droplets,
  Loader2,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EtaCountdown } from "@/features/crew/components";
import {
  useCrewJob,
  useStartWash,
  useDoneWashing,
} from "@/features/crew/hooks";
import { useTranslation } from "@/i18n";
import api from "@/lib/axios-crew";
import { cn } from "@/lib/utils";

type TimeExtState = "idle" | "sending" | "pending" | "approved" | "rejected";

export function WashPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const { t } = useTranslation("crew");

  const { job, isLoading: isJobLoading } = useCrewJob(jobId);
  const { startWash } = useStartWash(jobId);
  const { doneWashing, isLoading: isDoneLoading } = useDoneWashing(jobId);

  const startCalledRef = useRef(false);
  const prevEtaRef = useRef<string | null | undefined>(undefined);

  const [timeExtState, setTimeExtState] = useState<TimeExtState>("idle");
  const [showTimeExtConfirm, setShowTimeExtConfirm] = useState(false);

  // Auto-call start-wash once when landing on this page
  useEffect(() => {
    if (startCalledRef.current) return;
    startCalledRef.current = true;
    startWash().catch(() => {
      // Status may already be IN_PROGRESS (e.g. page refresh) — safe to ignore
    });
  }, [startWash]);

  // Initialise the prevEtaRef once the job loads
  useEffect(() => {
    if (job && prevEtaRef.current === undefined) {
      prevEtaRef.current = job.etaEndsAt;
    }
  }, [job]);

  // Detect ETA extension approval: etaEndsAt changes while waiting
  useEffect(() => {
    if (timeExtState !== "pending") return;
    if (job?.etaEndsAt !== prevEtaRef.current) {
      setTimeExtState("approved");
      toast.success(t("job.timeExt.approved"));
      prevEtaRef.current = job?.etaEndsAt;
    }
  }, [job?.etaEndsAt, timeExtState, t]);

  // Listen for rejection event emitted by crew-shell realtime handler
  useEffect(() => {
    function handleRejected(e: Event) {
      const detail = (e as CustomEvent<{ bookingId: string }>).detail;
      if (detail.bookingId === jobId) {
        setTimeExtState("rejected");
        toast.error(t("job.timeExt.rejected"));
      }
    }
    globalThis.addEventListener("time-extension-rejected", handleRejected);
    return () =>
      globalThis.removeEventListener("time-extension-rejected", handleRejected);
  }, [jobId, t]);

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

  async function handleDoneWashing() {
    try {
      await doneWashing();
      router.replace(`/crew/jobs/${jobId}/finish`);
    } catch {
      toast.error(t("wash.error"));
    }
  }

  const timeExtPrefixMap: Record<TimeExtState, React.ReactNode> = {
    approved: <CheckCircle2 className='h-4 w-4' />,
    sending: <Loader2 className='h-4 w-4 animate-spin' />,
    pending: <Loader2 className='h-4 w-4 animate-spin' />,
    idle: <Timer className='h-4 w-4' />,
    rejected: <Timer className='h-4 w-4' />,
  };
  const timeExtPrefix = timeExtPrefixMap[timeExtState];

  if (isJobLoading || !job) {
    return (
      <main className='flex min-h-[calc(100dvh-44px)] items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </main>
    );
  }

  return (
    <>
      <main className='mx-auto max-w-md px-4 pb-28 pt-8'>
        {/* Icon + heading */}
        <div className='mb-8 flex flex-col items-center gap-3 text-center'>
          <span className='flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'>
            <Droplets className='h-8 w-8' aria-hidden />
          </span>
          <div>
            <h1 className='text-xl font-bold text-foreground'>
              {t("wash.title")}
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              {t("wash.subtitle")}
            </p>
          </div>
        </div>

        {/* ETA countdown */}
        {job.etaEndsAt && (
          <div className='mb-4'>
            <EtaCountdown etaEndsAt={job.etaEndsAt} />
          </div>
        )}

        {/* Job summary card */}
        <div className='rounded-xl border border-border bg-card p-4 shadow-sm'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>
              {t("wash.plate")}
            </span>
            <span className='font-mono text-lg font-bold tracking-widest text-foreground'>
              {job.plateText ?? "—"}
            </span>
          </div>
          {job.slotText && (
            <div className='mt-2 flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>
                {t("wash.slot")}
              </span>
              <span className='font-medium text-foreground'>
                {job.slotText}
              </span>
            </div>
          )}
        </div>

        {/* Status hint */}
        <p className='mt-6 text-center text-xs text-muted-foreground'>
          {t("wash.hint")}
        </p>
      </main>

      {/* Time extension confirmation modal */}
      <Dialog open={showTimeExtConfirm} onOpenChange={setShowTimeExtConfirm}>
        <DialogContent className='mx-auto max-w-sm rounded-2xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Timer className='h-5 w-5 text-amber-500' />
              {t("job.timeExt.confirmTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("job.timeExt.confirmDesc")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='flex-row gap-2 pt-2'>
            <Button
              variant='outline'
              className='flex-1'
              onClick={() => setShowTimeExtConfirm(false)}
            >
              {t("job.timeExt.confirmCancel")}
            </Button>
            <Button
              variant='default'
              className='flex-1'
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
      <div className='fixed bottom-5 left-0 right-0 z-30 border-t border-border bg-background px-4 pb-[env(safe-area-inset-bottom,16px)] pt-3'>
        <div className='mx-auto max-w-md flex flex-col gap-2'>
          <Button
            size='lg'
            variant='default'
            className='h-14 w-full rounded-xl text-base font-bold'
            disabled={isDoneLoading}
            onClick={handleDoneWashing}
            suffix={
              isDoneLoading ? (
                <Loader2 className='h-5 w-5 animate-spin' />
              ) : (
                <ArrowRight className='h-5 w-5' />
              )
            }
          >
            {t("wash.doneButton")}
          </Button>

          {/* Time extension button */}
          <Button
            size='md'
            variant='ghost'
            className={cn(
              "w-full rounded-2xl font-semibold transition-all duration-300",
              timeExtState === "idle" &&
                "border border-dashed border-slate-300 bg-transparent text-slate-600 hover:border-slate-400 hover:bg-slate-50",
              timeExtState === "sending" &&
                "cursor-not-allowed border border-slate-200 bg-slate-50 text-slate-400",
              timeExtState === "pending" &&
                "border border-amber-300 bg-amber-50 text-amber-700 shadow-sm shadow-amber-100",
              timeExtState === "approved" &&
                "border-0 bg-linear-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-200/60 hover:from-emerald-500 hover:to-green-600",
              timeExtState === "rejected" &&
                "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100",
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
            prefix={timeExtPrefix}
          >
            {timeExtState === "sending" && t("job.timeExt.sending")}
            {timeExtState === "pending" && t("job.timeExt.pending")}
            {timeExtState === "approved" && t("job.timeExt.approved")}
            {timeExtState === "rejected" && t("job.timeExt.requestAgain")}
            {timeExtState === "idle" && t("job.requestTimeExtension")}
          </Button>
        </div>
      </div>
    </>
  );
}

export default WashPage;
