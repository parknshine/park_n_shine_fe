"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

export function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

interface EtaCountdownProps {
  etaEndsAt: string;
  compact?: boolean;
}

export function EtaCountdown({ etaEndsAt, compact = false }: EtaCountdownProps) {
  const { t } = useTranslation("crew");
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
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, [etaEndsAt]);

  const isWarning = remaining > 0 && remaining < 5 * 60 * 1000;
  const isDone = remaining <= 0;

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tabular-nums transition-colors",
          isDone
            ? "border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400"
            : isWarning
              ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400"
              : "border-border bg-muted/60 text-foreground"
        )}
        aria-live="polite"
        aria-label={t("job.timeAriaLabel", { time: formatCountdown(remaining) })}
      >
        <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span className="font-mono">{formatCountdown(remaining)}</span>
      </div>
    );
  }

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
      aria-label={t("job.timeAriaLabel", { time: formatCountdown(remaining) })}
    >
      <div className="mb-1.5 flex items-center gap-1.5">
        <Clock
          className={cn(
            "h-3.5 w-3.5",
            isDone ? "text-red-500" : isWarning ? "text-amber-500" : "text-muted-foreground"
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
          {t("job.timeRemaining")}
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
          {t("job.timeExpired")}
        </p>
      )}
    </section>
  );
}
