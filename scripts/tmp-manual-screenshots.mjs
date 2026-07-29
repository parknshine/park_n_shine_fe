// TEMPORARY script — captures customer-journey screenshots for the user manual.
// Not part of the app; safe to delete after use.
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import path from "node:path";

const BASE = "http://localhost:3000";
const OUT = "/Users/ilhamprasetya/Developer/singabyte/park_n_shine_project/park_n_shine/docs/user-manual/screenshots";
const API_DIR = "/Users/ilhamprasetya/Developer/singabyte/park_n_shine_project/park-n-shine-api";

function fixture(cmd, bookingId, siteId) {
  const args = ["tsx", "scripts/tmp-booking-fixture.ts", cmd, bookingId];
  if (siteId) args.push(siteId);
  execFileSync("npx", args, { cwd: API_DIR, stdio: "inherit" });
}

function seedLocale(page, locale = "id") {
  return page.addInitScript((value) => {
    try {
      const raw = window.localStorage.getItem("ui");
      const parsed = raw ? JSON.parse(raw) : {};
      parsed.state = { ...(parsed.state ?? {}), locale: value };
      parsed.version = parsed.version ?? 0;
      window.localStorage.setItem("ui", JSON.stringify(parsed));
    } catch {}
  }, locale);
}

async function shot(page, name) {
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, name), fullPage: true });
  console.log("captured", name);
}

