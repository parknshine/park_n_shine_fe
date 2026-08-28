"use client";

import { StatusBadge } from "@/components/shared";
import {
  BOOKING_STATUS_TONES,
  type BookingStatus,
} from "@/features/customer/types";
import type { AdminQueueBooking } from "@/features/admin/types";
import { useTranslation } from "@/i18n";

interface AdminQueueGroupProps {
  status: BookingStatus;
  bookings: AdminQueueBooking[];
  onBookingClick?: (booking: AdminQueueBooking) => void;
}

export function AdminQueueGroup({
  status,
  bookings,
  onBookingClick,
}: Readonly<AdminQueueGroupProps>) {
  const { t } = useTranslation("admin");

  function formatElapsed(seconds: number): string {
    if (seconds < 60) return t("queueGroup.seconds", { n: seconds });
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return t("queueGroup.minutes", { n: minutes });
    return t("queueGroup.hours", {
      h: Math.floor(minutes / 60),
      m: minutes % 60,
    });
  }

  return (
    <section className='rounded-lg border border-border'>
      <header className='flex items-center justify-between gap-3 border-b border-border p-4'>
        <StatusBadge tone={BOOKING_STATUS_TONES[status]}>{status}</StatusBadge>
        <span className='text-sm font-semibold text-muted-foreground'>
          {bookings.length}
        </span>
      </header>
      <div className='divide-y divide-border'>
        {bookings.map((booking) => (
          <article
            key={booking.id}
            onClick={() => onBookingClick?.(booking)}
            className={`grid gap-2 p-4 text-sm md:grid-cols-[1fr_1fr_auto] ${
              onBookingClick
                ? "cursor-pointer hover:bg-muted/50 transition-colors"
                : ""
            }`}
          >
            <div>
              <p className='font-semibold text-foreground'>
                {booking.plateText ?? booking.id}
              </p>
              <p className='text-muted-foreground'>{booking.slotText}</p>
            </div>
            <div className='flex items-center gap-2'>
              <p className='text-muted-foreground'>
                {booking.crewName ?? t("queueGroup.unassigned")}
              </p>
              {(booking.rejectionCount ?? 0) > 0 && (
                <span className='inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive'>
                  {booking.rejectionCount}× rejected
                </span>
              )}
            </div>
            <p className='font-mono text-xs text-muted-foreground'>
              {booking.elapsedSeconds != null
                ? formatElapsed(booking.elapsedSeconds)
                : "—"}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
