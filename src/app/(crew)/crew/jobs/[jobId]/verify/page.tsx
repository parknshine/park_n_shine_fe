"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCrewJob, useVerifyPlate } from "@/features/crew/hooks";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function VerifyPlatePage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();

  const { job, isLoading: isJobLoading } = useCrewJob(jobId);
  const { verify, isLoading, error } = useVerifyPlate(jobId);

  const [isEscalated, setIsEscalated] = useState(false);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isJobLoading || !job) {
    return (
      <main className="flex min-h-[calc(100dvh-44px)] items-center justify-center">
        <Loader2
          className="h-8 w-8 animate-spin text-muted-foreground"
          aria-label="Memuat data job"
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
      setIsEscalated(true);
    } catch {
      // error state handled by useVerifyPlate
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Scrollable body */}
      <main className="mx-auto max-w-md px-4 pb-28 pt-4">

        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          prefix={<ChevronLeft className="h-4 w-4" />}
          className="-ml-2 mb-4 text-muted-foreground"
        >
          Kembali
        </Button>

        {/* Heading */}
        <h1 className="mb-5 text-lg font-semibold text-foreground">
          Verifikasi Plat
        </h1>

        {/* Plate photo */}
        {plateMedia?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={plateMedia.url}
            alt="Foto plat kendaraan customer"
            className="mb-4 h-48 w-full rounded-xl border border-border object-cover"
          />
        ) : (
          <div className="mb-4 flex h-48 items-center justify-center rounded-xl border border-dashed border-border bg-muted">
            <span className="text-sm text-muted-foreground">
              Foto plat tidak tersedia
            </span>
          </div>
        )}

        {/* OCR text */}
        <p className="mb-6 text-center font-mono text-2xl font-bold tracking-widest text-foreground">
          {job.plateText}
        </p>

        {/* Inline error */}
        {error && !isEscalated && (
          <p className="mb-4 text-center text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {/* Escalation card */}
        {isEscalated && (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/40">
            {/* Header row */}
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle
                className="h-4 w-4 text-amber-600 dark:text-amber-400"
                aria-hidden="true"
              />
              <span className="font-semibold text-amber-700 dark:text-amber-300">
                Job Dieskalasi
              </span>
            </div>

            {/* Body */}
            <p className="mb-4 text-sm text-amber-700 dark:text-amber-300">
              Plat tidak ditemukan. Supervisor telah diberitahu.
            </p>

            {/* Back to queue button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.replace("/crew/home")}
            >
              Kembali ke Antrian
            </Button>
          </div>
        )}
      </main>

      {/* Sticky CTA — hidden when escalated */}
      {!isEscalated && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background px-4 pb-[env(safe-area-inset-bottom,16px)] pt-3">
          <div className="space-y-2">
            {/* Primary: Plat Cocok */}
            <Button
              size="lg"
              variant="default"
              className="h-14 w-full rounded-xl"
              suffix={
                isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ArrowRight className="h-5 w-5" />
                )
              }
              disabled={isLoading}
              onClick={handleMatched}
            >
              Plat Cocok
            </Button>

            {/* Secondary: Tidak Ditemukan */}
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full rounded-xl border-destructive text-destructive hover:bg-destructive/10"
              disabled={isLoading}
              onClick={handleNotFound}
            >
              Tidak Ditemukan
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default VerifyPlatePage;
