import { chromium } from "playwright";

const BASE = "http://localhost:3000";

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    window.localStorage.setItem(
      "ui",
      JSON.stringify({ state: { locale: "id", sites: [], sidebarCollapsed: false }, version: 0 }),
    );
  });
  const page = await context.newPage();
  page.on("console", (msg) => console.log("[console]", msg.type(), msg.text()));
  page.on("pageerror", (err) => console.log("[pageerror]", err.message));
  page.on("requestfailed", (req) => console.log("[reqfailed]", req.url(), req.failure()?.errorText));
  page.on("response", (res) => {
    if (res.status() >= 300 && res.status() < 400) {
      console.log("[redirect]", res.status(), res.url(), "->", res.headers()["location"]);
    }
  });
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) console.log("[navigated]", frame.url());
  });

  await page.goto(`${BASE}/admin/login`, { waitUntil: "load" });
  await page.fill("#email", "admin@parknshine.com");
  await page.fill("#password", "admin123");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard**", { timeout: 15000 });
  console.log("after login url:", page.url());

  await page.goto(`${BASE}/sites`, { waitUntil: "load" });
  await page.waitForTimeout(2000);
  console.log("after goto /sites url:", page.url());
  console.log("cookies:", (await context.cookies()).map(c => c.name));

  await browser.close();
}
main();
