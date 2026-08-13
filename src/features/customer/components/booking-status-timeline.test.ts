import { describe, it, expect } from "bun:test";
import { buildStepTimestamps } from "./booking-status-timeline";

describe("buildStepTimestamps", () => {
  it("does not show a timestamp for a step that hasn't been reached yet", () => {
    // Crew has only located the vehicle (LOCATED) — washing (IN_PROGRESS)
    // hasn't started, so it must not show a time.
    const statusHistory = [
      { status: "PAID" as const, changedAt: "2026-08-13T10:00:00.000Z", labelKey: "" },
      { status: "ASSIGNED" as const, changedAt: "2026-08-13T10:02:00.000Z", labelKey: "" },
      { status: "LOCATED" as const, changedAt: "2026-08-13T10:18:00.000Z", labelKey: "" },
    ];

    const map = buildStepTimestamps("LOCATED", statusHistory);

    expect(map.has("LOCATED")).toBe(true);
    expect(map.has("IN_PROGRESS")).toBe(false);
    expect(map.has("READY")).toBe(false);
    expect(map.has("CLOSED")).toBe(false);
  });

  it("still shows a timestamp for the current in-progress step", () => {
    const statusHistory = [
      { status: "PAID" as const, changedAt: "2026-08-13T10:00:00.000Z", labelKey: "" },
      { status: "ASSIGNED" as const, changedAt: "2026-08-13T10:02:00.000Z", labelKey: "" },
      { status: "LOCATED" as const, changedAt: "2026-08-13T10:18:00.000Z", labelKey: "" },
    ];

    const map = buildStepTimestamps("LOCATED", statusHistory);

    expect(map.get("PAID")).toBeDefined();
    expect(map.get("ASSIGNED")).toBeDefined();
    expect(map.get("LOCATED")).toBeDefined();
  });
});
