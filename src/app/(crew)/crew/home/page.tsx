"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Bell,
  BellOff,
  BriefcaseBusiness,
  Car,
  Clock,
  Inbox,
  Loader2,
  Star,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import {
  useJobQueue,
  useNextJob,
  useCrewMonthlyStats,
} from "@/features/crew/hooks";
import { IncomingJobModal } from "@/features/crew/components";
import { previewNextJob } from "@/features/crew/hooks/use-next-job";
import type {
  CrewJob,
  JobPreview,
  RejectionReason,
} from "@/features/crew/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";
import { usePushNotification } from "@/lib/use-push-notification";
import { queryKeys } from "@/lib/query-keys";

export function getResumeTarget(job: CrewJob): string {
  const base = `/crew/jobs/${job.id}`;
  // Resume directly to the step the crew was actually on, not the job detail
  // landing page — logging out mid-step must not cost them an extra tap.
  if (job.status === "ASSIGNED") return `${base}/verify`;
  if (job.status === "LOCATED") return `${base}/before-photos`;
  if (job.status === "IN_PROGRESS") {
    // GET /jobs/active serializes media via MEDIA_TYPE_TO_KIND, which maps
    // BEFORE_FRONT/BACK/LEFT/RIGHT down to the short "front"/"back"/"left"/
    // "right" kinds (legacy naming) — NOT "before_front" etc. After-photo
    // types have no explicit mapping, so they fall through to the lowercased
    // type string ("after_front" etc), which does match the upload-side kind.
    const beforeKinds = ["front", "back", "left", "right"];
    const afterKinds = ["after_front", "after_back", "after_left", "after_right"];
    const hasAllBeforePhotos = beforeKinds.every((k) =>
      job.media.some((m) => m.kind === k),
    );
    if (!hasAllBeforePhotos) return `${base}/before-photos`;
    const hasAnyAfterPhoto = afterKinds.some((k) =>
      job.media.some((m) => m.kind === k),
    );
    if (hasAnyAfterPhoto) return `${base}/finish`;
    return `${base}/wash`;
  }
  // "Selesai Cuci" flips status to READY immediately (before after-photos are
  // uploaded) so the customer sees progress right away — the crew still needs
  // to finish the after-photos step, so resume there rather than the job detail
  // page, which has no action for READY.
  if (job.status === "READY") return `${base}/finish`;
  if (job.status === "NEEDS_HELP") return base;
  if (job.status === "STALE") return base;
  return base;
}

