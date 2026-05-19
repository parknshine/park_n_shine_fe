"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, Clock, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { useCrewJob } from "@/features/crew/hooks";
import { BOOKING_STATUS_TONES } from "@/features/customer/types";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

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

const PHOTO_KIND_LABELS: Record<string, string> = {
  plate: "Plat",
  slot: "Slot",
  before: "Sebelum",
  after: "Sesudah",
};

// ---------------------------------------------------------------------------
// ETA Countdown
// ---------------------------------------------------------------------------

interface EtaCountdownProps {
  etaEndsAt: string;
}

function EtaCountdown({ etaEndsAt }: EtaCountdownProps) {
  const [remaining, setRemaining] = useState<number>(() =>
    Math.max(0, new Date(etaEndsAt).getTime() - Date.now())
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function tick() {
      const ms = Math.max(0, new Date(etaEndsAt).getTime() - Date.now());
      setRemaining(ms);
      if (ms <= 0 && intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [etaEndsAt]);

  const isWarning = remaining > 0 && remaining < 5 * 60 * 1000;
  const isDone = remaining <= 0;

  return (
    <section
      className={cn(
        "rounded-xl border px-5 py-4 transition-colors",
        isDone
          ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40"
          : isWarning
            ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40"
            : "border-border bg-muted/40"
      )}
      aria-live="polite"
      aria-label={`Sisa waktu: ${formatCountdown(remaining)}`}
    >
      <div className="mb-1.5 flex items-center gap-1.5">
        <Clock
          className={cn(
            "h-3.5 w-3.5",
            isDone
              ? "text-red-500"
              : isWarning
                ? "text-amber-500"
                : "text-muted-foreground"
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-widest",
            isDone
              ? "text-red-500"
              : isWarning
                ? "text-amber-600 dark:text-amber-400"
                : "text-muted-foreground"
          )}
        >
          Sisa Waktu
        </span>
      </div>

      <p
        className={cn(
          "font-mono text-4xl font-bold tabular-nums leading-none tracking-tight",
          isDone
            ? "text-red-600 dark:text-red-400"
            : isWarning
              ? "text-amber-700 dark:text-amber-300"
              : "text-foreground"
        )}
      >
        {formatCountdown(remaining)}
      </p>

      {isDone && (
        <p className="mt-1.5 text-xs font-medium text-red-500">
          Waktu habis
        </p>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function CrewJobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const { job, isLoading, error } = useCrewJob(jobId);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <main className="flex min-h-[calc(100dvh-44px)] items-center justify-center">
        <Loader2
          className="h-8 w-8 animate-spin text-muted-foreground"
          aria-label="Memuat data job"
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
            Job tidak ditemukan
          </p>
          <p className="text-sm text-muted-foreground">
            Job ini mungkin sudah selesai atau tidak tersedia.
          </p>
        </div>
        <Button
          variant="outline"
          size="md"
          onClick={() => router.replace("/crew/home")}
        >
          Kembali ke Antrian
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
          onClick={() => router.replace("/crew/home")}
          prefix={<ChevronLeft className="h-4 w-4" />}
          className="-ml-2 mb-4 text-muted-foreground"
          aria-label="Kembali ke antrian"
        >
          Antrian
        </Button>

        {/* ── Job header card ─────────────────────────────────────────── */}
        <section className="mb-4 overflow-hidden rounded-2xl border border-border">

          {/* Plate reader panel */}
          <div className="flex flex-col items-center gap-2 bg-zinc-900 px-6 py-6">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Nomor Plat
            </span>
            <p
              className="font-mono text-4xl font-extrabold tracking-[0.15em] text-white"
              aria-label={`Nomor plat: ${job.plateText}`}
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
              <span className="font-medium">Ditugaskan:</span>{" "}
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
              Foto Kendaraan
            </p>
            <div
              className="flex gap-3 overflow-x-auto pb-1"
              role="list"
              aria-label="Foto kendaraan pelanggan"
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
                      alt={`Foto ${PHOTO_KIND_LABELS[photo.kind] ?? photo.kind} kendaraan`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <figcaption className="mt-1 text-center text-[10px] font-medium text-muted-foreground">
                    {PHOTO_KIND_LABELS[photo.kind] ?? photo.kind}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ── Sticky CTA ──────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background px-4 pb-[env(safe-area-inset-bottom,16px)] pt-3">
        <div className="mx-auto max-w-md">
          <Button
            size="lg"
            variant="default"
            className="h-14 w-full rounded-xl text-base font-bold"
            onClick={() => router.push(`/crew/jobs/${jobId}/verify`)}
            suffix={<ArrowRight className="h-5 w-5" />}
            aria-label="Verifikasi plat kendaraan"
          >
            Verifikasi Plat
          </Button>
        </div>
      </div>
    </>
  );
}

export default CrewJobDetailPage;
