import { describe, it, expect } from "bun:test";
import type { PendingPeriodSummary, PendingSummaryResponse } from "@/features/admin/types/tip";

describe("PendingPeriodSummary shape", () => {
  it("accepts a valid pending period summary", () => {
    const summary: PendingPeriodSummary = {
      period: "2026-06",
      totalPending: 125000,
      tipCount: 5,
      crewCount: 2,
    };
    expect(summary.period).toBe("2026-06");
    expect(summary.totalPending).toBe(125000);
  });
});

describe("PendingSummaryResponse shape", () => {
  it("accepts a response with multiple periods, most recent first", () => {
    const response: PendingSummaryResponse = {
      periods: [
        { period: "2026-07", totalPending: 30000, tipCount: 2, crewCount: 1 },
        { period: "2026-06", totalPending: 125000, tipCount: 5, crewCount: 2 },
      ],
    };
    expect(response.periods).toHaveLength(2);
    expect(response.periods[0]?.period).toBe("2026-07");
  });
});
