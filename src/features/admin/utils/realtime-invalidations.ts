import { queryKeys } from "@/lib/query-keys";
import type { RealtimeEvent } from "@/lib/use-realtime-events";

interface AdminQueryInvalidator {
  invalidateQueries: (filters: { queryKey: readonly unknown[] }) => Promise<void>;
}

const PAYMENT_EVENT_TYPES = new Set(["payment_confirmed", "booking_status_changed"]);

export function invalidatePaymentQueries(queryClient: AdminQueryInvalidator, event: RealtimeEvent): void {
  if (!PAYMENT_EVENT_TYPES.has(event.type)) return;

  void queryClient.invalidateQueries({ queryKey: ["admin", "report"] });
  void queryClient.invalidateQueries({ queryKey: ["admin", "report-bookings"] });
  void queryClient.invalidateQueries({ queryKey: ["admin", "queue"] });
  if (typeof event.bookingId === "string") {
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.booking(event.bookingId) });
  }
}
