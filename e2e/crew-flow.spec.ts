import { test, expect } from "./fixtures";

/**
 * Crew Operator App E2E (smoke + auth-guard logic).
 *
 * Scope: deliberately backend-independent (no staging env; see e2e/README.md).
 * Crew login itself needs a live shift-code/PIN check against the API, so we
 * don't attempt an authenticated session here — instead we validate:
 *   - the /crew/login form (structure, submit gating, i18n toggle)
 *   - the CrewShell auth guard: unauthenticated visits to any (crew) route
 *     redirect to /crew/login
 *
 * setLocale seeds the same `ui` zustand persist key the customer app uses,
 * since the crew app shares the I18nProvider/locale store.
 */

const LOGIN_TITLE = /Masuk ke shift kamu|Sign in to your shift/i;
const SHIFT_CODE_LABEL = /Kode Shift|Shift Code/i;
const PIN_LABEL = /^PIN$/i;
const SIGN_IN_BUTTON = /^Masuk$|^Sign In$/i;
const FOOTER_NOTE = /Khusus crew — bukan portal pelanggan|Crew access only/i;
const LANG_TOGGLE = /Switch to English|Ganti ke Bahasa Indonesia/i;

// ─────────────────────────────────────────────────────────────────────────────
// 1. Crew login page (/crew/login)
// ─────────────────────────────────────────────────────────────────────────────
test.describe("Crew login page", () => {
  test("renders title, shift code + PIN fields, and footer note", async ({
    page,
    setLocale,
  }) => {
    await setLocale("id");
    await page.goto("/crew/login");

    await expect(
      page.getByRole("heading", { name: LOGIN_TITLE }),
    ).toBeVisible();
    await expect(page.getByLabel(SHIFT_CODE_LABEL)).toBeVisible();
    await expect(page.getByLabel(PIN_LABEL)).toBeVisible();
    await expect(page.getByText(FOOTER_NOTE)).toBeVisible();
  });

  test("submit button stays disabled until a 6-digit shift code and PIN are entered", async ({
    page,
    setLocale,
  }) => {
    await setLocale("id");
    await page.goto("/crew/login");

    const submit = page.getByRole("button", { name: SIGN_IN_BUTTON });
    await expect(submit).toBeDisabled();

    await page.getByLabel(SHIFT_CODE_LABEL).fill("123456");
    await expect(submit).toBeDisabled();

    await page.getByLabel(PIN_LABEL).fill("1234");
    await expect(submit).toBeEnabled();
  });

  test("shift code field strips non-digits and caps at 6 characters", async ({
    page,
    setLocale,
  }) => {
    await setLocale("id");
    await page.goto("/crew/login");

    // Type character-by-character (not .fill) so each keystroke round-trips
    // through the onChange handler individually, the same way a real user's
    // input would — .fill() sets the whole string in one native op and gets
    // truncated by the input's maxLength=6 attribute before React ever sees it.
    const shiftCode = page.getByLabel(SHIFT_CODE_LABEL);
    await shiftCode.pressSequentially("ab12cd34ef");
    await expect(shiftCode).toHaveValue("1234");
  });

  test("language switcher flips login copy", async ({ page, setLocale }) => {
    await setLocale("id");
    await page.goto("/crew/login");

    await expect(
      page.getByRole("heading", { name: LOGIN_TITLE }).first(),
    ).toBeVisible();

    await page.getByRole("button", { name: LANG_TOGGLE }).click();

    await expect(
      page.getByRole("heading", { name: /Sign in to your shift/i }),
    ).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. CrewShell auth guard — unauthenticated visits redirect to /crew/login
// ─────────────────────────────────────────────────────────────────────────────
test.describe("Crew auth guard", () => {
  const PROTECTED_ROUTES: ReadonlyArray<string> = [
    "/crew",
    "/crew/home",
    "/crew/jobs/test-job-id",
  ];

  for (const route of PROTECTED_ROUTES) {
    test(`${route} redirects to /crew/login without a session`, async ({
      page,
    }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(500);

      await page.waitForURL(/\/crew\/login/, { timeout: 15_000 });
      await expect(page).toHaveURL(/\/crew\/login/);
    });
  }
});
