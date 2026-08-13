import { describe, it, expect } from "bun:test";
import { toCustomerStatusHistory } from "./use-booking-status";

describe("toCustomerStatusHistory", () => {
  it("keeps ASSIGNED and LOCATED entries so the customer sees the crew's real accept/locate timestamps", () => {
    const timeline = [
      { status: "PAID" as const, timestamp: "2026-08-13T10:00:00.000Z" },
      { status: "ASSIGNED" as const, timestamp: "2026-08-13T10:02:00.000Z" },
      { status: "LOCATED" as const, timestamp: "2026-08-13T10:05:00.000Z" },
      { status: "IN_PROGRESS" as const, timestamp: "2026-08-13T10:07:00.000Z" },
    ];

    const history = toCustomerStatusHistory(timeline);

    expect(history.map((e) => e.status)).toEqual([
      "PAID",
      "ASSIGNED",
      "LOCATED",
      "IN_PROGRESS",
    ]);
    expect(history.find((e) => e.status === "ASSIGNED")?.changedAt).toBe(
      "2026-08-13T10:02:00.000Z",
    );
    expect(history.find((e) => e.status === "LOCATED")?.changedAt).toBe(
      "2026-08-13T10:05:00.000Z",
    );
  });
});
