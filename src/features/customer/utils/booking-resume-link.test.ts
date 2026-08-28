import { describe, it, expect } from "bun:test";
import {
  resolveBookingResumeHref,
  resolveBookingResumeCtaLabelKey,
} from "./booking-resume-link";

describe("resolveBookingResumeHref", () => {
  it("sends an unpaid (PENDING) booking to the payment page", () => {
    expect(resolveBookingResumeHref("bk_001", "tok_abc", "PENDING")).toBe(
      "/booking/bk_001/pay?token=tok_abc",
    );
  });

  it("sends a paid/in-progress booking to the status page", () => {
    expect(resolveBookingResumeHref("bk_001", "tok_abc", "IN_PROGRESS")).toBe(
      "/booking/bk_001/status?token=tok_abc",
    );
  });

  it("sends a READY booking to the status page", () => {
    expect(resolveBookingResumeHref("bk_001", "tok_abc", "READY")).toBe(
      "/booking/bk_001/status?token=tok_abc",
    );
  });
});

describe("resolveBookingResumeCtaLabelKey", () => {
  it("uses the resume-payment CTA for PENDING", () => {
    expect(resolveBookingResumeCtaLabelKey("PENDING")).toBe(
      "home.resumePaymentCta",
    );
  });

  it("uses the view-status CTA for everything else", () => {
    expect(resolveBookingResumeCtaLabelKey("ASSIGNED")).toBe(
      "home.activeBookingCta",
    );
  });
});
