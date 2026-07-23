import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

/**
 * Push notification soft-ask prompt E2E.
 *
 * Seeds the persisted crew-auth zustand store directly (same technique as
 * e2e/fixtures.ts's setLocale) since a live shift-code/PIN login isn't
 * available in this backend-independent suite.
 */
async function seedCrewAuth(page: Page) {
  await page.addInitScript(() => {
    const payload = {
      state: {
        crewId: "e2e-crew-id",
        crewName: "E2E Crew",
        siteId: "e2e-site-id",
        isAuthenticated: true,
      },
      version: 0,
    };
    window.localStorage.setItem("crew-auth", JSON.stringify(payload));
  });
}

test.describe("Push notification soft-ask prompt", () => {
  test("shows for an authenticated crew session and can be dismissed permanently", async ({
    page,
    setLocale,
  }) => {
    await setLocale("id");
    await seedCrewAuth(page);
    await page.goto("/crew/home");

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Aktifkan Notifikasi")).toBeVisible();

    await dialog.getByRole("button", { name: "Nanti saja" }).click();
    await expect(dialog).toBeHidden();

    await page.reload();
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("does not show for an unauthenticated visitor", async ({ page, setLocale }) => {
    await setLocale("id");
    await page.goto("/");

    await expect(page.getByRole("dialog")).toBeHidden();
  });
});
