"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCrewJob, useVerifyPlate } from "@/features/crew/hooks";
import { queryKeys } from "@/lib/query-keys";
import { useTranslation } from "@/i18n";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function VerifyPlatePage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation("crew");

  const { job, isLoading: isJobLoading } = useCrewJob(jobId, {
    // Poll every 5s while the job is escalated so the crew UI reflects
    // admin overrides even if SSE is disabled or the connection drops.
    refetchInterval: (query) =>
      query.state.data?.status === "NEEDS_HELP" ? 5_000 : false,
  });
  const { verify, isLoading, error } = useVerifyPlate(jobId);

  // localEscalated gives immediate UI feedback after the crew clicks
  // "not found" — before the job query refetches. isEscalated also
  // accounts for the actual backend status so a page refresh while
  // waiting for admin still shows the escalation card.
  const [localEscalated, setLocalEscalated] = useState(false);
  const isEscalated = localEscalated || job?.status === "NEEDS_HELP";

  // Track whether we've confirmed the job entered NEEDS_HELP. This avoids
  // a race where localEscalated flips true before the refetch lands (job
  // status is still ASSIGNED) and the navigation effect misfires.
  const wasEscalatedRef = useRef(false);

  useEffect(() => {
    if (error && !isEscalated) toast.error(error);
  }, [error, isEscalated]);

  // Navigate the crew forward when admin resolves the escalation. The
  // effect only fires after we've confirmed job.status was NEEDS_HELP
  // (via refetch or SSE invalidation) and has since changed.
  useEffect(() => {
    if (!job) return;

    if (job.status === "NEEDS_HELP") {
      wasEscalatedRef.current = true;
      return;
    }

    if (!wasEscalatedRef.current) return;

    // Admin has resolved the escalation.
    wasEscalatedRef.current = false;

    if (job.status === "ASSIGNED") {
      // Admin reset to ASSIGNED — crew can retry the verify step.
      // Reset local state so the CTA buttons reappear on this page.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalEscalated(false);
      return;
    }
    // For all other statuses (IN_PROGRESS, LOCATED, READY, CLOSED,
    // CANCELLED, EXPIRED), navigate away WITHOUT resetting
    // localEscalated. This keeps the escalation card visible (and the
    // verify CTA hidden) during the navigation, preventing the crew
    // from clicking "Plat Cocok" on a status that no longer accepts
    // verify — which would trigger BOOKING_INVALID_STATUS_TRANSITION.
    if (job.status === "CANCELLED" || job.status === "EXPIRED") {
      router.replace("/crew/home?noResume=true");
      return;
    }
    // LOCATED, IN_PROGRESS, READY, CLOSED — go to job detail which
    // renders the appropriate next-step CTA for each status.
    router.replace(`/crew/jobs/${jobId}`);
  }, [job?.status, job, jobId, router]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isJobLoading || !job) {
    return (
      <main className='flex min-h-[calc(100dvh-44px)] items-center justify-center'>
        <Loader2
          className='h-8 w-8 animate-spin text-muted-foreground'
          aria-label={t("job.loading")}
        />
      </main>
    );
  }

  // ── Derived values ───────────────────────────────────────────────────────
  const plateMedia = job.media.find((m) => m.kind === "plate");

  // ── Handlers ─────────────────────────────────────────────────────────────
  async function handleMatched() {
    try {
      await verify({ result: "matched" });
      router.replace(`/crew/jobs/${jobId}/before-photos`);
    } catch {
      // error state handled by useVerifyPlate
    }
  }

  async function handleNotFound() {
    try {
      await verify({ result: "not_found" });
      setLocalEscalated(true);
      // Invalidate so job.status reflects NEEDS_HELP, keeping the derived
      // isEscalated in sync with the backend and arming the navigation
      // effect (wasEscalatedRef) for when admin later overrides.
      void queryClient.invalidateQueries({
        queryKey: queryKeys.crew.job(jobId),
      });
    } catch {
      // error state handled by useVerifyPlate
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Scrollable body */}
      <main className='mx-auto max-w-md px-4 pb-28 pt-4'>
        {/* Back button */}
        <Button
          variant='ghost'
          size='sm'
          onClick={() => router.replace(`/crew/jobs/${jobId}`)}
          prefix={<ChevronLeft className='h-4 w-4' />}
          className='-ml-2 mb-4 text-muted-foreground'
        >
          {t("action.back", { ns: "common" })}
        </Button>

        {/* Heading */}
        <h1 className='mb-5 text-lg font-semibold text-foreground'>
          {t("verify.title")}
        </h1>

        {/* Plate photo */}
        {plateMedia?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={plateMedia.url}
            alt={t("verify.platePhotoAlt")}
            className='mb-4 h-48 w-full rounded-xl border border-border object-cover'
          />
        ) : (
          <div className='mb-4 flex h-48 items-center justify-center rounded-xl border border-dashed border-border bg-muted'>
            <span className='text-sm text-muted-foreground'>
              {t("verify.plateNotAvailable")}
            </span>
          </div>
        )}

        {/* OCR text */}
        <p className='mb-6 text-center font-mono text-2xl font-bold tracking-widest text-foreground'>
          {job.plateText}
        </p>

        {/* Escalation card */}
        {isEscalated && (
          <div className='mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/40'>
            {/* Header row */}
            <div className='mb-2 flex items-center gap-2'>
              <AlertTriangle
                className='h-4 w-4 text-amber-600 dark:text-amber-400'
                aria-hidden='true'
              />
              <span className='font-semibold text-amber-700 dark:text-amber-300'>
                {t("verify.escalatedTitle")}
              </span>
            </div>

            {/* Body */}
            <p className='mb-4 text-sm text-amber-700 dark:text-amber-300'>
              {t("verify.escalatedDescription")}
            </p>

            {/* Back to queue button — hidden once admin has resolved
                the escalation and we're navigating away. The crew no
                longer needs to manually leave; the redirect handles it. */}
            {job.status === "NEEDS_HELP" && (
              <Button
                variant='outline'
                className='w-full'
                onClick={() => {
                  queryClient.removeQueries({
                    queryKey: queryKeys.crew.nextJob(),
                  });
                  router.replace("/crew/home?noResume=true");
                }}
              >
                {t("verify.backToQueue")}
              </Button>
            )}

            {/* Redirecting indicator — shown when admin has changed the
                status (no longer NEEDS_HELP) but navigation hasn't
                completed yet. Replaces the "Back to Queue" button so the
                crew knows the page is handling the transition. */}
            {job.status !== "NEEDS_HELP" && (
              <div className='flex items-center justify-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300'>
                <Loader2 className='h-4 w-4 animate-spin' />
                {t("verify.redirecting", {
                  defaultValue: "Status updated, redirecting...",
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Sticky CTA — hidden when escalated */}
      {!isEscalated && (
        <div className='fixed bottom-5 left-0 right-0 z-30 border-t border-border bg-background px-4 pb-[env(safe-area-inset-bottom,16px)] pt-3'>
          <div className='mx-auto max-w-md space-y-2'>
            {/* Primary: Plat Cocok */}
            <Button
              size='lg'
              variant='default'
              className='h-14 w-full rounded-xl'
              suffix={
                isLoading ? (
                  <Loader2 className='h-5 w-5 animate-spin' />
                ) : (
                  <ArrowRight className='h-5 w-5' />
                )
              }
              disabled={isLoading}
              onClick={handleMatched}
            >
              {t("verify.matched")}
            </Button>

            {/* Secondary: Tidak Ditemukan */}
            <Button
              size='lg'
              variant='outline'
              className='h-12 w-full rounded-xl border-destructive text-destructive hover:bg-destructive/10'
              disabled={isLoading}
              onClick={handleNotFound}
            >
              {t("verify.notFound")}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default VerifyPlatePage;
