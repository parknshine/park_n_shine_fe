"use client";

import { Check, Clock, Loader2, X } from "lucide-react";
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
  isRefunded?: boolean;
}

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

// Builds the status → formatted-timestamp map used by the stepper. Fallbacks
// backfill a timestamp from the nearest earlier step when a step's own
// transition wasn't recorded (e.g. older bookings), but only for steps
// already reached — a step still in the future must never show a time.
export function buildStepTimestamps(
  status: BookingStatus,
  statusHistory: BookingStatusEvent[],
): Map<BookingStatus, string> {
  const currentStep = STATUS_STEP[status] ?? 0;
  const isTerminal =
    status === "EXPIRED" || status === "CANCELLED" || status === "CLOSED";

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

  STEPS.forEach((step, index) => {
    const stepIndex = index + 1;
    const isDone =
      currentStep > stepIndex ||
      (step.status === "CLOSED" && isTerminal && status === "CLOSED");
    const isActive = currentStep === stepIndex && !isTerminal;
    if (!isDone && !isActive) {
      timestampMap.delete(step.status);
    }
  });

  return timestampMap;
}

function stepConnectorClass(isDone: boolean, isTerminalNonClosed: boolean): string {
  if (isDone) return "bg-green-600";
  if (isTerminalNonClosed) return "bg-[#f8e5e0]";
  return "bg-muted";
}

function stepDotClass(
  isDone: boolean,
  isActive: boolean,
  isTerminalNonClosed: boolean,
): string {
  if (isDone) return "border-green-600 bg-green-600 text-white";
  if (isActive) return "border-primary bg-primary/10 text-primary";
  if (isTerminalNonClosed) return "border-[#f8e5e0] bg-white text-muted-foreground/50";
  return "border-muted bg-background text-muted-foreground";
}

function terminalDescKey(status: BookingStatus, isRefunded: boolean): string {
  if (status === "EXPIRED") return "status.expiredMessage";
  if (isRefunded) return "status.refundedMessage";
  return "status.cancelledMessage";
}

function terminalLabelKey(
  status: BookingStatus,
  isRefunded: boolean,
): string {
  if (status === "EXPIRED") return "booking.stepper.expired.label";
  if (isRefunded) return "booking.stepper.cancelled_refunded.label";
  return "booking.stepper.cancelled.label";
}

export function BookingStatusTimeline({
  status,
  statusHistory = [],
  isRefunded = false,
}: Readonly<BookingStatusTimelineProps>) {
  const { t } = useTranslation("customer");

  const currentStep = STATUS_STEP[status] ?? 0;
  const isTerminal =
    status === "EXPIRED" || status === "CANCELLED" || status === "CLOSED";
  const isTerminalNonClosed = status === "CANCELLED" || status === "EXPIRED";

  const timestampMap = buildStepTimestamps(status, statusHistory);

  const terminalIsDestructive = !isRefunded;
  const terminalDotClass = terminalIsDestructive
    ? "border-destructive bg-destructive/10 text-destructive"
    : "border-[#f7481f] bg-[#fff0ed] text-[#f7481f]";
  const terminalTextClass = terminalIsDestructive ? "text-destructive" : "text-[#f7481f]";

  return (
    <ol aria-label='Booking progress'>
      {/* Terminal step for CANCELLED / EXPIRED — sole entry, no further steps follow */}
      {isTerminalNonClosed && (
        <li className='flex gap-3'>
          <div className='flex flex-col items-center'>
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                terminalDotClass,
              )}
            >
              <X className='h-4 w-4' aria-hidden />
            </div>
          </div>
          <div className='pt-0.5 min-w-0'>
            <p
              className={cn(
                "text-sm font-semibold leading-tight",
                terminalTextClass,
              )}
            >
              {t(terminalLabelKey(status, isRefunded))}
            </p>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              {t(terminalDescKey(status, isRefunded))}
            </p>
          </div>
        </li>
      )}

      {!isTerminalNonClosed &&
        STEPS.map((step, index) => {
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
                    stepDotClass(isDone, isActive, isTerminalNonClosed),
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
                      stepConnectorClass(isDone, isTerminalNonClosed),
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
