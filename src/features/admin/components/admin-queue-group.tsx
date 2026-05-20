import { StatusBadge } from "@/components/shared";
import {
  BOOKING_STATUS_TONES,
  type BookingStatus,
} from "@/features/customer/types";
import type { AdminQueueBooking } from "@/features/admin/types";

interface AdminQueueGroupProps {
  status: BookingStatus;
  bookings: AdminQueueBooking[];
  onBookingClick?: (booking: AdminQueueBooking) => void;
}

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}d`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}j ${minutes % 60}m`;
}

export function AdminQueueGroup({
  status,
  bookings,
  onBookingClick,
}: AdminQueueGroupProps) {
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
            onClick={() => onBookingClick?.(booking)}
            className={`grid gap-2 p-4 text-sm md:grid-cols-[1fr_1fr_auto] ${
              onBookingClick ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""
            }`}
          >
            <div>
              <p className="font-semibold text-foreground">
                {booking.plateText ?? booking.id}
              </p>
              <p className="text-muted-foreground">{booking.slotText}</p>
            </div>
            <p className="text-muted-foreground">{booking.crewName ?? "—"}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {formatElapsed(booking.elapsedSeconds)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
