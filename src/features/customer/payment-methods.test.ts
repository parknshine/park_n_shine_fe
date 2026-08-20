import { describe, it, expect } from "bun:test";
import { PAYMENT_CATEGORIES, filterEnabledPaymentCategories } from "./payment-methods";

describe("filterEnabledPaymentCategories", () => {
  it("keeps only methods present in the enabled codes list", () => {
    const result = filterEnabledPaymentCategories(PAYMENT_CATEGORIES, ["GOPAY"]);

    expect(result).toHaveLength(1);
    expect(result[0].label).toBe("E-Wallet");
    expect(result[0].methods.map((m) => m.code)).toEqual(["GOPAY"]);
  });

  it("drops a category entirely when none of its methods are enabled", () => {
    const result = filterEnabledPaymentCategories(PAYMENT_CATEGORIES, [
      "SHOPEEPAY",
      "GOPAY",
    ]);

    expect(result.map((c) => c.label)).toEqual(["E-Wallet"]);
  });

  it("keeps all categories when every method is enabled", () => {
    const result = filterEnabledPaymentCategories(PAYMENT_CATEGORIES, [
      "QRIS",
      "SHOPEEPAY",
      "GOPAY",
    ]);

    expect(result).toEqual(PAYMENT_CATEGORIES);
  });
});
