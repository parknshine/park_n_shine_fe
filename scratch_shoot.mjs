import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const OUT = "/Users/ilhamprasetya/Developer/singabyte/park_n_shine_project/park_n_shine/docs/user-manual/screenshots-admin";
fs.mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";

const done = [];
const skipped = [];

function outPath(name) {
  return path.join(OUT, name);
}

async function shot(page, name, opts = {}) {
  await page.screenshot({ path: outPath(name), fullPage: !!opts.fullPage });
  done.push(name);
  console.log("SHOT", name);
}

async function safe(label, fn) {
  try {
    await fn();
  } catch (err) {
    console.log("SKIP", label, "-", err.message.split("\n")[0]);
    skipped.push(`${label}: ${err.message.split("\n")[0]}`);
  }
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);

  // 1. Login page
  await safe("admin-01-login.png", async () => {
    await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    await shot(page, "admin-01-login.png");
  });

  // Perform login
  await safe("login-action", async () => {
    await page.fill("#email", "admin@parknshine.com");
    await page.fill("#password", "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await page.waitForTimeout(800);
  });

  // 2. Dashboard grid (multi-site)
  await safe("admin-02-dashboard-grid.png", async () => {
    await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await shot(page, "admin-02-dashboard-grid.png");
  });

  // 3. Dashboard single-site view
  await safe("admin-03-dashboard-site.png", async () => {
    await page.goto(`${BASE}/dashboard?siteId=site_mall_a`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await shot(page, "admin-03-dashboard-site.png");
  });

  // 4. Booking detail drawer (click first booking row)
  await safe("admin-04-booking-drawer.png", async () => {
    const rowBtn = page.locator("button.grid.w-full").first();
    await rowBtn.waitFor({ state: "visible", timeout: 8000 });
    await rowBtn.click();
    await page.waitForTimeout(800);
    await shot(page, "admin-04-booking-drawer.png");
  });

  // close drawer / modal overlay if any before moving on
  await safe("close-drawer", async () => {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  });

  // 5. Sites list
  await safe("admin-05-sites-list.png", async () => {
    await page.goto(`${BASE}/sites`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await shot(page, "admin-05-sites-list.png");
  });

  // 6. Site QR page
  await safe("admin-06-site-qr.png", async () => {
    await page.goto(`${BASE}/sites/site_mall_a`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await shot(page, "admin-06-site-qr.png");
  });

  // 7. Shifts
  await safe("admin-07-shifts.png", async () => {
    await page.goto(`${BASE}/sites/site_mall_a/shifts`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await shot(page, "admin-07-shifts.png");
  });

  // 8. Crew members
  await safe("admin-08-crew-members.png", async () => {
    await page.goto(`${BASE}/crew-members`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await shot(page, "admin-08-crew-members.png");
  });

  // 9. Reports overview
  await safe("admin-09-reports-overview.png", async () => {
    await page.goto(`${BASE}/reports`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await shot(page, "admin-09-reports-overview.png");
  });

  // 10. Reports jobs
  await safe("admin-10-reports-jobs.png", async () => {
    await page.goto(`${BASE}/reports/jobs`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await shot(page, "admin-10-reports-jobs.png");
  });

  // 13. Refund modal - try from jobs report row / booking drawer for a CLOSED job
  await safe("admin-13-refund-modal.png", async () => {
    // try clicking a row in the jobs table to open detail modal/drawer
    const row = page.locator("table tbody tr").first();
    await row.waitFor({ state: "visible", timeout: 8000 });
    await row.click();
    await page.waitForTimeout(600);
    // look for a Refund button
    const refundBtn = page.getByRole("button", { name: /refund/i }).first();
    await refundBtn.waitFor({ state: "visible", timeout: 5000 });
    await refundBtn.click();
    await page.waitForTimeout(600);
    await shot(page, "admin-13-refund-modal.png");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  });

  // 11. Reports customers
  await safe("admin-11-reports-customers.png", async () => {
    await page.goto(`${BASE}/reports/customers`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await shot(page, "admin-11-reports-customers.png");
  });

  // 12. Reports tips
  await safe("admin-12-reports-tips.png", async () => {
    await page.goto(`${BASE}/reports/tips`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await shot(page, "admin-12-reports-tips.png");
  });

  // 14. Disbursements
  await safe("admin-14-disbursements.png", async () => {
    await page.goto(`${BASE}/reports/disbursements`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await shot(page, "admin-14-disbursements.png");
  });

  // 15. Audit
  await safe("admin-15-audit.png", async () => {
    await page.goto(`${BASE}/audit`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await shot(page, "admin-15-audit.png");
  });

  // 16. Bells (notification bell dropdown) - go to dashboard, click a bell icon
  await safe("admin-16-bells.png", async () => {
    await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    const bellBtn = page.locator("button:has(svg.lucide-bell)").first();
    await bellBtn.waitFor({ state: "visible", timeout: 5000 });
    await bellBtn.click();
    await page.waitForTimeout(500);
    await shot(page, "admin-16-bells.png");
  });

  // 17. Settings
  await safe("admin-17-settings.png", async () => {
    await page.goto(`${BASE}/settings`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await shot(page, "admin-17-settings.png");
  });

  // 18. Users
  await safe("admin-18-users.png", async () => {
    await page.goto(`${BASE}/users`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await shot(page, "admin-18-users.png");
  });

  // 19. Testimonials
  await safe("admin-19-testimonials.png", async () => {
    await page.goto(`${BASE}/testimonials`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await shot(page, "admin-19-testimonials.png");
  });

  // 20. Inbox
  await safe("admin-20-inbox.png", async () => {
    await page.goto(`${BASE}/inbox`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await shot(page, "admin-20-inbox.png");
  });

  // 21. Profile
  await safe("admin-21-profile.png", async () => {
    await page.goto(`${BASE}/profile`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await shot(page, "admin-21-profile.png");
  });

  await browser.close();

  console.log("\n=== DONE ===", done.length, done);
  console.log("\n=== SKIPPED ===", skipped.length);
  skipped.forEach((s) => console.log(" -", s));
})();
