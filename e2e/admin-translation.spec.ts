/// <reference types="node" />

import { env } from "node:process";
import type { Locator } from "@playwright/test";
import { test, expect } from "./fixtures";

const sites = [
  { id: "test-site-1", name: "Test Mall A", code: "2" },
  { id: "test-site-2", name: "Test Mall B", code: "1" },
];

async function simulateTranslation(select: Locator) {
  const count = await select.evaluate((element) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodes: Node[] = [];
    while (walker.nextNode()) {
      if (walker.currentNode.textContent?.trim())
        nodes.push(walker.currentNode);
    }
    for (const node of nodes) {
      const outer = document.createElement("font");
      const inner = document.createElement("font");
      inner.textContent = `Translated ${node.textContent}`;
      outer.appendChild(inner);
      node.parentNode!.replaceChild(outer, node);
    }
    return nodes.length;
  });
  expect(count).toBeGreaterThan(0);
  await expect(select.locator("font > font")).not.toHaveCount(0);
}

test.use({ channel: env.PLAYWRIGHT_CHANNEL, video: "off" });

test.beforeEach(async ({ page, baseURL }) => {
  expect(["localhost", "127.0.0.1"]).toContain(new URL(baseURL!).hostname);
  await page.route("**/*", (route) => {
    const hostname = new URL(route.request().url()).hostname;
    return ["localhost", "127.0.0.1"].includes(hostname)
      ? route.continue()
      : route.abort();
  });
  await page.addInitScript((mockSites) => {
    localStorage.setItem(
      "auth",
      JSON.stringify({
        state: {
          user: { id: "test-admin", email: "admin@example.test" },
          role: "super_admin",
          menuAccess: null,
          isAuthenticated: true,
        },
        version: 0,
      }),
    );
    localStorage.setItem(
      "ui",
      JSON.stringify({
        state: { locale: "en", sites: mockSites, sidebarCollapsed: false },
        version: 0,
      }),
    );
  }, sites);
  await page.route("**/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    let data: unknown;
    if (path === "/v1/admin/sites") {
      data = sites;
    } else if (path === "/v1/admin/queue") {
      data = {
        fetchedAt: "2026-09-06T06:00:00Z",
        sites: sites.map((site) => ({
          siteId: site.id,
          siteName: site.name,
          groups: [],
          escalations: [],
        })),
      };
    } else if (path === "/v1/admin/reports/summary") {
      data = {
        period: { from: "2026-09-06", to: "2026-09-06" },
        bookings: { total: 0, byStatus: {} },
        payments: { byStatus: {} },
        revenue: {
          totalGross: 0,
          totalPaid: 0,
          totalRefunded: 0,
          currency: "IDR",
        },
        avgTurnaroundSeconds: null,
        crew: [],
      };
    } else if (path === "/v1/admin/tips/crew-summary") {
      data = {
        period: "2026-09",
        crews: [],
        summary: { totalPaid: 0, totalDisbursed: 0, crewCount: 0 },
      };
    } else if (path.endsWith("/audit-actors")) {
      data = [];
    } else if (path.endsWith("/audit-log")) {
      data = { entries: [], totalCount: 0 };
    } else {
      data = {
        requests: [],
        escalations: [],
        jobs: [],
        bookings: [],
        total: 0,
      };
    }
    await route.fulfill({ json: { success: true, data } });
  });
});

for (const destination of ["/reports", "/audit"]) {
  test(`translated dropdown survives dashboard navigation to ${destination}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto("/dashboard");
    const sort = page.getByRole("combobox", { name: "Sort sites" });
    await expect(sort).toContainText("Name");
    await simulateTranslation(sort);
    await page.locator(`aside a[href="${destination}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${destination}$`));
    await expect(page.locator("main h1"), errors.join("\n")).toBeVisible();
    const site = page.locator("main").getByRole("combobox").first();
    await expect(site).not.toBeEmpty();
    await simulateTranslation(site);
    await site.click();
    await page
      .getByRole("option", { name: "Test Mall B", exact: true })
      .click();
    await expect(site).toHaveText("Test Mall B");
    await simulateTranslation(site);
    await page.locator('aside a[href="/dashboard"]').click();
    await expect(sort).toContainText("Name");
    expect(errors).toEqual([]);
  });
}

test("translated dashboard dropdown supports changing the sort option", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/dashboard");
  const sort = page.getByRole("combobox", { name: "Sort sites" });
  await expect(sort).toContainText("Name");
  await simulateTranslation(sort);
  await sort.click();
  await page.getByRole("option", { name: /Code/ }).click();
  await expect(sort).toContainText("Code");
  await simulateTranslation(sort);
  await sort.click();
  await page.getByRole("option", { name: /Name/ }).click();
  await expect(sort).toContainText("Name");
  expect(errors).toEqual([]);
});

test("admin layout explicitly opts out of browser translation", async ({
  page,
}) => {
  await page.goto("/dashboard");
  const shell = page
    .locator('div[translate="no"]')
    .filter({ has: page.locator("aside") });
  await expect(shell).toHaveCount(1);
  await expect(page.locator("main")).toHaveJSProperty("translate", false);
  await page.getByRole("combobox", { name: "Sort sites" }).click();
  await expect(page.getByRole("option").first()).toHaveJSProperty(
    "translate",
    false,
  );
});
