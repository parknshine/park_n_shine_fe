import { defineConfig, devices } from "@playwright/test";

/**
 * Park & Shine — Playwright E2E config.
 *
 * Next.js dev server is auto-started on :3000 by the `webServer` block below;
 * you can also run `bun run dev` in another terminal and Playwright will reuse it.
 *
 * Run all:        bun run test:e2e
 * UI mode:        bun run test:e2e:ui
 * Single project: bunx playwright test --project=mobile-safari
 *
 * Docs: https://playwright.dev/docs/test-configuration
 */
// Dedicated port so E2E never clashes with a developer's own `next dev` on :3000.
const E2E_PORT = Number(process.env.E2E_PORT ?? 3100);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${E2E_PORT}`;
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./test-results/output",

  // Each .spec.ts is independent; fail fast on broken setup.
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 4 : undefined,

  reporter: isCI
    ? [["html", { open: "never" }], ["list"]]
    : [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],

  expect: {
    // Tighter than default 5s — surfaces real flakiness in dev.
    timeout: 5_000,
  },

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    locale: "en-US",
    timezoneId: "Asia/Jakarta",
  },

  projects: [
    // ── Desktop browsers ────────────────────────────────────────────────────
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "desktop-firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "desktop-webkit",
      use: { ...devices["Desktop Safari"] },
    },

    // ── Mobile — this is a mobile-first PWA, so these matter ────────────────
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 14"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
    },
  ],

  // ── Auto-start Next.js dev server ──────────────────────────────────────────
  // Boots an isolated server on :3100 so it never collides with a developer's
  // own `next dev` on :3000. This project has no staging environment, so tests
  // always run against a locally-booted dev server (here in dev, or on the CI
  // runner). Set E2E_BASE_URL only if you want to reuse an already-running server.
  webServer: {
    command: `bun run dev -- --port ${E2E_PORT}`,
    url: BASE_URL,
    reuseExistingServer: !isCI,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      // Backend the frontend should proxy to. Defaults to the local API server.
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
      // Push notification soft-ask prompt is gated behind this flag; enable it
      // for E2E so e2e/push-prompt.spec.ts can exercise the dialog.
      NEXT_PUBLIC_PUSH_ENABLED: "true",
    },
  },
});
