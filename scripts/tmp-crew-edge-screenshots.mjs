// TEMPORARY script — captures crew-app EDGE CASE / MODAL screenshots for the
// user manual. Not part of the app; safe to delete after use.
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import path from "node:path";

const BASE = "http://localhost:3000";
const API = "http://localhost:3001";
const OUT = "/Users/ilhamprasetya/Developer/singabyte/park_n_shine_project/park_n_shine/docs/user-manual/screenshots-crew";
const API_DIR = "/Users/ilhamprasetya/Developer/singabyte/park_n_shine_project/park-n-shine-api";
const CRON_SECRET = "pns_cron_iMQSxalfGDFXiicspAhaVhFt";

function seed(mode) {
  execFileSync("npx", ["tsx", "prisma/scripts/tmp-seed-crew-screens.ts", mode], {
    cwd: API_DIR,
    stdio: "inherit",
  });
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

async function hideDevOverlay(page) {
  await page.addInitScript(() => {
    const hide = () => {
      document
        .querySelectorAll("nextjs-portal, [data-nextjs-toast], #__next-build-watcher")
        .forEach((el) => {
          el.style.display = "none";
        });
    };
    setInterval(hide, 300);
  });
}

async function shot(page, name) {
  // Belt-and-suspenders hide right before capture too.
  await page.evaluate(() => {
    document
      .querySelectorAll("nextjs-portal, [data-nextjs-toast], #__next-build-watcher")
      .forEach((el) => {
        el.style.display = "none";
      });
  }).catch(() => {});
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, name), fullPage: true });
  console.log("captured", name);
}

const results = { captured: [], skipped: [] };

