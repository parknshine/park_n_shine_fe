"use client";

import {
  Car,
  CheckCircle2,
  CreditCard,
  Droplets,
  Loader2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";
import { StatusBadge } from "@/components/shared";
import {
  BOOKING_STATUS_TONES,
  BOOKING_STATUSES,
  type BookingStatus,
} from "@/features/customer/types";

// Statuses that are internal / transitional — shown as a neutral loading state
// instead of displaying a confusing label to the customer.
const TRANSITIONAL_STATUSES = new Set<BookingStatus>(["DRAFT", "STALE"]);

interface StatusHeroProps {
  status: BookingStatus;
  plate?: string | null;
  slot?: string | null;
}

const STATUS_LABEL_KEYS: Record<BookingStatus, string> = {
  DRAFT: "booking.status.draft",
  PENDING: "booking.status.pending",
  PAID: "booking.status.paid",
  ASSIGNED: "booking.status.assigned",
  IN_PROGRESS: "booking.status.in_progress",
  READY: "booking.status.ready",
  CLOSED: "booking.status.closed",
  EXPIRED: "booking.status.expired",
  CANCELLED: "booking.status.cancelled",
  NEEDS_HELP: "booking.status.needs_help",
  STALE: "booking.status.stale",
  LOCATED: "booking.status.located",
};

function StatusIcon({ status }: Readonly<{ status: BookingStatus }>) {
  const base = "h-10 w-10";
  if (status === BOOKING_STATUSES.READY || status === BOOKING_STATUSES.CLOSED) {
    return <CheckCircle2 className={cn(base, "text-primary")} />;
  }
  if (
    status === BOOKING_STATUSES.IN_PROGRESS ||
    status === BOOKING_STATUSES.ASSIGNED
  ) {
    return <Droplets className={cn(base, "text-primary")} />;
  }
  if (status === BOOKING_STATUSES.PENDING) {
    return <CreditCard className={cn(base, "text-primary")} />;
  }
  if (
    status === BOOKING_STATUSES.EXPIRED ||
    status === BOOKING_STATUSES.CANCELLED ||
    status === BOOKING_STATUSES.NEEDS_HELP
  ) {
    return <XCircle className={cn(base, "text-destructive")} />;
  }
  return <Car className={cn(base, "text-muted-foreground")} />;
}

export function StatusHero({ status, plate, slot }: StatusHeroProps) {
  const { t } = useTranslation("customer");

  // DRAFT / STALE are internal states — render a neutral loading indicator
  // so the customer never sees a confusing badge flash by.
  if (TRANSITIONAL_STATUSES.has(status)) {
    return (
      <div className='space-y-4 text-center'>
        <div className='mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted'>
          <Loader2 className='h-10 w-10 animate-spin text-muted-foreground' />
        </div>
        <p className='text-sm text-muted-foreground'>
          {t("status.preparing", { defaultValue: "Preparing your booking…" })}
        </p>
      </div>
    );
  }

  const isActive =
    status === BOOKING_STATUSES.ASSIGNED ||
    status === BOOKING_STATUSES.IN_PROGRESS;
  const isReady = status === BOOKING_STATUSES.READY;

  return (
    <div className='space-y-4 text-center'>
      <div
        className={cn(
          "mx-auto flex h-24 w-24 items-center justify-center rounded-full",
          isReady && "bg-primary/10",
          isActive && "animate-pulse bg-primary/10",
          !isReady && !isActive && "bg-muted",
        )}
      >
        <StatusIcon status={status} />
      </div>

      <StatusBadge tone={BOOKING_STATUS_TONES[status]}>
        {t(STATUS_LABEL_KEYS[status])}
      </StatusBadge>

      {(plate || slot) && (
        <div className='flex justify-center gap-4 text-sm text-muted-foreground'>
          {plate && (
            <span className='font-mono font-semibold uppercase'>{plate}</span>
          )}
          {slot && <span>Slot {slot}</span>}
        </div>
      )}
    </div>
  );
}
