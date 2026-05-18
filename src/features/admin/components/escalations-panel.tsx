import { AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/shared";
import type { AdminQueueBooking } from "@/features/admin/types";

interface EscalationsPanelProps {
  bookings: AdminQueueBooking[];
  title: string;
}

export function EscalationsPanel({ bookings, title }: EscalationsPanelProps) {
  if (bookings.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-red-700 dark:text-red-300" />
        <h2 className="text-sm font-semibold text-red-900 dark:text-red-100">
          {title}
        </h2>
      </div>
      <div className="space-y-2">
        {bookings.map((booking) => (
          <article
            key={booking.id}
            className="flex items-center justify-between gap-3 rounded-md bg-background p-3"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">
                {booking.plateText ?? booking.id}
              </p>
              <p className="text-xs text-muted-foreground">
                {booking.slotText}
              </p>
            </div>
            <StatusBadge tone="danger">{booking.status}</StatusBadge>
          </article>
        ))}
      </div>
    </section>
  );
}
