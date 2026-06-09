"use client";

import { Check, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation, i18n } from "@/i18n";
import type {
  BookingStatus,
  BookingStatusEvent,
} from "@/features/customer/types";

interface Step {
  status: BookingStatus;
  labelKey: string;
  descKey: string;
}

const STEPS: Step[] = [
  {
    status: "PAID",
    labelKey: "booking.stepper.pending.label",
    descKey: "booking.stepper.pending.desc",
  },
  {
    status: "ASSIGNED",
    labelKey: "booking.stepper.paid.label",
    descKey: "booking.stepper.paid.desc",
  },
  {
    status: "LOCATED",
    labelKey: "booking.stepper.crew_located.label",
    descKey: "booking.stepper.crew_located.desc",
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
  DRAFT: 0,
  PENDING: 1,
  PAID: 1,
  ASSIGNED: 2,
  LOCATED: 3,
  IN_PROGRESS: 4,
  NEEDS_HELP: 4,
  READY: 5,
  CLOSED: 6,
  EXPIRED: 1,
  CANCELLED: 1,
  STALE: 2,
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

  function formatTimestamp(iso: string): string {
    const locale = i18n.language === "en" ? "en-GB" : "id-ID";
    const d = new Date(iso);
    const date = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
    const time = new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
    return `${date} • ${time}`;
  }

  // Build timestamp map from history: status → formatted time
  const timestampMap = new Map<BookingStatus, string>();
  statusHistory.forEach((e) => {
    if (!timestampMap.has(e.status)) {
      timestampMap.set(e.status, formatTimestamp(e.changedAt));
    }
  });

  // Fallback: show PAID timestamp on ASSIGNED step when ASSIGNED hasn't fired yet
  if (!timestampMap.has("ASSIGNED") && timestampMap.has("PAID")) {
    timestampMap.set("ASSIGNED", timestampMap.get("PAID")!);
  }
  // Fallback: show ASSIGNED timestamp on LOCATED step when LOCATED hasn't fired yet
  if (!timestampMap.has("LOCATED") && timestampMap.has("ASSIGNED")) {
    timestampMap.set("LOCATED", timestampMap.get("ASSIGNED")!);
  }
  // Fallback: show LOCATED timestamp on IN_PROGRESS step when IN_PROGRESS hasn't fired yet
  if (!timestampMap.has("IN_PROGRESS") && timestampMap.has("LOCATED")) {
    timestampMap.set("IN_PROGRESS", timestampMap.get("LOCATED")!);
  }

  return (
    <ol aria-label='Booking progress'>
      {STEPS.map((step, index) => {
        const stepIndex = index + 1;
        const isDone =
          currentStep > stepIndex ||
          (step.status === "CLOSED" && isTerminal && status === "CLOSED");
        const isActive = currentStep === stepIndex && !isTerminal;
        const isFuture = !isDone && !isActive;
        const isLast = index === STEPS.length - 1;
        const timestamp = timestampMap.get(step.status);

        return (
          <li key={step.status} className='flex gap-3'>
            {/* Dot + connector line */}
            <div className='flex flex-col items-center'>
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  isDone && "border-green-600 bg-green-600 text-white",
                  isActive && "border-primary bg-primary/10 text-primary",
                  isFuture &&
                    "border-muted bg-background text-muted-foreground",
                )}
              >
                {isDone ? (
                  <Check className='h-4 w-4' aria-hidden />
                ) : isActive ? (
                  <Loader2 className='h-4 w-4 animate-spin' aria-hidden />
                ) : (
                  <Clock className='h-4 w-4 opacity-40' aria-hidden />
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "my-1 w-0.5 flex-1",
                    isDone ? "bg-green-600" : "bg-muted",
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
                  isDone && "text-green-700",
                  isActive && "font-semibold text-primary",
                  isFuture && "text-muted-foreground/50",
                )}
              >
                {t(step.labelKey, { defaultValue: step.status })}
              </p>
              <p
                className={cn(
                  "mt-0.5 text-xs",
                  isFuture
                    ? "text-muted-foreground/40"
                    : "text-muted-foreground",
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
