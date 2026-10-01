import { describe, it, expect } from "bun:test";
import {
  publicSiteOptionLabel,
  resolveBookingDisplayPrice,
} from "./use-public-sites";

describe("publicSiteOptionLabel", () => {
  const base = {
    id: "s1",
    name: "Site A",
    address: "Addr",
    intakePaused: false,
    cutoffTime: null as string | null,
  };

  it("appends resolved price when present", () => {
    expect(publicSiteOptionLabel({ ...base, price: 88000 }, "")).toBe(
      "Site A — Rp 88.000",
    );
  });

  it("omits price suffix when absent", () => {
    expect(publicSiteOptionLabel(base, " (closed)")).toBe("Site A (closed)");
  });
});

describe("resolveBookingDisplayPrice", () => {
  it("prefers the site override over the draft booking price", () => {
    expect(resolveBookingDisplayPrice({ price: 88000 }, 50000)).toBe(88000);
  });

  it("falls back to the booking price when the site has no resolved price", () => {
    expect(resolveBookingDisplayPrice({ price: undefined }, 50000)).toBe(50000);
    expect(resolveBookingDisplayPrice(undefined, 50000)).toBe(50000);
  });
});
