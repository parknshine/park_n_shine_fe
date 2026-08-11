import { describe, expect, test } from "bun:test";
import { resolvePayPageAction } from "./pay-page-action";

describe("resolvePayPageAction", () => {
  test("paid-family statuses always redirect to status page", () => {
    for (const status of ["PAID", "ASSIGNED", "IN_PROGRESS", "READY", "CLOSED"] as const) {
      expect(
        resolvePayPageAction({ isSnapMode: true, status, hasPaymentInstructions: false }),
      ).toBe("redirect_status");
      expect(
        resolvePayPageAction({ isSnapMode: false, status, hasPaymentInstructions: true }),
      ).toBe("redirect_status");
    }
  });

  test("PENDING with instructions waits and shows them, regardless of mode", () => {
    expect(
      resolvePayPageAction({ isSnapMode: true, status: "PENDING", hasPaymentInstructions: true }),
    ).toBe("wait");
    expect(
      resolvePayPageAction({ isSnapMode: false, status: "PENDING", hasPaymentInstructions: true }),
    ).toBe("wait");
  });

  test("PENDING without instructions in SNAP mode auto-charges instead of bouncing to payment-method", () => {
    expect(
      resolvePayPageAction({ isSnapMode: true, status: "PENDING", hasPaymentInstructions: false }),
    ).toBe("auto_charge");
  });

  test("PENDING without instructions outside SNAP mode redirects to payment-method", () => {
    expect(
      resolvePayPageAction({ isSnapMode: false, status: "PENDING", hasPaymentInstructions: false }),
    ).toBe("redirect_payment_method");
  });
});
