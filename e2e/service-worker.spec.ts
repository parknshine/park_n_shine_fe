import { test, expect } from "./fixtures";

/**
 * Service worker registration smoke test.
 *
 * Confirms PwaProvider registers exactly one service worker at root scope,
 * so push notifications work on both customer and crew routes. Regression
 * guard for the June 2026 incident where registration was disabled entirely.
 */
test.describe("Service worker registration", () => {
  test("registers a single service worker at scope '/'", async ({ page }) => {
    await page.goto("/");

    await page.waitForFunction(async () => {
      const regs = await navigator.serviceWorker.getRegistrations();
      return regs.length > 0;
    }, { timeout: 15_000 });

    const scopes = await page.evaluate(async () => {
      const regs = await navigator.serviceWorker.getRegistrations();
      return regs.map((r) => r.scope);
    });

    expect(scopes).toHaveLength(1);
    expect(new URL(scopes[0]).pathname).toBe("/");
  });
});
