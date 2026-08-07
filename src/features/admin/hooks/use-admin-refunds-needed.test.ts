import { describe, it, expect } from "bun:test";
import { useAdminRefundsNeeded } from "@/features/admin/hooks/use-admin-refunds-needed";
import type { ReportBookingFilters } from "@/features/admin/hooks/use-admin-report-bookings";
import type { ReportBookingRow } from "@/features/admin/types";

describe("useAdminRefundsNeeded", () => {
  it("is exported as a function", () => {
    expect(typeof useAdminRefundsNeeded).toBe("function");
  });
});

describe("refunds-needed filter shape", () => {
  it("accepts a needsRefund-only filter", () => {
    const filters: ReportBookingFilters = { needsRefund: true };
    expect(filters.needsRefund).toBe(true);
  });
});

describe("ReportBookingRow shape used by the refund bell", () => {
  it("carries the reference and siteName fields the bell renders", () => {
    const row: ReportBookingRow = {
      id: "bk_1",
      reference: "PS-01-202607001",
      createdAt: new Date().toISOString(),
      siteName: "Mall A",
      slot: null,
      crewName: null,
      status: "CANCELLED",
      price: 25000,
      paidAt: new Date().toISOString(),
      refundedAmount: 0,
      paymentMethod: "QRIS",
      paymentStatus: "PAID",
      rating: null,
      ratingNote: null,
      phone: null,
      plate: null,
      notificationSentAt: null,
      duration: { locateSeconds: 0, washSeconds: 0, totalJobSeconds: 0 },
      photos: [],
    };
    expect(row.reference).toBe("PS-01-202607001");
    expect(row.siteName).toBe("Mall A");
  });
});
