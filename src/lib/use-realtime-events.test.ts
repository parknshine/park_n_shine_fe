import { describe, it, expect } from "bun:test";
import { appendSinceId } from "./use-realtime-events";

describe("appendSinceId", () => {
  it("returns the url unchanged when there is no prior event id", () => {
    expect(appendSinceId("https://api.example.com/v1/admin/realtime/stream?token=abc", null)).toBe(
      "https://api.example.com/v1/admin/realtime/stream?token=abc",
    );
  });

  it("appends sinceId with & when the url already has a query string", () => {
    expect(appendSinceId("https://api.example.com/v1/admin/realtime/stream?token=abc", "1700000000000-0")).toBe(
      "https://api.example.com/v1/admin/realtime/stream?token=abc&sinceId=1700000000000-0",
    );
  });

  it("appends sinceId with ? when the url has no query string", () => {
    expect(appendSinceId("https://api.example.com/v1/realtime/stream", "1700000000000-0")).toBe(
      "https://api.example.com/v1/realtime/stream?sinceId=1700000000000-0",
    );
  });

  it("URL-encodes the sinceId", () => {
    expect(appendSinceId("https://api.example.com/stream", "1700000000000-0 weird")).toBe(
      "https://api.example.com/stream?sinceId=1700000000000-0%20weird",
    );
  });
});
