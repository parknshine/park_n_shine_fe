"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff, BriefcaseBusiness, CheckCircle2, Clock, Inbox, Loader2, Star, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { useJobQueue, useNextJob, useCrewMonthlyStats } from "@/features/crew/hooks";
import { IncomingJobModal } from "@/features/crew/components";
import { previewNextJob } from "@/features/crew/hooks/use-next-job";
import type { CrewJob, JobPreview, RejectionReason } from "@/features/crew/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";
import { usePushNotification } from "@/lib/use-push-notification";
import { queryKeys } from "@/lib/query-keys";

function getResumeTarget(job: CrewJob): string {
  const base = `/crew/jobs/${job.id}`;
  if (job.status === "ASSIGNED") return base;
  if (job.status === "IN_PROGRESS") {
    const crewKinds = ["front", "back", "left", "right"];
    const hasAllPhotos = crewKinds.every((k) => job.media.some((m) => m.kind === k));
    if (!hasAllPhotos) return `${base}/before-photos`;
    const allDone = job.checklist.length > 0 && job.checklist.every((i) => !!i.completedAt);
    return allDone ? `${base}/finish` : `${base}/checklist`;
  }
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
  const { claimNextJob, rejectJob, requestWait, cancelWait, waitUntil, job, isLoading, hasNoJob, error, isNewlyClaimed } = useNextJob();
  const { count, hasJob } = useJobQueue();
  const statsQuery = useCrewMonthlyStats();
  const { t } = useTranslation("crew");

  const [preview, setPreview] = useState<JobPreview | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { permission, subscribe: subscribePush } = usePushNotification({ type: "crew" });
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
        void queryClient.invalidateQueries({ queryKey: queryKeys.crew.queue() });
      }
    } finally {
      setIsPreviewing(false);
    }
  }

  async function handleAccept() {
    const claimed = await claimNextJob();
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

  async function handleReject(reason: RejectionReason) {
    if (!preview) return;
    await rejectJob(preview.id, reason);
    setPreview(null);
    void queryClient.invalidateQueries({ queryKey: queryKeys.crew.queue() });
  }

  const isWaiting = waitUntil !== null;
  const claimBusy = isLoading || isPreviewing;

  function renderMainContent() {
    if (hasNoJob && !hasJob && !isWaiting) {
      return (
        <EmptyState
          title={t("home.emptyTitle")}
          description={t("home.emptyDescription")}
          action={
            <Button
              variant="outline"
              size="lg"
              onClick={openPreviewModal}
              prefix={<Inbox className="h-4 w-4" />}
            >
              {t("action.retry", { ns: "common" })}
            </Button>
          }
        />
      );
    }

    if (isWaiting) {
      return (
        <div className="w-full space-y-4">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/30 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              {t("job.incomingModal.waitingTitle")}
            </p>
            <p className="font-mono text-3xl font-bold tabular-nums text-primary">
              {countdown}
            </p>
            <p className="text-center text-xs text-muted-foreground">
              {t("job.incomingModal.waitingDesc")}
            </p>
          </div>
          <Button
            size="lg"
            className="h-14 w-full rounded-xl text-base font-bold"
            onClick={openPreviewModal}
            disabled={claimBusy}
          >
            {claimBusy && <Loader2 className="h-5 w-5 animate-spin" />}
            {t("job.incomingModal.claimNow")}
          </Button>
          <button
            className="w-full text-center text-sm text-muted-foreground underline-offset-2 hover:underline"
            onClick={cancelWait}
          >
            {t("job.incomingModal.cancelWait")}
          </button>
        </div>
      );
    }

    const jobCountLabel = count === 1
      ? t("home.jobWaiting_one", { count, defaultValue: `${count} job waiting` })
      : t("home.jobWaiting_other", { count, defaultValue: `${count} jobs waiting` });

    return (
      <div className="w-full space-y-4">
        {hasJob && (
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              {jobCountLabel}
            </span>
          </div>
        )}

        <div className="relative w-full">
          {!claimBusy && hasJob && (
            <span
              className="absolute inset-0 -z-10 animate-pulse rounded-xl bg-primary/20"
              aria-hidden="true"
            />
          )}
          <Button
            size="lg"
            variant="default"
            className={cn(
              "h-16 w-full rounded-xl text-base font-bold tracking-wide",
              claimBusy && "opacity-80"
            )}
            disabled={claimBusy}
            onClick={openPreviewModal}
            aria-label={t("home.claimAriaLabel")}
          >
            {claimBusy ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {t("home.searching")}
              </>
            ) : (
              t("home.claimButton")
            )}
          </Button>
        </div>

        {!claimBusy && (
          <p className="text-center text-xs text-muted-foreground">
            {hasJob
              ? t("home.claimHintReady", { defaultValue: "Tap to claim the next available job" })
              : t("home.claimHint")}
          </p>
        )}
      </div>
    );
  }

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-44px)] max-w-md flex-col px-4 pb-8 pt-10">
      {/* Monthly stats widget */}
      {statsQuery.data && (
        <div className="mb-6 rounded-xl border border-border bg-card px-4 py-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold">
                {statsQuery.data.avgRating === null ? "—" : statsQuery.data.avgRating.toFixed(1)}
              </span>
              <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3" /> Rating
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold">{statsQuery.data.jobsCompleted}</span>
              <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3 w-3" /> Job Selesai
              </span>
            </div>
            <div className="col-span-2 flex flex-col items-center">
              <span className="text-lg font-bold">
                Rp {statsQuery.data.tips.amount.toLocaleString("id-ID")}
              </span>
              <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Wallet className="h-3 w-3" /> Tip ({statsQuery.data.tips.count})
              </span>
            </div>
          </div>
        </div>
      )}

      {pushEnabled && permission !== "unsupported" && (
        <div className={cn(
          "mb-4 rounded-xl border p-4",
          permission === "granted" && "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30",
          permission === "denied" && "border-destructive/20 bg-destructive/5",
          permission === "default" && "border-primary/20 bg-primary/5",
        )}>
          <div className="flex items-start gap-3">
            <div className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
              permission === "granted" && "bg-emerald-100 dark:bg-emerald-900/50",
              permission === "denied" && "bg-destructive/10",
              permission === "default" && "bg-primary/10",
            )}>
              {permission === "granted" && <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
              {permission === "denied" && <BellOff className="h-4 w-4 text-destructive" />}
              {permission === "default" && <Bell className="h-4 w-4 text-primary" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-semibold",
                permission === "granted" && "text-emerald-700 dark:text-emerald-300",
                permission === "denied" && "text-destructive",
                permission === "default" && "text-foreground",
              )}>
                {permission === "granted" && t("home.notifGranted")}
                {permission === "denied" && t("home.notifDenied")}
                {permission === "default" && t("home.notifTitle")}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {permission === "granted" && t("home.notifGrantedDescription")}
                {permission === "denied" && t("home.notifDeniedDescription")}
                {permission === "default" && t("home.notifDescription")}
              </p>
            </div>
          </div>
          {(permission === "default" || permission === "denied") && (
            <Button
              size="sm"
              variant={permission === "denied" ? "outline" : "default"}
              className="mt-3 w-full"
              onClick={subscribePush}
            >
              <Bell className="h-4 w-4" />
              {t("home.notifButton")}
            </Button>
          )}
        </div>
      )}

      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <BriefcaseBusiness className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {t("home.queueLabel")}
          </p>
          <h1 className="text-lg font-bold leading-tight text-foreground">
            {t("home.readyTitle")}
          </h1>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
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
