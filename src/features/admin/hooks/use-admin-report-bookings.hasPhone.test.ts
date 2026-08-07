import { describe, it, expect } from "bun:test";
import type { ReportBookingFilters } from "@/features/admin/hooks/use-admin-report-bookings";
import type { ReportBookingRow } from "@/features/admin/types";

describe("ReportBookingFilters hasPhone", () => {
  it("accepts a hasPhone-only filter", () => {
    const filters: ReportBookingFilters = { hasPhone: true };
    expect(filters.hasPhone).toBe(true);
  });
});

describe("ReportBookingFilters notificationSent", () => {
  it("accepts a notificationSent-only filter", () => {
    const filters: ReportBookingFilters = { notificationSent: false };
    expect(filters.notificationSent).toBe(false);
  });
});

describe("ReportBookingRow phone/plate fields", () => {
  it("carries phone and plate for the notification-requests bell", () => {
    const row: ReportBookingRow = {
      id: "bk_1",
      reference: "PS-01-202607001",
      createdAt: new Date().toISOString(),
      siteName: "Mall A",
      slot: "A-01",
      crewName: null,
      status: "PAID",
      price: 50000,
      paidAt: new Date().toISOString(),
      refundedAmount: 0,
      paymentMethod: null,
      paymentStatus: "PAID",
      rating: null,
      ratingNote: null,
      duration: { locateSeconds: null, washSeconds: null, totalJobSeconds: null },
      photos: [],
      phone: "081234567890",
      plate: "B 1234 XY",
      notificationSentAt: null,
    };
    expect(row.phone).toBe("081234567890");
    expect(row.plate).toBe("B 1234 XY");
  });
});
