import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});

await page.route("**/*", async (route) => {
  const url = route.request().url();
  const method = route.request().method();
  if (!url.includes("/v1/")) return route.continue();
  const json = (status, body) =>
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  if (method === "POST" && url.includes("/v1/bookings")) {
    return json(201, {
      success: true,
      data: { id: "bk_preview", signedToken: "tok_preview", siteName: "Grand Indonesia", status: "DRAFT" },
    });
  }
  if (url.includes("/v1/sites")) {
    return json(200, {
      success: true,
      data: [{ id: "site_1", name: "Grand Indonesia", address: "Jl. M.H. Thamrin, Jakarta", intakePaused: false, cutoffTime: null, price: 50000 }],
    });
  }
  if (url.includes("/v1/settings")) {
    return json(200, {
      data: { whatsappNumber: "628111111111", avgCleaningMinutes: 30, washPrice: 50000, loyaltyEnabled: false, promoBannerUrls: [], enabledPaymentMethods: ["QRIS"] },
    });
  }
  return json(200, { success: true, data: {} });
});

async function toId() {
  const toggle = page.getByRole("button", { name: /^ID$/ });
  if (await toggle.count()) await toggle.click();
  await page.getByRole("heading", { name: "Booking cuci mobil" }).waitFor();
}

await page.goto("http://localhost:3100/book/capture", { waitUntil: "networkidle" });
await toId();
await page.screenshot({ path: "/tmp/capture-top.png" });
await page.getByRole("button", { name: "Ambil Foto" }).nth(1).scrollIntoViewIfNeeded();
await page.screenshot({ path: "/tmp/capture-slot.png" });
await page.getByRole("button", { name: "Lanjut ke konfirmasi" }).scrollIntoViewIfNeeded();
await page.screenshot({ path: "/tmp/capture-bottom.png" });

await page.goto("http://localhost:3100/q/preview/book/capture", { waitUntil: "networkidle" });
await toId();
await page.getByText("Grand Indonesia").waitFor();
await page.screenshot({ path: "/tmp/capture-qr-top.png" });

const box = await page.getByRole("button", { name: "Ambil Foto" }).first().boundingBox();
const nav = await page.locator("nav").boundingBox();
console.log("first camera", box);
console.log("nav", nav);
console.log("camera covered", box && nav ? box.y + box.height > nav.y && box.y < nav.y + nav.height : "n/a");
await browser.close();
