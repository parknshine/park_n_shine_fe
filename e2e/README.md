# End-to-End Tests (Playwright)

Browser + mobile E2E suite for the Park & Shine Next.js app.

## Quick start

```bash
# from park_n_shine/  (project root)
bun run test:e2e            # run all specs headless across all projects
bun run test:e2e:ui         # interactive UI mode (watch + time travel)
bun run test:e2e:headed     # headed browsers (see them run)
bun run test:e2e:debug      # step-through with inspector
bun run test:e2e:report     # open last HTML report
bun run test:e2e:codegen    # record clicks → spec code against :3000
```

> The first run may take a while — Playwright boots the Next.js dev server
> automatically via the `webServer` block in `playwright.config.ts`. If you
> already have `bun run dev` running on :3000, Playwright reuses it locally.

## Layout

```
park_n_shine/
├── playwright.config.ts     # projects, webServer, reporters, timeouts
└── e2e/
    ├── tsconfig.json        # scoped TS config (Next.js build excludes *.spec.ts)
    ├── fixtures.ts          # custom test/expect: customerPage, setLocale
    ├── landing.spec.ts      # public marketing page smoke tests
    ├── auth.spec.ts         # /login form structure, mode toggle, gating
    └── routes.spec.ts       # public route availability (HTTP < 500)
```

## Browser + device projects

Defined in `playwright.config.ts`:

| Project | Use for |
|---|---|
| `desktop-chromium` | default desktop smoke |
| `desktop-firefox` | cross-engine regressions |
| `desktop-webkit` | Safari rendering differences |
| `mobile-safari` | iPhone 14 viewport (mobile-first PWA!) |
| `mobile-chrome` | Pixel 7 viewport |

Run one project:

```bash
bunx playwright test --project=mobile-safari
bunx playwright test --project=desktop-chromium auth.spec.ts
```

## Fixtures

Import from `./fixtures`, not directly from `@playwright/test`:

```ts
import { test, expect } from "./fixtures";

test("locale-aware check", async ({ customerPage, setLocale }) => {
  await setLocale("en");        // seed localStorage before next goto
  await customerPage.goto("/login");
  await expect(customerPage.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});
```

- `customerPage` — fresh `Page` already navigated to `/`.
- `setLocale("id" | "en")` — seeds the `ui` zustand store so i18next starts in
  the chosen locale. Call it before `page.goto(...)` for the seed to apply on
  first load; call it then `page.reload()` to flip a page that's already open.

## Adding authenticated tests

Customer auth persists `localStorage["token"]` + the zustand auth store. For
specs that need a logged-in session, capture a `storageState` once and reuse it:

```ts
// e2e/auth.setup.ts (wire into playwright.config.ts `projects` as a setup dep)
import { test as setup, expect } from "@playwright/test";

setup("authenticate as customer", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL!);
  await page.getByLabel(/password/i).fill(process.env.E2E_USER_PASSWORD!);
  await page.getByRole("button", { name: /masuk|sign in/i }).click();
  await page.waitForURL("**/home");
  await page.context().storageState({ path: "e2e/.auth/customer.json" });
});
```

Then reference it in a project:

```ts
{
  name: "authenticated-customer",
  dependencies: ["setup"],
  use: { ...devices["iPhone 14"], storageState: "e2e/.auth/customer.json" },
}
```

The `.auth/` folder is gitignored. Never commit captured tokens.

## Pointing at a different backend / URL

This project has **no staging environment** — tests always run against a
locally-booted dev server on `:3100` (auto-started by Playwright's `webServer`).
Two knobs you may still need:

```bash
# Point the frontend at a non-default backend (e.g. a teammate's API, or the
# local backend on its real port). Falls back to http://localhost:3001.
NEXT_PUBLIC_API_URL=http://localhost:3001 bun run test:e2e

# Reuse a server you already started instead of booting a new one.
# Useful when iterating with `bun run dev -- --port 3100` in another terminal.
E2E_BASE_URL=http://localhost:3100 bun run test:e2e
```

## Running in CI

> Per `AGENTS.md`, this project deliberately has **no CI test step** — run
> `bun run test:e2e` locally before pushing. The block below is opt-in only.

`process.env.CI` automatically enables: retries (2), parallel workers (4),
`forbidOnly`, and disables `reuseExistingServer` so each CI run boots its own
isolated dev server. Note: the smoke suite currently only covers public routes
and the auth form, so it does not need the backend up; if you add tests that hit
authenticated/customer endpoints, CI must also start `park-n-shine-api` (Postgres
+ Redis via `bun run docker:up`) before this step.

Opt-in GitHub Actions job:

```yaml
e2e:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: oven-sh/setup-bun@v2
    - run: bun install
    - run: bunx playwright install --with-deps
    - run: bun run test:e2e
    - uses: actions/upload-artifact@v4
      if: ${{ !cancelled() }}
      with:
        name: playwright-report
        path: park_n_shine/playwright-report/
        retention-days: 14
```

## Troubleshooting

- **`webServer` timeout on first run** — Next.js cold start can take 60s+; the
  config allows 120s. Run `bun run dev` once to warm the build cache.
- **Flaky i18n assertions** — always `await setLocale(...)` before asserting on
  copy. Browser language detection otherwise picks ID or EN based on the
  Playwright `locale` setting.
- **`Element ... not visible` on mobile projects** — the app is mobile-first
  but the desktop landing page has different nav. Scope selectors with
  `.first()` or filter by project via `test.skip(!isMobile, ...)`.
