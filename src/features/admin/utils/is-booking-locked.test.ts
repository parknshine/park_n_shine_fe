import { describe, expect, test } from "bun:test";
import { isBookingLocked } from "./is-booking-locked";

describe("isBookingLocked", () => {
  test("CANCELLED is locked regardless of refund", () => {
    expect(isBookingLocked({ status: "CANCELLED" })).toBe(true);
    expect(isBookingLocked({ status: "CANCELLED", refundedAmount: 0 })).toBe(true);
  });

  test("any refunded booking is locked", () => {
    expect(isBookingLocked({ status: "CLOSED", refundedAmount: 50000 })).toBe(true);
    expect(isBookingLocked({ status: "EXPIRED", refundedAmount: 1 })).toBe(true);
  });

  test("EXPIRED but not refunded stays unlocked", () => {
    expect(isBookingLocked({ status: "EXPIRED", refundedAmount: 0 })).toBe(false);
    expect(isBookingLocked({ status: "EXPIRED" })).toBe(false);
  });

  test("active/paid/closed unrefunded bookings stay unlocked", () => {
    expect(isBookingLocked({ status: "PAID" })).toBe(false);
    expect(isBookingLocked({ status: "READY", refundedAmount: 0 })).toBe(false);
    expect(isBookingLocked({ status: "CLOSED" })).toBe(false);
  });

  test("undefined refundedAmount is treated as zero", () => {
    expect(isBookingLocked({ status: "CLOSED" })).toBe(false);
  });
});
