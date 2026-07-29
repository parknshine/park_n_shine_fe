// Playwright script to capture Park & Shine ADMIN CONSOLE screenshots for the
// user manual. Drives the real running app (frontend :3000, backend :3001).
//
// IMPORTANT GOTCHA discovered: the (admin) layout's isAuthenticated check
// races the zustand auth-store persist rehydration on a fresh full page load
// (page.goto to a new admin URL). The very first render sees isAuthenticated
// === false (store not yet rehydrated from localStorage), bounces to
// /admin/login, whose own effect then sees isAuthenticated === true a moment
// later and bounces to /dashboard. Net effect: page.goto("/sites") etc.
// silently lands back on /dashboard. Fix: after the single initial goto +
// real login, do ALL further navigation via client-side <Link> clicks (no
// full reload -> no remount -> no rehydration race).
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const OUT_DIR =
  "/Users/ilhamprasetya/Developer/singabyte/park_n_shine_project/park_n_shine/docs/user-manual/screenshots-admin";
const BASE = "http://localhost:3000";

const results = [];

function shot(name) {
  return path.join(OUT_DIR, name);
}

async function hideDevOverlay(page) {
  await page
    .evaluate(() => {
      const selectors = [
        "nextjs-portal",
        "#__next-build-watcher",
        "[data-nextjs-toast]",
        "[data-nextjs-dev-tools-button]",
      ];
      for (const sel of selectors) {
        document.querySelectorAll(sel).forEach((el) => {
          el.style.display = "none";
        });
      }
    })
    .catch(() => {});
}

// Force-dismiss any lingering overlay/backdrop so subsequent clicks aren't
// blocked. Tries Escape (works for Radix Dialog) plus a forced click on any
// raw backdrop div (the custom booking drawer doesn't bind Escape).
async function dismissOverlays(page) {
  for (let round = 0; round < 4; round++) {
    try {
      await page.keyboard.press("Escape").catch(() => {});
      await page.waitForTimeout(150);
      const backdrops = page.locator("div.fixed.inset-0");
      const n = await backdrops.count();
      if (n === 0) return;
      let clickedAny = false;
      // Click topmost-in-DOM (last) visible overlay first — that's the most
      // recently mounted dialog, which is the one actually intercepting clicks.
      for (let i = n - 1; i >= 0; i--) {
        const el = backdrops.nth(i);
        if (await el.isVisible().catch(() => false)) {
          await el.click({ force: true, timeout: 2000 }).catch(() => {});
          clickedAny = true;
          break;
        }
      }
      await page.waitForTimeout(250);
      if (!clickedAny) return;
    } catch {
      return;
    }
  }
}

async function seedLocale(context) {
  await context.addInitScript(() => {
    window.localStorage.setItem(
      "ui",
      JSON.stringify({ state: { locale: "id", sites: [], sidebarCollapsed: false }, version: 0 }),
    );
  });
}

async function settle(page, wait = 900) {
  await page.waitForTimeout(wait);
  await hideDevOverlay(page);
}

