import { describe, expect, it, mock } from "bun:test";
import { invalidatePaymentQueries } from "./realtime-invalidations";
import type { RealtimeEvent } from "@/lib/use-realtime-events";

function makeFakeQueryClient() {
  const invalidateQueries = mock(async () => {});
  return {
    client: { invalidateQueries },
    invalidatedKeys: () =>
      invalidateQueries.mock.calls.map((c) => (c[0] as { queryKey: readonly unknown[] }).queryKey),
  };
}

describe("invalidatePaymentQueries", () => {
  it("invalidates report, report-bookings, queue, and booking detail on payment_confirmed", () => {
    const { client, invalidatedKeys } = makeFakeQueryClient();
    const event: RealtimeEvent = { type: "payment_confirmed", bookingId: "booking_1", status: "PAID", ts: 1 };

    invalidatePaymentQueries(client, event);

    const keys = invalidatedKeys();
    expect(keys).toContainEqual(["admin", "report"]);
    expect(keys).toContainEqual(["admin", "report-bookings"]);
    expect(keys).toContainEqual(["admin", "queue"]);
    expect(keys).toContainEqual(["admin", "booking", "booking_1"]);
  });

  it("invalidates the same queries on booking_status_changed", () => {
    const { client, invalidatedKeys } = makeFakeQueryClient();
    const event: RealtimeEvent = { type: "booking_status_changed", bookingId: "booking_2", status: "CLOSED", ts: 1 };

    invalidatePaymentQueries(client, event);

    const keys = invalidatedKeys();
    expect(keys).toContainEqual(["admin", "report"]);
    expect(keys).toContainEqual(["admin", "report-bookings"]);
    expect(keys).toContainEqual(["admin", "queue"]);
    expect(keys).toContainEqual(["admin", "booking", "booking_2"]);
  });

  it("skips the booking detail key when the event has no bookingId", () => {
    const { client, invalidatedKeys } = makeFakeQueryClient();
    const event: RealtimeEvent = { type: "payment_confirmed", ts: 1 };

    invalidatePaymentQueries(client, event);

    const keys = invalidatedKeys();
    expect(keys).toContainEqual(["admin", "report"]);
    expect(keys.some((k) => k[1] === "booking")).toBe(false);
  });

  it("does nothing for unrelated event types", () => {
    const { client, invalidatedKeys } = makeFakeQueryClient();
    const event: RealtimeEvent = { type: "new_job", bookingId: "booking_1", ts: 1 };

    invalidatePaymentQueries(client, event);

    expect(invalidatedKeys()).toHaveLength(0);
  });
});
