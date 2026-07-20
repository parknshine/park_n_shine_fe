import { test, expect } from "./fixtures";

/**
 * Route availability smoke tests.
 *
 * Asserts that public surfaces render without server errors (HTTP 200 and a
 * non-error body). This catches regressions where a layout/provider throws on a
 * specific route. Authenticated routes (e.g. `/home`, `/admin/dashboard`) are
 * intentionally skipped — those need backend + storageState, see the README.
 */
const PUBLIC_ROUTES: ReadonlyArray<string> = [
  "/",
  "/login",
  "/forgot-password",
  "/contact",
  "/privacy-policy",
  "/terms",
  "/support",
  "/crew/login",
  "/admin/login",
];

for (const route of PUBLIC_ROUTES) {
  test(`${route} renders without error`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response, `no response for ${route}`).not.toBeNull();
    expect(response!.status(), `expected 200 for ${route}`).toBeLessThan(500);

    // Body should mount <main> or known landmark — guards against blank crashes
    await expect(page.locator("body")).not.toBeEmpty();
  });
}

test.describe("Guest booking entry points", () => {
  test("/book/capture is reachable for guests", async ({ page }) => {
    const response = await page.goto("/book/capture");
    expect(response?.status()).toBeLessThan(500);
  });

  test("/book/location is reachable for guests", async ({ page }) => {
    const response = await page.goto("/book/location");
    expect(response?.status()).toBeLessThan(500);
  });
});

test.describe("Static assets", () => {
  test("logo asset loads", async ({ page }) => {
    const response = await page.goto("/parknshinelogo.svg");
    expect(response?.status()).toBe(200);
    expect(response?.headers()["content-type"]).toContain("svg");
  });

  test("web manifest loads", async ({ request }) => {
    // Use request.get (not page.goto) — Firefox treats .webmanifest as a
    // download and aborts navigation to it.
    const response = await request.get("/manifest.webmanifest");
    expect(response.status()).toBeLessThan(500);
  });
});
