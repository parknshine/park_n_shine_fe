import { describe, it, expect, beforeAll } from "bun:test";

// Simulates a browser whose localStorage is full: every setItem throws
// QuotaExceededError. Must be installed before the stores are imported so the
// zustand persist middleware picks it up as `window.localStorage`.
const fullStorage = {
  getItem: () => null,
  setItem: () => {
    throw new DOMException("Quota exceeded", "QuotaExceededError");
  },
  removeItem: () => {},
};

beforeAll(() => {
  (globalThis as unknown as { window: unknown }).window = {
    localStorage: fullStorage,
  };
  (globalThis as unknown as { localStorage: unknown }).localStorage = fullStorage;
});

describe("admin stores when localStorage is full", () => {
  it("ui-store actions do not throw when persist write fails", async () => {
    const { useUIStore } = await import("./ui-store");
    expect(() =>
      useUIStore.getState().setSites([{ id: "s1", name: "Site 1" }]),
    ).not.toThrow();
    expect(useUIStore.getState().sites).toEqual([{ id: "s1", name: "Site 1" }]);
  });

  it("auth-store actions do not throw when persist write fails", async () => {
    const { useAuthStore } = await import("./auth-store");
    expect(() =>
      useAuthStore
        .getState()
        .setUser({ id: "u1", email: "a@b.c", name: "A" } as never, "tok", "admin"),
    ).not.toThrow();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });
});
