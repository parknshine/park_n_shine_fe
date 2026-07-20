import { test, expect, type Page } from "./fixtures";

/** True when the active project's viewport is phone-sized. */
async function isMobile(page: Page): Promise<boolean> {
  const size = page.viewportSize();
  return !!size && size.width < 768;
}

/** Opens the hamburger menu on mobile so nav-links become visible. */
async function openMobileNavIfNeeded(page: Page): Promise<void> {
  if (!(await isMobile(page))) return;
  await page
    .getByRole("button", { name: /open navigation|close navigation/i })
    .click();
}

/**
 * Smoke tests for the public marketing landing page (`/`).
 * These run on every browser + mobile project declared in playwright.config.ts.
 *
 * `customerPage` seeds locale=ID up front, so ID copy is asserted by default.
 */
test.describe("Landing page", () => {
  test("renders hero, logo, and primary CTAs", async ({ customerPage: page }) => {
    await expect(page).toHaveTitle(/Park.*Shine/i);

    // Brand wordmark in the topbar
    await expect(page.getByRole("link", { name: /Park.*Shine/i }).first()).toBeVisible();

    // Hero heading exists and is non-empty
    const heroHeading = page.locator("main h1").first();
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).not.toHaveText("");

    // "Book Now" primary CTA (hero) is visible
    const bookNowButtons = page.getByRole("button", { name: /Pesan Sekarang|Book Now/i });
    await expect(bookNowButtons.first()).toBeVisible();
  });

  test("nav exposes Services and Pricing links (desktop) or mobile dock (mobile)", async ({
    customerPage: page,
  }) => {
    // Nav copy: ID "Proses"/"Harga", EN "Process"/"Pricing" (per locales/*/customer.json)
    const services = page.getByRole("link", { name: /^(proses|process)$/i });
    await expect(services.first()).toBeVisible();

    // Pricing only lives in the desktop nav — the mobile dock has Home/Services/Book Now.
    // Skip that assertion on phone viewports.
    test.skip(await isMobile(page), "pricing link is desktop-nav only");
    const pricing = page.getByRole("link", { name: /^(harga|pricing)$/i });
    await expect(pricing.first()).toBeVisible();
  });

  test("language switcher toggles copy between ID and EN", async ({ customerPage: page }) => {
    // Starting state: ID (seeded by the fixture)
    await expect(page.getByRole("link", { name: "Proses" }).first()).toBeVisible();

    // On mobile the language button is inside the hamburger menu — open it first.
    await openMobileNavIfNeeded(page);

    // Open the language dropdown — aria-label is locale-aware ("Ganti bahasa" / "Change language")
    await page.getByRole("button", { name: /ganti bahasa|change language/i }).click();

    // Dropdown options have accessible names "Indonesia ID" / "English EN"
    await page.getByRole("button", { name: "English EN" }).click();

    // Copy should now be English (nav.services = "Process" in EN)
    await expect(page.getByRole("link", { name: "Process" }).first()).toBeVisible();
  });

  test("Book Now CTA opens the booking modal", async ({ customerPage: page }) => {
    await page
      .getByRole("button", { name: /Pesan Sekarang|Book Now/i })
      .first()
      .click();

    // The modal renders two CTAs (no <a> links — they use router.push):
    //   - loginBtn: "Lanjut dengan Login" / "Continue with Login"
    //   - guestBtn: "Langsung Cuci tanpa Login" / "Wash Without Login" (guests only)
    await expect(
      page.getByRole("button", { name: /lanjut dengan login|continue with login/i }),
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: /langsung cuci|wash without login/i }),
    ).toBeVisible();
  });

  test("marketing footer is present at the bottom", async ({ customerPage: page }) => {
    const footer = page.locator("footer").first();
    await expect(footer).toBeVisible();
  });
});
