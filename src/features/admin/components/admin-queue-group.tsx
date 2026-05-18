import { StatusBadge } from "@/components/shared";
import {
  BOOKING_STATUS_TONES,
  type BookingStatus,
} from "@/features/customer/types";
import type { AdminQueueBooking } from "@/features/admin/types";

interface AdminQueueGroupProps {
  status: BookingStatus;
  bookings: AdminQueueBooking[];
}

export function AdminQueueGroup({ status, bookings }: AdminQueueGroupProps) {
  return (
    <section className="rounded-lg border border-border">
      <header className="flex items-center justify-between gap-3 border-b border-border p-4">
        <StatusBadge tone={BOOKING_STATUS_TONES[status]}>{status}</StatusBadge>
        <span className="text-sm font-semibold text-muted-foreground">
          {bookings.length}
        </span>
      </header>
      <div className="divide-y divide-border">
        {bookings.map((booking) => (
          <article
            key={booking.id}
            className="grid gap-2 p-4 text-sm md:grid-cols-[1fr_1fr_auto]"
          >
            <div>
              <p className="font-semibold text-foreground">
                {booking.plateText ?? booking.id}
              </p>
              <p className="text-muted-foreground">{booking.slotText}</p>
            </div>
            <p className="text-muted-foreground">{booking.crewName}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {booking.elapsedSeconds}s
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
