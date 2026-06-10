"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n";

const TOTAL_STEPS = 5;

interface CleaningProgressBarProps {
  startedAt: string;
  avgMinutes: number;
  completedSteps: number;
  estimatedReadyAt?: string | null;
}

function formatLocalTime(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
}

function calcProgress(startedAt: string, avgMinutes: number, completedSteps: number, now: number): number {
  if (completedSteps >= TOTAL_STEPS) return 100;

  const elapsed = now - new Date(startedAt).getTime();
  const total = avgMinutes * 60 * 1000;
  const rawTimePercent = Math.max(0, Math.min(99, (elapsed / total) * 100));

  const milestonePercent = (completedSteps / TOTAL_STEPS) * 100;

  return Math.round(Math.max(milestonePercent, rawTimePercent));
}

export function CleaningProgressBar({
  startedAt,
  avgMinutes,
  completedSteps,
  estimatedReadyAt,
}: Readonly<CleaningProgressBarProps>) {
  const { t } = useTranslation("customer");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(id);
  }, []);

  const progress = calcProgress(startedAt, avgMinutes, completedSteps, now);

  return (
    <div className="rounded-2xl border border-border px-4 py-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">
          {t("status.washingProgress")}
        </p>
        <p className="text-sm font-bold text-primary">
          {t("status.progressPercent", { percent: progress })}
        </p>
      </div>

      <progress
        className={`h-2.5 w-full overflow-hidden rounded-full bg-muted [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-500 [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:transition-all [&::-moz-progress-bar]:duration-500 ${progress >= 100 ? "[&::-webkit-progress-value]:bg-green-500 [&::-moz-progress-bar]:bg-green-500" : "[&::-webkit-progress-value]:bg-blue-500 [&::-moz-progress-bar]:bg-blue-500"}`}
        value={progress}
        max={100}
      />

      {estimatedReadyAt && (
        <p className="text-xs text-muted-foreground">
          {t("status.estReadyAt", { time: formatLocalTime(estimatedReadyAt) })}
        </p>
      )}
    </div>
  );
}