// Client-side navigation via a real <a href> link — avoids full page reload.
async function clickLink(page, href, { exact = true } = {}) {
  await dismissOverlays(page);
  const selector = exact ? `a[href="${href}"]` : `a[href^="${href}"]`;
  const link = page.locator(selector).first();
  await link.waitFor({ state: "visible", timeout: 8000 });
  await link.click();
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await seedLocale(context);
  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  // ---------------------------------------------------------------------
  // 1. Login page (empty form) — the ONLY full page.goto besides this first
  // load; everything after login uses client-side link clicks.
  // ---------------------------------------------------------------------
  try {
    await page.goto(`${BASE}/admin/login`, { waitUntil: "load" });
    await settle(page);
    await page.screenshot({ path: shot("admin-01-login.png"), fullPage: true });
    results.push(["admin-01-login.png", "OK"]);
  } catch (e) {
    results.push(["admin-01-login.png", "FAILED: " + e.message]);
  }

  try {
    await page.waitForTimeout(800); // let hydration settle before typing
    await page.locator("#email").click();
    await page.locator("#email").pressSequentially("admin@parknshine.com", { delay: 20 });
    await page.locator("#password").click();
    await page.locator("#password").pressSequentially("admin123", { delay: 20 });
    await page.waitForTimeout(200);
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.waitFor({ state: "visible", timeout: 5000 });
    if (!(await submitBtn.isEnabled())) {
      // Re-trigger validation if the button is still disabled.
      await page.locator("#password").press("Tab");
      await page.waitForTimeout(300);
    }
    await submitBtn.click();
    await page.waitForURL("**/dashboard**", { timeout: 15000 });
    await settle(page, 1500);
  } catch (e) {
    console.error("LOGIN FAILED:", e.message);
    await page.screenshot({ path: shot("_debug_login_failed.png"), fullPage: true });
    await browser.close();
    process.exit(1);
  }

  // ---------------------------------------------------------------------
  // 2. Dashboard grid (all sites)
  // ---------------------------------------------------------------------
  try {
    await settle(page, 1000);
    await page.screenshot({ path: shot("admin-02-dashboard-grid.png"), fullPage: true });
    results.push(["admin-02-dashboard-grid.png", "OK"]);
  } catch (e) {
    results.push(["admin-02-dashboard-grid.png", "FAILED: " + e.message]);
  }

  // ---------------------------------------------------------------------
  // 3. Dashboard single-site view (site_mall_a, with escalation) — click
  // "Lihat Semua" on the Mall A card.
  // ---------------------------------------------------------------------
  try {
    const seeAllBtn = page.locator("button:has-text('Lihat Semua'), button:has-text('See All')").first();
    await seeAllBtn.click();
    await settle(page, 1200);
    results.push(["admin-03-dashboard-site.png", "PENDING-SCREENSHOT"]);
  } catch (e) {
    results.push(["admin-03-dashboard-site.png", "FAILED: " + e.message]);
  }
  if (results.at(-1)[1] === "PENDING-SCREENSHOT") {
    await page.screenshot({ path: shot("admin-03-dashboard-site.png"), fullPage: true });
    results[results.length - 1][1] = "OK";
  }

  // ---------------------------------------------------------------------
  // 4. Booking detail drawer — click the NEEDS_HELP booking row
  // ---------------------------------------------------------------------
  try {
    const row = page.locator("text=B 1004 SOS").first();
    if ((await row.count()) > 0) {
      await row.click();
    } else {
      await page.locator("article, button.grid").first().click();
    }
    await settle(page, 1200);
    await page.screenshot({ path: shot("admin-04-booking-drawer.png"), fullPage: true });
    results.push(["admin-04-booking-drawer.png", "OK"]);
  } catch (e) {
    results.push(["admin-04-booking-drawer.png", "FAILED: " + e.message]);
  }

  // The drawer only closes via clicking its backdrop — Escape does nothing.
  await dismissOverlays(page);
  await dismissOverlays(page);

  // ---------------------------------------------------------------------
  // 5. Sites list
  // ---------------------------------------------------------------------
  try {
    await clickLink(page, "/sites");
    try {
      await page.waitForURL("**/sites", { timeout: 4000 });
    } catch {
      // Click may have been swallowed by a closing overlay — retry once.
      await clickLink(page, "/sites");
      await page.waitForURL("**/sites", { timeout: 6000 });
    }
    await settle(page, 1200);
    await page.screenshot({ path: shot("admin-05-sites-list.png"), fullPage: true });
    results.push(["admin-05-sites-list.png", "OK"]);
  } catch (e) {
    results.push(["admin-05-sites-list.png", "FAILED: " + e.message]);
  }

  // ---------------------------------------------------------------------
  // 6. Site QR management page — click "Kelola QR" / "Manage QR" on Mall A row
  // ---------------------------------------------------------------------
  try {
    await dismissOverlays(page);
    // Must be the per-row "Manage QR" button, NOT the page-header "Generic
    // Site QR" button (a naive text-scoped selector previously grabbed that
    // one instead, since it also sits inside a container that mentions
    // "Mall A" elsewhere on the page).
    const detailLink = page.locator('a[href="/sites/site_mall_a"]').first();
    if ((await detailLink.count()) > 0) {
      await detailLink.click();
    } else {
      const manageBtn = page.locator('button:has-text("Manage QR")').first();
      await manageBtn.waitFor({ state: "visible", timeout: 6000 });
      await manageBtn.click();
    }
    await settle(page, 1000);
    await dismissOverlays(page);
    await page.screenshot({ path: shot("admin-06-site-qr.png"), fullPage: true });
    results.push(["admin-06-site-qr.png", "OK"]);
  } catch (e) {
    results.push(["admin-06-site-qr.png", "FAILED: " + e.message]);
  }

  // ---------------------------------------------------------------------
  // 7. Shifts page — click the "Shifts" button on the site detail page
  // ---------------------------------------------------------------------
  try {
    await dismissOverlays(page);
    const shiftsBtn = page.locator("button:has-text('Shifts')").first();
    await shiftsBtn.waitFor({ state: "visible", timeout: 8000 });
    await shiftsBtn.click();
    await settle(page, 1000);
    const revealBtn = page.locator("table button").first();
    if ((await revealBtn.count()) > 0) {
      await revealBtn.click();
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: shot("admin-07-shifts.png"), fullPage: true });
    results.push(["admin-07-shifts.png", "OK"]);
  } catch (e) {
    results.push(["admin-07-shifts.png", "FAILED: " + e.message]);
  }

  // ---------------------------------------------------------------------
  // 8. Crew members list
  // ---------------------------------------------------------------------
  try {
    await clickLink(page, "/crew-members");
    await settle(page, 1000);
    await page.screenshot({ path: shot("admin-08-crew-members.png"), fullPage: true });
    results.push(["admin-08-crew-members.png", "OK"]);
  } catch (e) {
    results.push(["admin-08-crew-members.png", "FAILED: " + e.message]);
  }

  // ---------------------------------------------------------------------
  // 9. Reports overview
  // ---------------------------------------------------------------------
  try {
    await clickLink(page, "/reports");
    await settle(page, 1500);
    await page.screenshot({ path: shot("admin-09-reports-overview.png"), fullPage: true });
    results.push(["admin-09-reports-overview.png", "OK"]);
  } catch (e) {
    results.push(["admin-09-reports-overview.png", "FAILED: " + e.message]);
  }

  // ---------------------------------------------------------------------
  // 10. Reports > Jobs ledger
  // ---------------------------------------------------------------------
  try {
    await clickLink(page, "/reports/jobs");
    await settle(page, 1500);
    await page.screenshot({ path: shot("admin-10-reports-jobs.png"), fullPage: true });
    results.push(["admin-10-reports-jobs.png", "OK"]);
  } catch (e) {
    results.push(["admin-10-reports-jobs.png", "FAILED: " + e.message]);
  }

  // ---------------------------------------------------------------------
  // 13 (captured here while jobs list has our refundable booking visible) —
  // Refund modal: click the refundable booking row to open the drawer, then
  // click Refund.
  // ---------------------------------------------------------------------
  try {
    const row = page.locator("text=B 1005 RFD").first();
    await row.waitFor({ timeout: 6000 });
    await row.click();
    await settle(page, 1000);
    const refundBtn = page.locator("button:has-text('Refund')").first();
    await refundBtn.waitFor({ timeout: 6000 });
    await refundBtn.click();
    await settle(page, 600);
    await page.screenshot({ path: shot("admin-13-refund-modal.png"), fullPage: true });
    results.push(["admin-13-refund-modal.png", "OK"]);
  } catch (e) {
    results.push(["admin-13-refund-modal.png", "FAILED: " + e.message]);
  }
  await dismissOverlays(page);
  await dismissOverlays(page);

  // ---------------------------------------------------------------------
  // 11. Reports > Customers
  // ---------------------------------------------------------------------
  try {
    await clickLink(page, "/reports/customers");
    await settle(page, 1500);
    await page.screenshot({ path: shot("admin-11-reports-customers.png"), fullPage: true });
    results.push(["admin-11-reports-customers.png", "OK"]);
  } catch (e) {
    results.push(["admin-11-reports-customers.png", "FAILED: " + e.message]);
  }

  // ---------------------------------------------------------------------
  // 12. Reports > Tips
  // ---------------------------------------------------------------------
  try {
    await clickLink(page, "/reports/tips");
    await settle(page, 1500);
    await page.screenshot({ path: shot("admin-12-reports-tips.png"), fullPage: true });
    results.push(["admin-12-reports-tips.png", "OK"]);
  } catch (e) {
    results.push(["admin-12-reports-tips.png", "FAILED: " + e.message]);
  }

  // ---------------------------------------------------------------------
  // 14. Disbursements
  // ---------------------------------------------------------------------
  try {
    await clickLink(page, "/reports/disbursements");
    await settle(page, 1500);
    await page.screenshot({ path: shot("admin-14-disbursements.png"), fullPage: true });
    results.push(["admin-14-disbursements.png", "OK"]);
  } catch (e) {
    results.push(["admin-14-disbursements.png", "FAILED: " + e.message]);
  }

  // ---------------------------------------------------------------------
  // 15. Audit log
  // ---------------------------------------------------------------------
  try {
    await clickLink(page, "/audit");
    await settle(page, 1500);
    await page.screenshot({ path: shot("admin-15-audit.png"), fullPage: true });
    results.push(["admin-15-audit.png", "OK"]);
  } catch (e) {
    results.push(["admin-15-audit.png", "FAILED: " + e.message]);
  }

  // ---------------------------------------------------------------------
  // 16. Navbar bell dropdown (escalation bell — has NEEDS_HELP data)
  // ---------------------------------------------------------------------
  try {
    await clickLink(page, "/dashboard");
    await settle(page, 1200);
    const bellBtn = page.locator("button:has(svg.lucide-bell)").first();
    await bellBtn.waitFor({ state: "visible", timeout: 6000 });
    await bellBtn.click();
    await settle(page, 500);
    await page.screenshot({ path: shot("admin-16-bells.png"), fullPage: true });
    results.push(["admin-16-bells.png", "OK"]);
  } catch (e) {
    results.push(["admin-16-bells.png", "FAILED: " + e.message]);
  }

  // ---------------------------------------------------------------------
  // 17. Settings
  // ---------------------------------------------------------------------
  try {
    await clickLink(page, "/settings");
    await settle(page, 1200);
    await page.screenshot({ path: shot("admin-17-settings.png"), fullPage: true });
    results.push(["admin-17-settings.png", "OK"]);
  } catch (e) {
    results.push(["admin-17-settings.png", "FAILED: " + e.message]);
  }

  // ---------------------------------------------------------------------
  // 18. Users
  // ---------------------------------------------------------------------
  try {
    await clickLink(page, "/users");
    await settle(page, 1200);
    await page.screenshot({ path: shot("admin-18-users.png"), fullPage: true });
    results.push(["admin-18-users.png", "OK"]);
  } catch (e) {
    results.push(["admin-18-users.png", "FAILED: " + e.message]);
  }

  // ---------------------------------------------------------------------
  // 19. Testimonials
  // ---------------------------------------------------------------------
  try {
    await clickLink(page, "/testimonials");
    await settle(page, 1200);
    await page.screenshot({ path: shot("admin-19-testimonials.png"), fullPage: true });
    results.push(["admin-19-testimonials.png", "OK"]);
  } catch (e) {
    results.push(["admin-19-testimonials.png", "FAILED: " + e.message]);
  }

  // ---------------------------------------------------------------------
  // 20. Inbox
  // ---------------------------------------------------------------------
  try {
    await clickLink(page, "/inbox");
    await settle(page, 1200);
    await page.screenshot({ path: shot("admin-20-inbox.png"), fullPage: true });
    results.push(["admin-20-inbox.png", "OK"]);
  } catch (e) {
    results.push(["admin-20-inbox.png", "FAILED: " + e.message]);
  }

  // ---------------------------------------------------------------------
  // 21. Profile — click avatar/email link in navbar
  // ---------------------------------------------------------------------
  try {
    await clickLink(page, "/profile");
    await settle(page, 1200);
    await page.screenshot({ path: shot("admin-21-profile.png"), fullPage: true });
    results.push(["admin-21-profile.png", "OK"]);
  } catch (e) {
    results.push(["admin-21-profile.png", "FAILED: " + e.message]);
  }

  await browser.close();

  console.log("\n=== RESULTS ===");
  for (const [name, status] of results) {
    console.log(`${status.startsWith("OK") ? "OK  " : "FAIL"} ${name} ${status.startsWith("OK") ? "" : "- " + status}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
