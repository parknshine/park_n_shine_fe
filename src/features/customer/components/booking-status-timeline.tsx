"use client";

import { Check, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";
import type { BookingStatus, BookingStatusEvent } from "@/features/customer/types";

interface Step {
  status: BookingStatus;
  labelKey: string;
  descKey: string;
}

const STEPS: Step[] = [
  {
    status: "PENDING",
    labelKey: "booking.stepper.pending.label",
    descKey: "booking.stepper.pending.desc",
  },
  {
    status: "PAID",
    labelKey: "booking.stepper.paid.label",
    descKey: "booking.stepper.paid.desc",
  },
  {
    status: "IN_PROGRESS",
    labelKey: "booking.stepper.in_progress.label",
    descKey: "booking.stepper.in_progress.desc",
  },
  {
    status: "READY",
    labelKey: "booking.stepper.ready.label",
    descKey: "booking.stepper.ready.desc",
  },
  {
    status: "CLOSED",
    labelKey: "booking.stepper.closed.label",
    descKey: "booking.stepper.closed.desc",
  },
];

// Maps each booking status to its step index in the stepper
const STATUS_STEP: Record<BookingStatus, number> = {
  DRAFT:       0,
  PENDING:     1,
  PAID:        2,
  ASSIGNED:    3, // customer sees this as "crew on the way"
  IN_PROGRESS: 3,
  NEEDS_HELP:  3,
  READY:       4,
  CLOSED:      5,
  EXPIRED:     1,
  CANCELLED:   1,
  STALE:       1,
};

interface BookingStatusTimelineProps {
  status: BookingStatus;
  statusHistory?: BookingStatusEvent[];
}

export function BookingStatusTimeline({
  status,
  statusHistory = [],
}: BookingStatusTimelineProps) {
  const { t } = useTranslation("customer");

  const currentStep = STATUS_STEP[status] ?? 0;
  const isTerminal =
    status === "EXPIRED" || status === "CANCELLED" || status === "CLOSED";

  // Build timestamp map from history: status → formatted time
  const timestampMap = new Map<BookingStatus, string>();
  statusHistory.forEach((e) => {
    if (!timestampMap.has(e.status)) {
      timestampMap.set(e.status, e.changedAt);
    }
  });

  // Also map ASSIGNED timestamp to IN_PROGRESS step
  if (!timestampMap.has("IN_PROGRESS") && timestampMap.has("ASSIGNED")) {
    timestampMap.set("IN_PROGRESS", timestampMap.get("ASSIGNED")!);
  }

  return (
    <ol aria-label="Booking progress">
      {STEPS.map((step, index) => {
        const stepIndex = index + 1;
        const isDone = currentStep > stepIndex || (step.status === "CLOSED" && isTerminal && status === "CLOSED");
        const isActive = currentStep === stepIndex && !isTerminal;
        const isFuture = !isDone && !isActive;
        const isLast = index === STEPS.length - 1;
        const timestamp = timestampMap.get(step.status);

        return (
          <li key={step.status} className="flex gap-3">
            {/* Dot + connector line */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  isDone && "border-primary bg-primary text-primary-foreground",
                  isActive &&
                    "border-primary bg-primary/10 text-primary",
                  isFuture &&
                    "border-muted bg-background text-muted-foreground"
                )}
              >
                {isDone ? (
                  <Check className="h-4 w-4" aria-hidden />
                ) : isActive ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Clock className="h-4 w-4 opacity-40" aria-hidden />
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "my-1 w-0.5 flex-1",
                    isDone ? "bg-primary" : "bg-muted"
                  )}
                  style={{ minHeight: 20 }}
                />
              )}
            </div>

            {/* Text */}
            <div className={cn("pb-5 pt-0.5 min-w-0", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-medium leading-tight",
                  isDone && "text-foreground",
                  isActive && "font-semibold text-primary",
                  isFuture && "text-muted-foreground/50"
                )}
              >
                {t(step.labelKey, { defaultValue: step.status })}
              </p>
              <p
                className={cn(
                  "mt-0.5 text-xs",
                  isFuture ? "text-muted-foreground/40" : "text-muted-foreground"
                )}
              >
                {timestamp ?? t(step.descKey, { defaultValue: "" })}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
