/**
 * Custom Playwright fixtures for Park & Shine E2E suite.
 *
 * Extends the base `test`/`expect` so every spec gets project-aware helpers:
 *   - `customerPage`  → fresh page pre-navigated to `/` with locale pinned to
 *                       `id` (the app's default). Override with `setLocale`.
 *   - `setLocale(id|en)` → seeds the persisted zustand UI store so i18next boots
 *                       in the chosen language. Must be called BEFORE the
 *                       `page.goto(...)` you want it to apply to, or before a
 *                       `page.reload()` to flip an already-loaded page.
 *
 * Why pin locale: the app's `I18nProvider` falls back to `navigator.language`
 * detection when no locale is stored. Playwright sets the browser locale to
 * `en-US`, so copy would otherwise flip from ID → EN after hydration, making
 * text assertions flaky under parallel execution.
 *
 * Specs should `import { test, expect } from "./fixtures"` instead of
 * `@playwright/test`.
 */
import { test as base, expect, type Page } from "@playwright/test";

export type Locale = "id" | "en";

export interface AppFixtures {
  customerPage: Page;
  setLocale: (locale: Locale) => Promise<void>;
}

/**
 * Persist the locale the way `useUIStore` (zustand persist) does.
 * Storage key is `ui` per `src/store/ui-store.ts`; `I18nProvider` reads
 * `state.locale` from there and calls `rehydrate()` on mount.
 *
 * Uses `addInitScript` so the value lands in localStorage BEFORE any React
 * code runs on the next navigation/reload.
 */
async function applyLocale(page: Page, locale: Locale) {
  await page.addInitScript((value) => {
    try {
      const raw = window.localStorage.getItem("ui");
      const parsed = raw ? JSON.parse(raw) : {};
      parsed.state = { ...(parsed.state ?? {}), locale: value };
      parsed.version = parsed.version ?? 0;
      window.localStorage.setItem("ui", JSON.stringify(parsed));
    } catch {
      // ignore — store falls back to defaults
    }
  }, locale);
}

export const test = base.extend<AppFixtures>({
  customerPage: async ({ page }, fixtureValue) => {
    // Seed ID (app default) so copy assertions are deterministic.
    await applyLocale(page, "id");
    await page.goto("/");
    await fixtureValue(page);
  },

  setLocale: async ({ page }, fixtureValue) => {
    await fixtureValue(async (locale: Locale) => {
      await applyLocale(page, locale);
    });
  },
});

export { expect };
