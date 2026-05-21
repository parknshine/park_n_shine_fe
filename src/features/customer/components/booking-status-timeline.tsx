"use client";

import { useTranslation } from "@/i18n";
import { StatusBadge } from "@/components/shared";
import {
  BOOKING_STATUS_TONES,
  type BookingStatusEvent,
} from "@/features/customer/types";

interface BookingStatusTimelineProps {
  events: BookingStatusEvent[];
}

export function BookingStatusTimeline({ events }: BookingStatusTimelineProps) {
  const { t } = useTranslation("customer");

  return (
    <ol className="space-y-3">
      {events.map((event) => (
        <li
          key={`${event.status}-${event.changedAt}`}
          className="border-b border-border pb-3 last:border-b-0 last:pb-0"
        >
          <div className="min-w-0">
            <StatusBadge tone={BOOKING_STATUS_TONES[event.status]}>
              {t(event.labelKey)}
            </StatusBadge>
            <p className="mt-1 text-xs text-muted-foreground">
              {event.changedAt}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
