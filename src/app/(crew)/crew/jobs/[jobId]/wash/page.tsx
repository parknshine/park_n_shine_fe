"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ArrowRight, Droplets, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EtaCountdown, TimeExtensionControl } from "@/features/crew/components";
import {
  useCrewJob,
  useStartWash,
  useDoneWashing,
  useEtaExpired,
} from "@/features/crew/hooks";
import { useTranslation } from "@/i18n";

export function WashPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const { t } = useTranslation("crew");

  const { job, isLoading: isJobLoading } = useCrewJob(jobId);
  const { startWash } = useStartWash(jobId);
  const { doneWashing, isLoading: isDoneLoading } = useDoneWashing(jobId);
  const expired = useEtaExpired(job?.etaEndsAt);

  const startCalledRef = useRef(false);

  // Auto-call start-wash once when landing on this page
  useEffect(() => {
    if (startCalledRef.current) return;
    startCalledRef.current = true;
    startWash().catch(() => {
      // Status may already be IN_PROGRESS (e.g. page refresh) — safe to ignore
    });
  }, [startWash]);

  async function handleDoneWashing() {
    try {
      await doneWashing();
      router.replace(`/crew/jobs/${jobId}/finish`);
    } catch {
      toast.error(t("wash.error"));
    }
  }

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

      {/* Sticky CTA */}
      <div className='fixed bottom-5 left-0 right-0 z-30 border-t border-border bg-background px-4 pb-[env(safe-area-inset-bottom,16px)] pt-3'>
        <div className='mx-auto max-w-md flex flex-col gap-2'>
          {expired && (
            <p className='text-center text-xs font-medium text-red-500'>
              {t("job.timeExpiredHint")}
            </p>
          )}
          <Button
            size='lg'
            variant='default'
            className='h-14 w-full rounded-xl text-base font-bold'
            disabled={isDoneLoading || expired}
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

          <TimeExtensionControl jobId={jobId} etaEndsAt={job.etaEndsAt} />
        </div>
      </div>
    </>
  );
}

export default WashPage;