function formatCountdown(ms: number): string {
  const totalSecs = Math.max(0, Math.ceil(ms / 1000));
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function CrewHomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const noResume = searchParams.get("noResume") === "true";
  const queryClient = useQueryClient();
  const {
    claimNextJob,
    rejectJob,
    requestWait,
    cancelWait,
    waitUntil,
    job,
    isLoading,
    isJobLoading,
    hasNoJob,
    error,
    isNewlyClaimed,
  } = useNextJob();
  const { count, hasJob } = useJobQueue();
  const statsQuery = useCrewMonthlyStats();
  const { t } = useTranslation("crew");

  const [preview, setPreview] = useState<JobPreview | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { permission } = usePushNotification({
    type: "crew",
  });
  const pushEnabled = process.env.NEXT_PUBLIC_PUSH_ENABLED === "true";

  useEffect(() => {
    if (!job || noResume) return;
    if (isNewlyClaimed) {
      router.replace(`/crew/jobs/${job.id}`);
    } else {
      router.replace(getResumeTarget(job));
    }
  }, [job, isNewlyClaimed, noResume, router]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const countdown = useMemo(() => {
    if (!waitUntil) return "";
    const remaining = waitUntil - now;
    if (remaining <= 0) return "";
    return formatCountdown(remaining);
  }, [waitUntil, now]);

  useEffect(() => {
    if (!waitUntil) {
      if (countdownRef.current) clearInterval(countdownRef.current);
      return;
    }
    countdownRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [waitUntil]);

  async function openPreviewModal() {
    setIsPreviewing(true);
    try {
      const p = await previewNextJob();
      if (p) {
        setPreview(p);
      } else {
        toast(t("home.jobTakenByOther"), { icon: "⚠️" });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.crew.queue(),
        });
      }
    } finally {
      setIsPreviewing(false);
    }
  }

  async function handleAccept() {
    // Claim exactly the previewed booking so the crew never ends up assigned
    // to a different job than the one shown in the modal.
    const claimed = await claimNextJob(preview?.id);
    setPreview(null);
    if (claimed) {
      router.push(`/crew/jobs/${claimed.id}`);
    } else {
      toast(t("home.jobTakenByOther"), { icon: "⚠️" });
      void queryClient.invalidateQueries({ queryKey: queryKeys.crew.queue() });
    }
  }

  async function handleWait(minutes: 10 | 30) {
    if (!preview) return;
    await requestWait(preview.id, minutes);
    setPreview(null);
  }

  async function handleReject(reason: RejectionReason, note?: string) {
    if (!preview) return;
    await rejectJob(preview.id, reason, note);
    setPreview(null);
    void queryClient.invalidateQueries({ queryKey: queryKeys.crew.queue() });
  }

  const isWaiting = waitUntil !== null;
  const claimBusy = isLoading || isPreviewing;

  function renderMainContent() {
    // Crew still holds an active (claimed) job — let them resume it instead of
    // hiding it. The auto-redirect above is suppressed by noResume, so without
    // this card the job would be unreachable from home.
    if (job) {
      return (
        <div className='w-full space-y-4'>
          <div className='flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-5'>
            <p className='text-xs font-semibold uppercase tracking-widest text-primary'>
              {t("home.activeJobLabel", { defaultValue: "Job aktif kamu" })}
            </p>
            <p className='font-mono text-2xl font-bold tracking-widest text-foreground'>
              {job.plateText}
            </p>
            <Button
              size='lg'
              className='h-14 w-full rounded-xl text-base font-bold'
              suffix={<ArrowRight className='h-5 w-5' />}
              onClick={() => router.replace(getResumeTarget(job))}
            >
              {t("home.resumeJob", { defaultValue: "Lanjutkan job" })}
            </Button>
          </div>
        </div>
      );
    }

    if (hasNoJob && !hasJob && !isWaiting) {
      return (
        <EmptyState
          title={t("home.emptyTitle")}
          description={t("home.emptyDescription")}
          action={
            <Button
              variant='outline'
              size='lg'
              onClick={openPreviewModal}
              prefix={<Inbox className='h-4 w-4' />}
            >
              {t("action.retry", { ns: "common" })}
            </Button>
          }
        />
      );
    }

    if (isWaiting) {
      return (
        <div className='w-full space-y-4'>
          <div className='flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/30 p-6'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
              <Clock className='h-6 w-6 text-primary' />
            </div>
            <p className='text-sm font-semibold text-foreground'>
              {t("job.incomingModal.waitingTitle")}
            </p>
            <p className='font-mono text-3xl font-bold tabular-nums text-primary'>
              {countdown}
            </p>
            <p className='text-center text-xs text-muted-foreground'>
              {t("job.incomingModal.waitingDesc")}
            </p>
          </div>
          <Button
            size='lg'
            className='h-14 w-full rounded-xl text-base font-bold'
            onClick={openPreviewModal}
            disabled={claimBusy}
          >
            {claimBusy && <Loader2 className='h-5 w-5 animate-spin' />}
            {t("job.incomingModal.claimNow")}
          </Button>
          <button
            type='button'
            className='w-full text-center text-sm text-muted-foreground underline-offset-2 hover:underline'
            onClick={cancelWait}
          >
            {t("job.incomingModal.cancelWait")}
          </button>
        </div>
      );
    }

    return (
      <div className='w-full space-y-3'>
        <Button
          size='lg'
          variant='default'
          className={cn(
            "h-16 w-full rounded-xl text-base font-extrabold tracking-wide shadow-[0_24px_30px_rgba(29,177,241,0.16)]",
            "bg-linear-to-b from-[#1db1f1] to-[#006289] hover:from-[#19a0d8] hover:to-[#005070]",
            claimBusy && "opacity-80",
          )}
          disabled={claimBusy}
          onClick={openPreviewModal}
          aria-label={t("home.claimAriaLabel")}
        >
          {claimBusy ? (
            <>
              <Loader2 className='h-5 w-5 animate-spin' />
              {t("home.searching")}
            </>
          ) : (
            <>
              {t("home.claimButton")}
              <ArrowRight className='h-5 w-5' />
            </>
          )}
        </Button>

        {!claimBusy && (
          <p className='text-center text-xs text-muted-foreground'>
            {hasJob
              ? t("home.claimHintReady", {
                  defaultValue: "Tap to claim the next available job",
                })
              : t("home.claimHint")}
          </p>
        )}
      </div>
    );
  }

  // Hold the "claim a job" shell off-screen until the active-job fetch
  // resolves — otherwise a crew who already has an active job briefly sees
  // the empty-home UI flash before the redirect effect above kicks in.
  if (isJobLoading) {
    return (
      <main className='flex min-h-[calc(100dvh-44px)] items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' aria-label={t("job.loading")} />
      </main>
    );
  }

  return (
    <main className='mx-auto flex min-h-[calc(100dvh-44px)] max-w-md flex-col px-4 pb-8 pt-6'>
      {/* "Penugasan Baru!" banner — shown when jobs are available and crew has no active job */}
      {hasJob && !job && (
        <div className='mb-4 rounded-2xl border border-sky-200 bg-linear-to-r from-white to-sky-50 p-4 dark:border-sky-800 dark:from-card dark:to-sky-950/30'>
          <div className='flex items-center gap-3'>
            <div className='relative shrink-0'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
                <Car className='h-6 w-6 text-primary' />
              </div>
              {count > 0 && (
                <span className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-extrabold text-white'>
                  {count}
                </span>
              )}
            </div>
            <div>
              <p className='font-bold text-destructive'>Penugasan Baru!</p>
              <p className='text-sm text-muted-foreground'>
                Tersedia dan siap diambil sekarang.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Monthly stats widget */}
      {statsQuery.data && (
        <div className='mb-4 overflow-hidden rounded-2xl border border-border bg-card'>
          <div className='flex items-center gap-2 border-b border-border px-4 py-3'>
            <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10'>
              <Car className='h-4 w-4 text-primary' />
            </div>
            <span className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
              {new Date().toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <div className='grid grid-cols-3 divide-x divide-border pt-5 pb-7'>
            <div className='flex flex-col items-center gap-2 px-2'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10'>
                <Star className='h-5 w-5 text-primary' />
              </div>
              <span className='text-lg font-bold'>
                {statsQuery.data.avgRating === null
                  ? "—"
                  : statsQuery.data.avgRating.toFixed(1)}
              </span>
              <span className='text-xs text-muted-foreground'>Rating</span>
            </div>
            <div className='flex flex-col items-center gap-2 px-2'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30'>
                <Wallet className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
              </div>
              <span className='text-base font-bold'>
                Rp {statsQuery.data.tips.amount.toLocaleString("id-ID")}
              </span>
              <span className='text-xs text-muted-foreground'>
                Tip ({statsQuery.data.tips.count})
              </span>
            </div>
            <div className='flex flex-col items-center gap-2 px-2'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10'>
                <BriefcaseBusiness className='h-5 w-5 text-primary' />
              </div>
              <span className='text-lg font-bold'>
                {statsQuery.data.jobsCompleted}
              </span>
              <span className='text-xs text-muted-foreground'>Job Selesai</span>
            </div>
          </div>
        </div>
      )}

      {pushEnabled && permission !== "unsupported" && (
        <div className='mb-4 rounded-2xl border border-border bg-card p-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10'>
              {permission === "denied" ? (
                <BellOff className='h-5 w-5 text-muted-foreground' />
              ) : (
                <Bell className='h-5 w-5 text-primary' />
              )}
            </div>
            <div className='min-w-0 flex-1'>
              <p className='font-bold text-foreground'>
                {permission === "granted"
                  ? t("home.notifGranted")
                  : t("home.notifTitle")}
              </p>
              <p className='text-xs text-muted-foreground'>
                {permission === "granted" && t("home.notifGrantedDescription")}
                {permission === "denied" && t("home.notifDeniedDescription")}
                {permission === "default" && t("home.notifDescription")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Queue header card */}
      <div className='mb-4 rounded-2xl border border-border bg-card p-4'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10'>
            <BriefcaseBusiness className='h-5 w-5 text-primary' />
          </div>
          <div>
            <p className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground'>
              {t("home.queueLabel")}
            </p>
            <h1 className='text-base font-bold leading-tight text-foreground'>
              {t("home.readyTitle")}
            </h1>
          </div>
        </div>
      </div>

      <div className='flex flex-1 flex-col items-center justify-center gap-6'>
        {renderMainContent()}
      </div>

      {preview && (
        <IncomingJobModal
          open={true}
          preview={preview}
          onAccept={handleAccept}
          onWait={handleWait}
          onReject={handleReject}
          onClose={() => setPreview(null)}
        />
      )}
    </main>
  );
}

export default CrewHomePage;
