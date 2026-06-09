"use client";

import { useCallback, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff, BriefcaseBusiness, CheckCircle2, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { useJobQueue, useNextJob } from "@/features/crew/hooks";
import type { CrewJob } from "@/features/crew/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";
import { useRealtimeEvents, getCrewIdFromToken } from "@/lib/use-realtime-events";
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

export function CrewHomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const noResume = searchParams.get("noResume") === "true";
  const queryClient = useQueryClient();
  const { claimNextJob, job, isLoading, hasNoJob, error, isNewlyClaimed } = useNextJob();
  const { count, hasJob } = useJobQueue();
  const { t } = useTranslation("crew");

  const crewId = useMemo(() => getCrewIdFromToken(), []);
  const { permission, subscribe: subscribePush } = usePushNotification({ type: "crew" });
  const pushEnabled = process.env.NEXT_PUBLIC_PUSH_ENABLED === "true";
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  const getSseUrl = useCallback(() => {
    const token = localStorage.getItem("crew-token") ?? "";
    return crewId ? `${baseUrl}/v1/crew/realtime/stream?token=${token}` : "";
  }, [baseUrl, crewId]);

  useRealtimeEvents({
    url: getSseUrl,
    enabled: !!crewId,
    onEvent: (event) => {
      if (event.type === "job_assigned" || event.type === "new_job") {
        void queryClient.invalidateQueries({ queryKey: queryKeys.crew.queue() });
        const msg = event.type === "new_job"
          ? t("home.newJobQueued", { defaultValue: "New job available in queue!" })
          : t("home.newJobNotification", { defaultValue: "New job assigned to you!" });
        toast.success(msg);
      }
    },
  });

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

  async function handleClaim() {
    const claimed = await claimNextJob();
    if (claimed) {
      router.push(`/crew/jobs/${claimed.id}`);
    } else {
      toast(t("home.jobTakenByOther"), {
        icon: "⚠️",
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.crew.queue() });
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-44px)] max-w-md flex-col px-4 pb-8 pt-10">
      {/* Push notification card */}
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

      {/* Section header */}
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

      {/* Main action area */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        {hasNoJob && !hasJob ? (
          <EmptyState
            title={t("home.emptyTitle")}
            description={t("home.emptyDescription")}
            action={
              <Button
                variant="outline"
                size="lg"
                onClick={handleClaim}
                prefix={<Inbox className="h-4 w-4" />}
              >
                {t("action.retry", { ns: "common" })}
              </Button>
            }
          />
        ) : (
          <div className="w-full space-y-4">
            {/* Live job count badge */}
            {hasJob && (
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  {count === 1
                    ? t("home.jobWaiting_one", { count, defaultValue: `${count} job waiting` })
                    : t("home.jobWaiting_other", { count, defaultValue: `${count} jobs waiting` })}
                </span>
              </div>
            )}

            {/* Pulse ring behind the button when idle */}
            <div className="relative w-full">
              {!isLoading && hasJob && (
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
                  isLoading && "opacity-80"
                )}
                disabled={isLoading}
                onClick={handleClaim}
                aria-label={t("home.claimAriaLabel")}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t("home.searching")}
                  </>
                ) : (
                  t("home.claimButton")
                )}
              </Button>
            </div>

            {/* Hint text */}
            {!isLoading && (
              <p className="text-center text-xs text-muted-foreground">
                {hasJob
                  ? t("home.claimHintReady", { defaultValue: "Tap to claim the next available job" })
                  : t("home.claimHint")}
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default CrewHomePage;
