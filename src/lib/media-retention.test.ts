import { describe, it, expect } from "bun:test";
import { isMediaLikelyPurged, MEDIA_RETENTION_DAYS } from "./media-retention";

describe("isMediaLikelyPurged", () => {
  it("returns false for a booking created well within the retention window", () => {
    const createdAt = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    expect(isMediaLikelyPurged(createdAt)).toBe(false);
  });

  it("returns true for a booking older than the retention window", () => {
    const createdAt = new Date(
      Date.now() - (MEDIA_RETENTION_DAYS + 1) * 24 * 60 * 60 * 1000,
    ).toISOString();
    expect(isMediaLikelyPurged(createdAt)).toBe(true);
  });

  it("returns false right at the boundary (not yet purged)", () => {
    const createdAt = new Date(
      Date.now() - (MEDIA_RETENTION_DAYS - 1) * 24 * 60 * 60 * 1000,
    ).toISOString();
    expect(isMediaLikelyPurged(createdAt)).toBe(false);
  });
});
