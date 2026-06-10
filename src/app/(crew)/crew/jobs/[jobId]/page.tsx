"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, HelpCircle, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { useQueryClient } from "@tanstack/react-query";
import { useCrewJob } from "@/features/crew/hooks";
import { EtaCountdown, NeedsHelpModal } from "@/features/crew";
import { BOOKING_STATUS_TONES } from "@/features/customer/types";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatAssignedAt(raw?: string | null): string {
  if (!raw) return "—";
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(raw));
  } catch {
    return raw;
  }
}

// ---------------------------------------------------------------------------
// ETA Countdown
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function CrewJobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { job, isLoading, error } = useCrewJob(jobId);
  const { t } = useTranslation("crew");

  const [helpModalOpen, setHelpModalOpen] = useState(false);

  function goBackToQueue() {
    queryClient.removeQueries({ queryKey: queryKeys.crew.nextJob() });
    router.replace("/crew/home?noResume=true");
  }

  async function handleHelpSuccess() {
    setHelpModalOpen(false);
    await queryClient.invalidateQueries({ queryKey: queryKeys.crew.job(jobId) });
  }


  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <main className="flex min-h-[calc(100dvh-44px)] items-center justify-center">
        <Loader2
          className="h-8 w-8 animate-spin text-muted-foreground"
          aria-label={t("job.loading")}
        />
      </main>
    );
  }

  // ── Error / not found ────────────────────────────────────────────────────
  if (error || !job) {
    return (
      <main className="mx-auto flex min-h-[calc(100dvh-44px)] max-w-md flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <MapPin className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground">
            {t("job.notFoundTitle")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("job.notFoundDescription")}
          </p>
        </div>
        <Button
          variant="outline"
          size="md"
          onClick={goBackToQueue}
        >
          {t("job.backToQueue")}
        </Button>
      </main>
    );
  }

  // ── Derived values ───────────────────────────────────────────────────────
  const statusTone = BOOKING_STATUS_TONES[job.status] ?? "neutral";
  const customerPhotos = job.media.filter(
    (m) => m.kind === "plate" || m.kind === "slot"
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Scrollable body — leave room for sticky CTA (~88px) */}
      <main className="mx-auto max-w-md px-4 pb-28 pt-4">

        {/* Back nav */}
        <Button
          variant="ghost"
          size="sm"
          onClick={goBackToQueue}
          prefix={<ChevronLeft className="h-4 w-4" />}
          className="-ml-2 mb-4 text-muted-foreground"
          aria-label={t("job.backAriaLabel")}
        >
          {t("job.queueNav")}
        </Button>

        {/* ── Job header card ─────────────────────────────────────────── */}
        <section className="mb-4 overflow-hidden rounded-2xl border border-border">

          {/* Plate reader panel */}
          <div className="flex flex-col items-center gap-2 bg-zinc-900 px-6 py-6">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              {t("job.plateNumber")}
            </span>
            <p
              className="font-mono text-4xl font-extrabold tracking-[0.15em] text-white"
              aria-label={`${t("job.plateNumber")}: ${job.plateText}`}
            >
              {job.plateText}
            </p>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-background px-4 py-3.5">
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-semibold text-foreground">
                {job.slotText}
              </span>
            </div>
            <StatusBadge tone={statusTone}>{job.status}</StatusBadge>
          </div>

          {/* Assigned timestamp */}
          <div className="border-t border-border px-4 py-2.5">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">{t("job.assignedAt")}:</span>{" "}
              {formatAssignedAt(job.assignedAt)}
            </p>
          </div>
        </section>

        {/* ── ETA countdown ───────────────────────────────────────────── */}
        {job.etaEndsAt ? (
          <div className="mb-4">
            <EtaCountdown etaEndsAt={job.etaEndsAt} />
          </div>
        ) : null}

        {/* ── Customer photos strip ────────────────────────────────────── */}
        {customerPhotos.length > 0 && (
          <section className="mb-4">
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t("job.vehiclePhotos")}
            </p>
            <div
              className="flex gap-3 overflow-x-auto pb-1"
              role="list"
              aria-label={t("job.vehiclePhotosAriaLabel")}
            >
              {customerPhotos.map((photo) => (
                <figure
                  key={photo.id}
                  className="shrink-0"
                  role="listitem"
                >
                  <div className="h-20 w-20 overflow-hidden rounded-xl border border-border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={t("job.photoAlt", { kind: t(`job.photoKind.${photo.kind}`, { defaultValue: photo.kind }) })}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <figcaption className="mt-1 text-center text-[10px] font-medium text-muted-foreground">
                    {t(`job.photoKind.${photo.kind}`, { defaultValue: photo.kind })}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {job.status === "NEEDS_HELP" && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/40">
            <div className="mb-1 flex items-center gap-2">
              <HelpCircle
                className="h-4 w-4 text-amber-600 dark:text-amber-400"
                aria-hidden="true"
              />
              <span className="font-semibold text-amber-700 dark:text-amber-300">
                {t("needsHelp.waitingBannerTitle")}
              </span>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {t("needsHelp.waitingBannerDesc")}
            </p>
          </div>
        )}
      </main>

      {/* ── Sticky CTA ──────────────────────────────────────────────────── */}
      {job.status !== "NEEDS_HELP" && (
      <div className="fixed bottom-5 left-0 right-0 z-30 border-t border-border bg-background px-4 pb-[env(safe-area-inset-bottom,16px)] pt-3">
        <div className="mx-auto max-w-md">
          {job.status === "ASSIGNED" && (
            <div className="flex flex-col gap-2">
              <Button
                size="lg"
                variant="default"
                className="h-14 w-full rounded-xl text-base font-bold"
                onClick={() => router.push(`/crew/jobs/${jobId}/verify`)}
                suffix={<ArrowRight className="h-5 w-5" />}
                aria-label={t("job.verifyAriaLabel")}
              >
                {t("job.verifyButton")}
              </Button>
              <Button
                size="md"
                variant="outline"
                className="w-full rounded-xl border-amber-400 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-950/40"
                prefix={<HelpCircle className="h-4 w-4" />}
                onClick={() => setHelpModalOpen(true)}
              >
                {t("needsHelp.button")}
              </Button>
            </div>
          )}
          {job.status === "LOCATED" && (
            <div className="flex flex-col gap-2">
              <Button
                size="lg"
                variant="default"
                className="h-14 w-full rounded-xl text-base font-bold"
                onClick={() => router.push(`/crew/jobs/${jobId}/before-photos`)}
                suffix={<ArrowRight className="h-5 w-5" />}
                aria-label={t("job.continueToPhotos")}
              >
                {t("job.continueToPhotos")}
              </Button>
              <Button
                size="md"
                variant="outline"
                className="w-full rounded-xl border-amber-400 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-950/40"
                prefix={<HelpCircle className="h-4 w-4" />}
                onClick={() => setHelpModalOpen(true)}
              >
                {t("needsHelp.button")}
              </Button>
            </div>
          )}
          {job.status === "IN_PROGRESS" && (
            <div className="flex flex-col gap-2">
              <Button
                size="lg"
                variant="default"
                className="h-14 w-full rounded-xl text-base font-bold"
                onClick={() => router.push(`/crew/jobs/${jobId}/checklist`)}
                suffix={<ArrowRight className="h-5 w-5" />}
              >
                {t("job.viewChecklist")}
              </Button>
            </div>
          )}
        </div>
      </div>
      )}
      <NeedsHelpModal
        open={helpModalOpen}
        jobId={jobId}
        onClose={() => setHelpModalOpen(false)}
        onSuccess={handleHelpSuccess}
      />
    </>
  );
}

export default CrewJobDetailPage;