const results = { captured: [], skipped: [] };

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: "id-ID",
  });
  const page = await context.newPage();
  await seedLocale(page, "id");

  // 1. Home
  try {
    await page.goto(`${BASE}/home`, { waitUntil: "networkidle" });
    await shot(page, "01-home.png");
    results.captured.push("01-home.png");
  } catch (e) {
    console.error("01-home failed", e);
    results.skipped.push(["01-home.png", String(e)]);
  }

  // 2. QR landing
  try {
    await page.goto(`${BASE}/q/qr_001`, { waitUntil: "networkidle" });
    await shot(page, "02-qr-landing.png");
    results.captured.push("02-qr-landing.png");
  } catch (e) {
    console.error("02-qr-landing failed", e);
    results.skipped.push(["02-qr-landing.png", String(e)]);
  }

  // 3. Capture page — intercept the booking-create response to grab id/token
  let bookingId, token, siteName;
  try {
    const [resp] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes("/v1/bookings") && r.request().method() === "POST",
        { timeout: 20000 },
      ),
      page.goto(`${BASE}/q/qr_001/book/capture`, { waitUntil: "domcontentloaded" }),
    ]);
    const body = await resp.json();
    bookingId = body.data.id;
    token = body.data.signedToken;
    siteName = body.data.siteName ?? "Mall A - Level B2";
    await page.waitForTimeout(1500);
    await shot(page, "03-capture.png");
    results.captured.push("03-capture.png");
    console.log("booking created:", bookingId);
  } catch (e) {
    console.error("03-capture failed", e);
    results.skipped.push(["03-capture.png", String(e)]);
  }

  if (!bookingId || !token) {
    console.error("No booking id/token — aborting downstream steps");
    await browser.close();
    printSummary();
    return;
  }

  // 4. Confirm page — fabricate plate/slot via query params (no OCR needed)
  const plate = "B1234XYZ";
  const slot = "A12";
  const confirmUrl =
    `${BASE}/book/confirm?bookingId=${bookingId}&token=${encodeURIComponent(token)}` +
    `&lat=-6.2088&lng=106.8456&loc=${encodeURIComponent(siteName)}` +
    `&addr=${encodeURIComponent("Jl. Jend. Sudirman No.1, Jakarta")}` +
    `&siteId=site_mall_a&phone=${encodeURIComponent("+6281234567890")}` +
    `&plate=${plate}&slot=${slot}`;
  try {
    await page.goto(confirmUrl, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await shot(page, "04-confirm.png");
    results.captured.push("04-confirm.png");
  } catch (e) {
    console.error("04-confirm failed", e);
    results.skipped.push(["04-confirm.png", String(e)]);
  }

  // 5. Click "Bayar Sekarang" -> confirms booking -> payment-method page
  let onPaymentMethod = false;
  try {
    await page.getByRole("button", { name: /bayar sekarang/i }).click();
    await page.waitForURL(/\/payment-method/, { timeout: 20000 });
    await page.waitForTimeout(1000);
    await shot(page, "05-payment-method.png");
    results.captured.push("05-payment-method.png");
    onPaymentMethod = true;
  } catch (e) {
    console.error("05-payment-method failed", e);
    results.skipped.push(["05-payment-method.png", String(e)]);
  }

  // 6. Select QRIS -> real Xendit sandbox charge -> /pay screen
  let payScreenReal = false;
  if (onPaymentMethod) {
    try {
      await page.getByRole("button", { name: /^QRIS$/i }).click();
      await page.waitForURL(/\/pay(\?|$)/, { timeout: 20000 });
      await page.waitForTimeout(2000);
      // Ensure instructions actually rendered (not stuck on spinner)
      await page.waitForSelector("text=/QRIS|Scan/i", { timeout: 15000 }).catch(() => {});
      await shot(page, "06-pay.png");
      results.captured.push("06-pay.png (real Xendit sandbox charge)");
      payScreenReal = true;
    } catch (e) {
      console.error("06-pay via real Xendit failed, falling back to fixture", e);
    }
  }

  if (!payScreenReal) {
    try {
      fixture("qris-instructions", bookingId);
      await page.goto(`${BASE}/booking/${bookingId}/pay?token=${encodeURIComponent(token)}`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(1500);
      await shot(page, "06-pay.png");
      results.captured.push("06-pay.png (fabricated QRIS instructions)");
    } catch (e) {
      console.error("06-pay fallback failed", e);
      results.skipped.push(["06-pay.png", String(e)]);
    }
  }

  // 7. Mark PAID via fixture, screenshot status page
  try {
    fixture("mark-paid", bookingId);
    await page.goto(`${BASE}/booking/${bookingId}/status?token=${encodeURIComponent(token)}`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(1000);
    await shot(page, "07-status-pending.png");
    results.captured.push("07-status-pending.png (PAID state)");
  } catch (e) {
    console.error("07-status-pending failed", e);
    results.skipped.push(["07-status-pending.png", String(e)]);
  }

  // 7b. Assign + in-progress, screenshot
  try {
    fixture("assign", bookingId, "site_mall_a");
    fixture("in-progress", bookingId);
    await page.goto(`${BASE}/booking/${bookingId}/status?token=${encodeURIComponent(token)}`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(1000);
    await shot(page, "07-status-inprogress.png");
    results.captured.push("07-status-inprogress.png");
  } catch (e) {
    console.error("07-status-inprogress failed", e);
    results.skipped.push(["07-status-inprogress.png", String(e)]);
  }

  // 8. Ready
  try {
    fixture("ready", bookingId);
    await page.goto(`${BASE}/booking/${bookingId}/status?token=${encodeURIComponent(token)}`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(1000);
    await shot(page, "08-status-ready.png");
    results.captured.push("08-status-ready.png");
  } catch (e) {
    console.error("08-status-ready failed", e);
    results.skipped.push(["08-status-ready.png", String(e)]);
  }

  // 9. Close booking, then rate page (star rating)
  try {
    fixture("closed", bookingId);
    await page.goto(`${BASE}/booking/${bookingId}/rate?token=${encodeURIComponent(token)}`, {
      waitUntil: "networkidle",
    });
    await page.getByRole("button", { name: "4 bintang" }).click();
    await page.waitForTimeout(500);
    await shot(page, "09-rate.png");
    results.captured.push("09-rate.png");
  } catch (e) {
    console.error("09-rate failed", e);
    results.skipped.push(["09-rate.png", String(e)]);
  }

  // 10. Submit rating -> tip select step
  try {
    await page.getByRole("button", { name: /kirim|submit/i }).click();
    await page.waitForTimeout(1200);
    await shot(page, "10-tip.png");
    results.captured.push("10-tip.png");
  } catch (e) {
    console.error("10-tip failed", e);
    results.skipped.push(["10-tip.png", String(e)]);
  }

  // 11. Skip tip -> thank you page
  try {
    await page.getByRole("button", { name: /lewati|skip/i }).click();
    await page.waitForURL(/\/thank-you/, { timeout: 10000 });
    await page.waitForTimeout(800);
    await shot(page, "11-thankyou.png");
    results.captured.push("11-thankyou.png");
  } catch (e) {
    console.error("11-thankyou failed", e);
    results.skipped.push(["11-thankyou.png", String(e)]);
  }

  // 14. Support (static)
  try {
    await page.goto(`${BASE}/support`, { waitUntil: "networkidle" });
    await shot(page, "14-support.png");
    results.captured.push("14-support.png");
  } catch (e) {
    console.error("14-support failed", e);
    results.skipped.push(["14-support.png", String(e)]);
  }

  // 14. Contact (static)
  try {
    await page.goto(`${BASE}/contact`, { waitUntil: "networkidle" });
    await shot(page, "14-contact.png");
    results.captured.push("14-contact.png");
  } catch (e) {
    console.error("14-contact failed", e);
    results.skipped.push(["14-contact.png", String(e)]);
  }

  await browser.close();
  printSummary();
}

function printSummary() {
  console.log("\n=== SUMMARY ===");
  console.log("Captured:", JSON.stringify(results.captured, null, 2));
  console.log("Skipped:", JSON.stringify(results.skipped, null, 2));
}

main().catch((e) => {
  console.error("FATAL", e);
  printSummary();
  process.exit(1);
});