async function adminLogin() {
  const res = await fetch(`${API}/v1/admin/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@parknshine.com", password: "admin123" }),
  });
  const body = await res.json();
  return body.data.token;
}

async function approveTimeExtension(bookingId, adminToken) {
  const res = await fetch(
    `${API}/v1/admin/bookings/${bookingId}/time-extension-request/respond`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ approved: true }),
    },
  );
  return res.json();
}

async function runCronJob(jobName) {
  const res = await fetch(`${API}/v1/internal/jobs/${jobName}`, {
    method: "POST",
    headers: { "x-cron-secret": CRON_SECRET },
  });
  return res.json();
}

async function loginCrew(page) {
  await page.goto(`${BASE}/crew/login`, { waitUntil: "load" });
  await page.locator("#shiftCode").fill("123456");
  await page.locator("#pin").fill("1234");
  await page.getByRole("button", { name: /masuk|sign in/i }).click();
  await page.waitForURL(/\/crew\/home/, { timeout: 15000 });
  await page.waitForTimeout(1000);
}

async function main() {
  seed("base");
  seed("unassign");

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: "id-ID",
  });
  const page = await context.newPage();
  await hideDevOverlay(page);
  await seedLocale(page, "id");

  await loginCrew(page);

  // ── 1-3: incoming job modal / reject / wait ────────────────────────────
  try {
    seed("queue");
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1500);
    await page.getByRole("button", { name: /ambil job berikutnya/i }).click();
    await page.waitForTimeout(1000);
    await shot(page, "crew-09-incoming-job-modal.png");
    results.captured.push("crew-09-incoming-job-modal.png");

    // Reject flow — pick a reason, screenshot before confirming (booking stays PAID)
    await page.getByText("Tolak Job", { exact: true }).click();
    await page.waitForTimeout(300);
    await page.getByText("Kendaraan terlalu kotor / berat", { exact: true }).click();
    await page.waitForTimeout(300);
    await shot(page, "crew-10-reject-reason.png");
    results.captured.push("crew-10-reject-reason.png");

    // Back -> choose -> request wait -> pick 10 min -> home countdown
    await page.getByText("← Back").click();
    await page.waitForTimeout(200);
    await page.getByText("Minta Tunggu", { exact: true }).click();
    await page.waitForTimeout(300);
    await page.getByText("Tunggu 10 menit", { exact: true }).click();
    await page.waitForTimeout(1200);
    await shot(page, "crew-11-wait-countdown.png");
    results.captured.push("crew-11-wait-countdown.png");
  } catch (e) {
    console.error("incoming/reject/wait flow failed", e);
    results.skipped.push(["crew-09/10/11", String(e)]);
  }

  // ── 4-5: needs-help modal + waiting-for-help banner ────────────────────
  try {
    seed("job"); // re-assigns bk_shotjob_assigned (ASSIGNED) to crew
    await page.goto(`${BASE}/crew/jobs/bk_shotjob_assigned`, { waitUntil: "load" });
    await page.waitForTimeout(800);
    await page.getByRole("button", { name: "Butuh Bantuan" }).click();
    await page.waitForTimeout(500);
    await page.getByText("Kendaraan tidak bisa diakses", { exact: true }).click();
    await page.waitForTimeout(300);
    await shot(page, "crew-12-needs-help-modal.png");
    results.captured.push("crew-12-needs-help-modal.png");

    await page.getByRole("button", { name: "Kirim Permintaan" }).click();
    await page.waitForTimeout(1200);
    await shot(page, "crew-13-waiting-for-help.png");
    results.captured.push("crew-13-waiting-for-help.png");
  } catch (e) {
    console.error("needs-help flow failed", e);
    results.skipped.push(["crew-12/13", String(e)]);
  }

  // ── 6: verify -> plate not found -> escalated ──────────────────────────
  try {
    seed("verify");
    await page.goto(`${BASE}/crew/jobs/bk_shotjob_verify/verify`, { waitUntil: "load" });
    await page.waitForTimeout(800);
    await page.getByRole("button", { name: "Tidak Ditemukan" }).click();
    await page.waitForTimeout(1000);
    await shot(page, "crew-14-plate-not-found.png");
    results.captured.push("crew-14-plate-not-found.png");
  } catch (e) {
    console.error("verify not-found flow failed", e);
    results.skipped.push(["crew-14-plate-not-found.png", String(e)]);
  }

  // ── 7-8: time extension request confirm + approved ─────────────────────
  try {
    seed("timeext");
    await page.goto(`${BASE}/crew/jobs/bk_shotjob_timeext`, { waitUntil: "load" });
    // useEtaExpired flips ~1s after mount since etaEndsAt is already in the past
    await page.waitForTimeout(2000);
    await page.getByRole("button", { name: /minta tambah waktu/i }).click();
    await page.waitForTimeout(500);
    await shot(page, "crew-15-time-extension-request.png");
    results.captured.push("crew-15-time-extension-request.png");

    await page.getByRole("button", { name: "Ya, Kirim" }).click();
    await page.waitForTimeout(1500); // state -> "pending" (real API call)

    const adminToken = await adminLogin();
    const approveResult = await approveTimeExtension("bk_shotjob_timeext", adminToken);
    console.log("approveTimeExtension result:", JSON.stringify(approveResult));

    // Wait for SSE round-trip: crew-shell listener updates query cache -> TimeExtensionControl effect flips to "approved"
    await page.waitForSelector("text=Waktu diperpanjang!", { timeout: 15000 });
    await page.waitForTimeout(500);
    await shot(page, "crew-16-time-extended.png");
    results.captured.push("crew-16-time-extended.png");
  } catch (e) {
    console.error("time extension flow failed", e);
    results.skipped.push(["crew-15/16", String(e)]);
  }

  // ── 9: job stale modal (live via SSE from cron job) ────────────────────
  try {
    seed("stale");
    await page.goto(`${BASE}/crew/home?noResume=true`, { waitUntil: "load" });
    await page.waitForTimeout(1500); // let SSE connection establish (sse-token fetch + EventSource open)

    const cronResult = await runCronJob("expire-assigned-jobs");
    console.log("expire-assigned-jobs result:", JSON.stringify(cronResult));

    await page.waitForSelector("text=Waktu Pengerjaan Habis", { timeout: 15000 });
    await page.waitForTimeout(500);
    await shot(page, "crew-17-job-stale-modal.png");
    results.captured.push("crew-17-job-stale-modal.png");
  } catch (e) {
    console.error("job-stale-modal flow failed", e);
    results.skipped.push(["crew-17-job-stale-modal.png", String(e)]);
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
