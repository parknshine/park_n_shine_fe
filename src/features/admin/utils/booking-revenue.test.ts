import { describe, expect, test } from "bun:test";
import { bookingRevenue } from "./booking-revenue";

describe("bookingRevenue", () => {
  test("a normal closed booking counts its full price", () => {
    expect(bookingRevenue({ status: "CLOSED", price: 50000, refundedAmount: 0 })).toBe(50000);
  });

  test("a refunded booking still counts its original price as revenue", () => {
    // The customer paid, so the +price belongs in revenue; the refund is
    // subtracted separately so Net (revenue - refunded) nets back out.
    expect(bookingRevenue({ status: "CANCELLED", price: 50000, refundedAmount: 50000 })).toBe(50000);
  });

  test("a refunded booking that stayed CLOSED still counts its price", () => {
    expect(bookingRevenue({ status: "CLOSED", price: 50000, refundedAmount: 50000 })).toBe(50000);
  });

  test("a partially refunded booking counts its full original price", () => {
    expect(bookingRevenue({ status: "CLOSED", price: 50000, refundedAmount: 20000 })).toBe(50000);
  });

  test("a never-paid cancelled booking contributes zero", () => {
    expect(bookingRevenue({ status: "CANCELLED", price: 50000, refundedAmount: 0 })).toBe(0);
  });

  test("an expired booking contributes zero", () => {
    expect(bookingRevenue({ status: "EXPIRED", price: 50000, refundedAmount: 0 })).toBe(0);
  });
});
