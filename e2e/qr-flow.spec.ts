import { test, expect } from "./fixtures";

/**
 * Phase 1 — QR code booking flow E2E.
 *
 * IMPORTANT: unlike customer-flow.spec.ts (which is backend-independent), these
 * tests require a running backend. The frontend resolves `/q/:qrId` by calling
 * the API's `GET /v1/qr/:qrId` server-side; without the API the page always
 * falls back to the "invalid QR" state. Run with:
 *
 *   cd park-n-shine-api && bun run docker:up && bun run db:setup && bun run dev
 *   # then in another terminal:
 *   cd park_n_shine && bun run test:e2e qr-flow.spec.ts
 *
 * Seed data used (from prisma/seed.ts):
 *   - valid open QR:   cmqkbrr92000081k8z9niqt24  → site "Mall awdawdawd", open
 *   - rotated QR:      qr_001                       → API returns QR_ROTATED (treated as invalid)
 *   - unknown QR:      nonexistent                  → 404 (invalid)
 *
 * Locale is pinned to EN by setLocale in each test so QR copy is deterministic
 * (the QR surfaces use EN-leaning copy like "Book a Wash").
 */

// ── i18n copy anchors (EN) ──────────────────────────────────────────────────
// QrErrorState / QrBlockingMessage copy (src/locales/en/customer.json → qr.*)
const QR_CANNOT_PROCEED = /Cannot Proceed/i;
const QR_INVALID_MSG = /invalid or has expired/i;
const QR_PAST_CUTOFF_MSG = /Bookings for today are closed/i;
const QR_PAUSED_MSG = /temporarily closed/i;

// QR landing hero renders the resolved site name in a pill.
const BOOK_A_WASH = /Book a Wash/i;

// Seed-fixture QR IDs (kept as consts so a seed change only edits one place).
const VALID_OPEN_QR = "cmqkbrr92000081k8z9niqt24";
const ROTATED_QR = "qr_001";
const UNKNOWN_QR = "does-not-exist-zzz";

test.describe("QR flow", () => {
  test.beforeEach(async ({ setLocale }) => {
    // QR surfaces lean EN ("Book a Wash", "Cannot Proceed"). Pin it.
    await setLocale("en");
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 1. Valid, open QR → booking hero + site name + Book a Wash button
  // ───────────────────────────────────────────────────────────────────────────
  test("valid open QR renders the site hero and Book a Wash button", async ({
    page,
  }) => {
    const response = await page.goto(`/q/${VALID_OPEN_QR}`);
    expect(response?.status()).toBeLessThan(500);

    // Hero shows the resolved site name in a pill.
    await expect(
      page.getByText("Mall awdawdawd", { exact: true }),
    ).toBeVisible();

    // Book a Wash CTA is rendered (not a blocking message).
    await expect(page.getByRole("button", { name: BOOK_A_WASH })).toBeVisible();

    // No error/blocking copy should appear for an open site.
    await expect(page.getByText(QR_CANNOT_PROCEED)).toHaveCount(0);
    await expect(page.getByText(QR_PAST_CUTOFF_MSG)).toHaveCount(0);
  });

  test("valid QR page title reflects the site", async ({ page }) => {
    await page.goto(`/q/${VALID_OPEN_QR}`);
    // generateMetadata builds `Book at ${siteName}`.
    await expect(page).toHaveTitle(/Book at Mall awdawdawd/i);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 2. Rotated QR → invalid/error state
  // ───────────────────────────────────────────────────────────────────────────
  test("rotated QR shows the invalid QR error state", async ({ page }) => {
    // The API returns QR_ROTATED for qr_001; the page treats any non-success as
    // null resolution → QrErrorState reason='invalid'.
    const response = await page.goto(`/q/${ROTATED_QR}`);
    expect(response?.status()).toBeLessThan(500);

    await expect(page.getByText(QR_CANNOT_PROCEED)).toBeVisible();
    await expect(page.getByText(QR_INVALID_MSG)).toBeVisible();

    // No booking CTA for an invalid QR.
    await expect(page.getByRole("button", { name: BOOK_A_WASH })).toHaveCount(
      0,
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 3. Unknown QR (404) → invalid/error state
  // ───────────────────────────────────────────────────────────────────────────
  test("unknown QR shows the invalid QR error state", async ({ page }) => {
    const response = await page.goto(`/q/${UNKNOWN_QR}`);
    expect(response?.status()).toBeLessThan(500);

    await expect(page.getByText(QR_CANNOT_PROCEED)).toBeVisible();
    await expect(page.getByText(QR_INVALID_MSG)).toBeVisible();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 4. Book a Wash opens the modal and guest entry navigates into capture
  // ───────────────────────────────────────────────────────────────────────────
  test("Book a Wash → guest entry navigates to the QR capture page", async ({
    page,
  }) => {
    await page.goto(`/q/${VALID_OPEN_QR}`);
    await page.getByRole("button", { name: BOOK_A_WASH }).click();

    // BookNowModal offers the guest + login options.
    await expect(
      page.getByRole("button", {
        name: /Wash Without Login|Langsung Cuci tanpa Login/i,
      }),
    ).toBeVisible();

    // Guest entry uses captureHref = /q/:qrId/book/capture.
    await page
      .getByRole("button", {
        name: /Wash Without Login|Langsung Cuci tanpa Login/i,
      })
      .click();

    await page.waitForURL(new RegExp(`/q/${VALID_OPEN_QR}/book/capture`));
    await expect(page).toHaveURL(
      new RegExp(`/q/${VALID_OPEN_QR}/book/capture`),
    );
  });

  test("Book a Wash → login entry navigates to login with QR-capture redirect", async ({
    page,
  }) => {
    await page.goto(`/q/${VALID_OPEN_QR}`);
    await page.getByRole("button", { name: BOOK_A_WASH }).click();
    await page
      .getByRole("button", { name: /Continue with Login|Lanjut dengan Login/i })
      .click();

    // Redirect target encodes the QR capture path.
    await expect(page).toHaveURL(/\/login\?redirect=/);
    await expect(page).toHaveURL(
      new RegExp(
        `redirect=${encodeURIComponent(`/q/${VALID_OPEN_QR}/book/capture`)}`,
      ),
    );
  });
});
