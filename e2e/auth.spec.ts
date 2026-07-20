import { test, expect } from "./fixtures";

/**
 * Smoke tests for the customer auth surface (`/login`).
 * Validates form structure, mode toggle, and client-side gating of the submit
 * button — without hitting the backend (no real credentials are submitted).
 *
 * beforeEach pins locale=ID so copy assertions are deterministic.
 */

// Anchored regex avoids matching the password show/hide toggle button, whose
// aria-label is "Tampilkan kata sandi" / "Show password" (contains the words
// but is not equal to the field label).
const PASSWORD_FIELD = /^(kata sandi|password)$/i;
const PHONE_FIELD = /^(nomor telepon|phone number)$/i;
const LOGIN_SUBMIT = /^(masuk|sign in)$/i;
const REGISTER_SUBMIT = /^(daftar|sign up|membuat akun|create)$/i;

test.describe("Customer login page", () => {
  test.beforeEach(async ({ page, setLocale }) => {
    await setLocale("id");
    await page.goto("/login");
  });

  test("renders the login form with email + password inputs", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Selamat datang kembali" }),
    ).toBeVisible();

    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByRole("textbox", { name: PASSWORD_FIELD })).toBeVisible();

    // Google button present
    await expect(
      page.getByRole("button", { name: /lanjut dengan google|continue with google/i }),
    ).toBeVisible();

    // Submit button exists and starts disabled (empty email + password)
    await expect(page.getByRole("button", { name: LOGIN_SUBMIT })).toBeDisabled();
  });

  test("submit button enables once email and password are filled", async ({ page }) => {
    const submit = page.getByRole("button", { name: LOGIN_SUBMIT });
    await expect(submit).toBeDisabled();

    await page.getByLabel("Email").fill("tester@example.com");
    await expect(submit).toBeDisabled(); // still — no password yet

    await page.getByRole("textbox", { name: PASSWORD_FIELD }).fill("supersecret");
    await expect(submit).toBeEnabled();
  });

  test("toggles to register mode and reveals the phone field", async ({ page }) => {
    // Register toggle button ("Daftar" in ID) — the inline toggle, not the submit btn
    const toRegister = page
      .getByRole("button", { name: /^daftar$/i })
      .and(page.locator("button:not([type=submit])"));
    await toRegister.click();

    // Heading switches to register copy
    await expect(page.getByRole("heading", { name: "Buat akun" })).toBeVisible();

    // Phone field appears (register-only per src/app/(customer)/login/page.tsx)
    await expect(page.getByRole("textbox", { name: PHONE_FIELD })).toBeVisible();

    // Submit is gated on email + password + phone
    const submit = page.getByRole("button", { name: REGISTER_SUBMIT });
    await page.getByLabel("Email").fill("newuser@example.com");
    await page.getByRole("textbox", { name: PASSWORD_FIELD }).fill("supersecret");
    await expect(submit).toBeDisabled();
    await page.getByRole("textbox", { name: PHONE_FIELD }).fill("081234567890");
    await expect(submit).toBeEnabled();
  });

  test("forgot-password link only appears in login mode", async ({ page }) => {
    // ID copy is "Lupa password?" (not "kata sandi"), EN is "Forgot password?"
    const forgot = page.getByRole("link", { name: /lupa password|forgot password/i });
    await expect(forgot).toBeVisible();

    // Switch to register → link should disappear
    await page
      .getByRole("button", { name: /^daftar$/i })
      .and(page.locator("button:not([type=submit])"))
      .click();
    await expect(forgot).toHaveCount(0);

    // Back to login → link reappears
    await page
      .getByRole("button", { name: /^masuk$/i })
      .and(page.locator("button:not([type=submit])"))
      .click();
    await expect(forgot).toBeVisible();
  });

  test("forgot-password link points to /forgot-password", async ({ page }) => {
    const forgot = page.getByRole("link", { name: /lupa password|forgot password/i });
    await expect(forgot).toHaveAttribute("href", "/forgot-password");
  });
});
