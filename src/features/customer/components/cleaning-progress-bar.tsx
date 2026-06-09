"use client";

import { useEffect, useMemo, useState } from "react";
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

function calcProgress(startedAt: string, avgMinutes: number, completedSteps: number): number {
  if (completedSteps >= TOTAL_STEPS) return 100;

  const elapsed = Date.now() - new Date(startedAt).getTime();
  const total = avgMinutes * 60 * 1000;
  const rawTimePercent = Math.max(0, (elapsed / total) * 100);

  const milestonePercent = (completedSteps / TOTAL_STEPS) * 100;
  const nextMilestonePercent = ((completedSteps + 1) / TOTAL_STEPS) * 100;
  const timeCapped = Math.min(rawTimePercent, nextMilestonePercent - 1);

  return Math.round(Math.max(milestonePercent, timeCapped));
}

export function CleaningProgressBar({
  startedAt,
  avgMinutes,
  completedSteps,
  estimatedReadyAt,
}: Readonly<CleaningProgressBarProps>) {
  const { t } = useTranslation("customer");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const progress = useMemo(
    () => calcProgress(startedAt, avgMinutes, completedSteps),
    [startedAt, avgMinutes, completedSteps, tick]
  );

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
