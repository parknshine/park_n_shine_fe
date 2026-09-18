# Park & Shine Frontend — Developer Handover

**Written:** 6 September 2026
**Repo:** `singabytesg/park_n_shine_fe` (this repo), `main` at `0c5f151`
**Companion repo:** `singabytesg/park_n_shine_be` (backend API)
**Status:** In production. Customers, crews, and admins use it daily.

This document is for the developer taking over the frontend. It assumes you know Next.js and React but nothing about this project. Read it top to bottom once, then use it as a reference. The [README](../README.md) covers setup and scripts; this covers *why* things are the way they are and what to watch out for.

---

## 1. What the product does

Park & Shine is a waterless car-wash service operating in Indonesia. The flow:

1. A customer parks at a partner site (mall, office car park) and scans a QR code on a sign.
2. They photograph their licence plate and parking slot. The backend runs OCR and pre-fills the plate.
3. They confirm and pay (QRIS / GoPay / ShopeePay / card via Midtrans), optionally as a guest or logged in.
4. A crew member on shift claims the job from a queue, verifies the plate, takes four "before" photos, runs through a wash checklist, and marks it done.
5. The customer is notified (in-app, Web Push, WhatsApp) and can rate and tip.
6. Supervisors watch live queues, reassign jobs, handle escalations and refunds, and pull reports.

The UI is **Indonesian by default** with an English toggle. The customer and crew apps are **mobile-first PWAs**. The admin console is desktop.

---

## 2. System map

```
                         ┌──────────────────────────────────┐
  browsers ──────────────►  Cloud Run: park-n-shine (this)   │  Next.js 16, Bun build
  parknshine.net         │  middleware.ts routes by Host     │
  crew.parknshine.net    └───────────────┬──────────────────┘
  admin.parknshine.net                   │ NEXT_PUBLIC_API_URL
  (app.parknshine.net)                   ▼
                         ┌──────────────────────────────────┐
                         │  Cloud Run: park-n-shine-api      │  Hono + Prisma
                         │  api.parknshine.net               │
                         └──┬─────────┬─────────┬───────────┘
                            │         │         │
                     Cloud SQL     Redis      GCS bucket (photos)
                     (Postgres)   (SSE pub/sub, jobs)
                            
  External: Firebase Auth (parknshine-9c1c1, auth.parknshine.net), Midtrans,
            Google Cloud Vision (OCR), Sentry, Maileroo (email), api.co.id (WhatsApp)
```

GCP project id is `examineriq` (visible in the backend Cloud Build config). Region is `asia-southeast1`.

---

## 3. Day-one checklist

- [ ] Get access: GitHub org `singabytesg`, GCP project `examineriq`, Firebase project `parknshine-9c1c1`, Midtrans merchant dashboard, Sentry org, the domain registrar / DNS for `parknshine.net`. See section 12 for the full account list.
- [ ] Clone both repos side by side (not nested):
  ```bash
  git clone git@github.com:singabytesg/park_n_shine_fe.git
  git clone git@github.com:singabytesg/park_n_shine_be.git
  ```
- [ ] Install Bun. Frontend: `bun install --frozen-lockfile`. Backend: follow its README (`bun run docker:up` for Postgres + Redis, then `bun run db:setup`).
- [ ] `cp .env.example .env.local` in this repo.
- [ ] Start backend on :3001, then `bun run dev` here. To get an admin login, set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in the backend `.env` before running its seed; the seed skips admin creation otherwise.
- [ ] Run the baseline checks in section 9 and confirm you get the same results.
- [ ] Read `cloudbuild.yaml` end to end. It is the production config.
- [ ] Skim the three user manuals in `docs/user-manual/` to see what users actually see.

---

## 4. Architecture

### 4.1 One app, four surfaces

Everything is one Next.js App Router project. Surfaces are separated with route groups:

| Surface | Where | Guard |
|---|---|---|
| Landing + legal pages | `src/app/page.tsx`, `/contact`, `/support`, `/terms`, `/privacy-policy` | none |
| Customer | `src/app/(customer)/` | per-page; guest booking uses a signed token, account pages use `use-session-guard` |
| Crew | `src/app/(crew)/` wrapped by `crew-shell.tsx` | `CrewShell` checks the crew session and redirects to `/crew/login` |
| Admin | `src/app/(admin)/` + `src/app/admin/login` | `(admin)/layout.tsx` redirects to `/admin/login` if not authenticated, and bounces users away from menus they cannot access |

Route groups add no URL prefix, so in local dev all four coexist on `localhost:3000`.

### 4.2 Subdomain routing (`src/middleware.ts`)

In production each surface has its own subdomain. The middleware reads the `Host` header, maps the first label (`app`, `crew`, `admin`, `www`) to an allowlist of path prefixes, and redirects anything outside the allowlist to that surface's default path. A bare domain (fewer than three labels) or an unknown subdomain passes through untouched, which is why local dev just works.

Two things to be aware of:

- The `app` allowlist is `/`, `/q`, `/booking`, `/book`. Customer **account** routes (`/login`, `/home`, `/history`, `/account`, `/forgot-password`, `/reset-password`, `/auth/action`) are not on it. If `app.parknshine.net` is actually mapped in production, those pages would redirect to `/`. I believe the customer surface is served from the bare `parknshine.net` (the crew axios client's comment confirms `parknshine.net`, `crew.parknshine.net`, and `api.parknshine.net` share a cookie domain), so this may be moot. **Verify which hostnames are mapped to the Cloud Run service before touching this.**
- The middleware also contains an optional cookie-JWT gate controlled by `NEXT_PUBLIC_COOKIE_AUTH`. It is **off** in production on purpose. See Known issues.

### 4.3 Feature folders

Each surface has a folder under `src/features/<surface>/` with `components/`, `hooks/`, `types/`, and sometimes `utils/`. Pages in `src/app/` are thin and compose from there. Cross-surface pieces live in `src/components/shared/` and `src/lib/`.

Convention: **one hook per API concern**, named `use-<thing>.ts`, exported from the folder's `index.ts`. Hooks wrap TanStack Query and use keys from `src/lib/query-keys.ts`. Add new keys there, never inline.

### 4.4 Data layer

There are **four axios instances** in `src/lib/`:

| File | Used by | Auth |
|---|---|---|
| `axios.ts` | guest booking flow, public endpoints | `X-Booking-Token` header set per request |
| `axios-customer.ts` | logged-in customer (`/v1/me/*`) | `Authorization: Bearer` from localStorage `pns_token`. On 401 it refreshes with `pns_refresh`, and if that is dead it re-exchanges the Firebase ID token. Concurrent 401s are queued single-flight. |
| `axios-crew.ts` | crew app | `Authorization: Bearer` from localStorage `crew-token`, auto-refresh on 401 or `CREW_SESSION_EXPIRED` |
| `axios-admin.ts` | admin console | `Authorization: Bearer` from localStorage `admin-token` + `admin-refresh-token`, auto-refresh on 401 |

Tokens live in localStorage under dedicated keys (`src/lib/token-storage.ts` and the per-surface wrappers) as well as in the Zustand auth stores. The dedicated keys are what the axios request interceptors read, so a request sent before the store rehydrates is still authenticated. No client sends `withCredentials` any more, which is what lets the FE and API sit on unrelated domains. The customer endpoints no longer set cookies at all; the crew and admin endpoints still set theirs, but nothing reads them.

All of them unwrap the backend's `{ success, data }` envelope in a response interceptor, so hooks receive `data` directly. Errors are normalised by `src/lib/api-error.ts` into a typed `code` from the `API_ERROR_CODES` catalogue. User-facing messages for those codes are in `src/lib/api-messages.ts`. When the backend adds an error code, add it to both.

Cookies work cross-subdomain because the API and the apps share the registrable domain `parknshine.net`. In local dev the API is on a different port, so the cookies are set by `localhost:3001` and still sent to `localhost:3001`. That works, but it is why the middleware cookie gate cannot run locally.

### 4.5 Client state

Zustand stores in `src/store/`, all persisted to localStorage through `safe-storage.ts` (which swallows quota errors after a production incident where a full localStorage broke the app):

- `auth-store` (admin): user, role (`super_admin` | `admin`), and a `menuAccess` map of `href → write | read | none`. `src/lib/menu-access.ts` turns that into `useCanWrite()` for hiding mutating buttons.
- `crew-auth-store`: crewId, name, siteId. Has a `_hasHydrated` flag; components must wait for it before deciding to redirect.
- `customer-auth-store`: customer profile. Same hydration flag.
- `ui-store`: locale, admin sidebar state, selected sites, time-extension notification badges, the booking-detail drawer id.
- `booking-capture-store`: in-progress photo capture for the booking flow.

TanStack Query cache is also persisted (`query-client.ts` + `query-sync-storage-persister`) so the crew app has data when it comes back from the background.

### 4.6 i18n

`src/i18n/config.ts` loads four namespaces (`common`, `customer`, `crew`, `admin`) for `id` and `en` from `src/locales/`. Default and fallback are `id`. The active locale is stored in `ui-store` and the `LanguageSwitcher` component flips it. Every user-visible string must go through `t()`; the E2E suite has an `admin-translation.spec.ts` that checks for untranslated keys. Recent commits on `main` were fixing translation regressions, so this is an area to be careful in.

The root layout sets `translate="no"` and `google: notranslate`. Google Translate injecting `<font>` tags broke React reconciliation in production. Do not remove it.

### 4.7 Realtime and push

- **SSE**: `src/lib/use-realtime-events.ts` opens an `EventSource` to the backend, reconnects with backoff, and passes `sinceId` so the server can replay missed events. Event types are listed at the top of that file. `CrewShell` and `use-admin-realtime.ts` consume it and invalidate the right queries (`features/admin/utils/realtime-invalidations.ts`). Gated by `NEXT_PUBLIC_REALTIME_ENABLED`.
- **Web Push**: `src/lib/use-push-notification.ts` subscribes with the VAPID public key and posts the subscription to the backend. `public/sw.js` is a hand-written service worker that shows notifications and caches the crew app shell. `NotificationPermissionPrompt` is a soft-ask dialog gated by `NEXT_PUBLIC_PUSH_ENABLED`.
- Both flags must agree with the backend's `ENABLE_REALTIME` / `ENABLE_PUSH_NOTIFICATIONS`. The Cloud Build config pins them explicitly for that reason.

### 4.8 The only server-side route

`src/app/api/crew/photo-download/route.ts` proxies photo downloads so the browser can save them with a filename. It allowlists storage hosts to prevent SSRF and has a dev-only local-filesystem fallback restricted to `UPLOAD_DIR`. Everything else talks to the backend directly from the browser.

---

## 5. Auth flows in detail

### Customer

Two modes coexist:

1. **Guest**: scanning a QR creates a booking and the backend returns a signed **booking token**. It is kept in localStorage under `png_guest_active_booking` (`src/lib/guest-booking-pointer.ts`) and sent as `X-Booking-Token`. The pointer is cleared when the booking reaches `CLOSED`, `CANCELLED`, or `EXPIRED`. Guests can resume their active booking from the home page.
2. **Account**: Firebase Auth on the client (email/password or Google popup, `src/lib/firebase.ts`). The Firebase ID token is posted to `POST /v1/auth/session`, which returns `token` + `refreshToken` in the body. The FE stores the pair in localStorage under `pns_token` / `pns_refresh` and sends it as a Bearer header; the endpoint no longer sets cookies. The Firebase config has hardcoded fallbacks for the production project, so login works even with an empty `.env.local`. Password reset and email verification land on `/auth/action`.

### Crew

Login is **shift code + PIN** at `/crew/login` (`POST /v1/crew/sessions`), which returns a JWT tied to the shift. Sessions expire with the shift. `use-crew-session.ts` can recover a session from the stored token if the Zustand store is lost, and on logout it revokes server-side *before* clearing local state to avoid a race with the recovery effect. Crew home claims jobs with `POST /v1/crew/jobs/next`; there is a single active job at a time.

### Admin

Email/password at `/admin/login`. Roles are `super_admin` and `admin`. Super admins see everything including `/users`, where they create admins and set per-menu access. An `admin` with `read` on a menu sees it but cannot mutate; `none` hides it and the layout redirects away from it.

---

## 6. Booking lifecycle and payments

The booking state machine is in `docs/PRD_Frontend.md` section 10:

```
DRAFT → PENDING → PAID → ASSIGNED → IN_PROGRESS → READY → CLOSED
                    ↓         ↓            ↓           ↓
                EXPIRED   CANCELLED    CANCELLED    CANCELLED
                                     NEEDS_HELP
                                       STALE
```

`use-booking-status.ts` polls the booking every 5 seconds (`refetchInterval`); SSE events on top of that trigger immediate refetches. `status-badge.tsx` maps each status to colour and copy.

### Payment flow, and the temporary Snap workaround

Midtrans **Core API** channels were never activated on the merchant account, so the backend runs with `MIDTRANS_CHARGE_MODE=snap` and only `other_qris` enabled on the Snap page. To match, the frontend has `NEXT_PUBLIC_SKIP_PAYMENT_METHOD_SELECTION=true` in production, which skips the payment-method picker (`/booking/:id/payment-method`) and charges straight after confirm. The intended flow (method picker → GoPay deeplink / QRIS / ShopeePay / card 3DS) still exists in code and is what you get with the flag off.

There are two generations of payment hooks: `use-payment-action.ts` and `use-payment-action-v2.ts`. V2 is current and defines its own confirm payload type on purpose. When Core API is activated on Midtrans, flip both the backend `MIDTRANS_CHARGE_MODE` and this flag, then test every channel in sandbox before removing the workaround code.

Card payments redirect through `/booking/:id/pay/card` and come back via `/booking/card-callback`. Other channels return through `/booking/:id/payment-callback`. `use-payment-auto-poll.ts` polls the backend after return until the webhook lands. Tips after the wash go through `use-tip-payment.ts` and `use-check-tip.ts`.

Public settings (`GET /v1/settings`, `use-public-settings.ts`) control which payment methods are shown, the WhatsApp number, average cleaning minutes, promo banner images, and whether loyalty is enabled. Admins edit these on `/settings`.

---

## 7. Admin console tour

`/dashboard` is the live queue across all sites with a booking-detail drawer that can reassign, override status, refund with a reason code, and approve crew time-extension requests. `/sites` manages sites, their QR codes (with a print layout at `/sites/:siteId/qr/:qrId/print`), and shifts. `/crew-members` manages crew and PINs. `/reports` has jobs (with XLSX export), customers, tips, and crew disbursements. `/audit` is the audit trail. `/inbox` is a customer chat inbox; the backend feeds it from its WhatsApp webhook (api.co.id). `/email` sends marketing email through Maileroo. `/testimonials` curates landing-page testimonials. `/settings` is the public-settings editor.

---

## 8. Environments and deployment

There is **one environment: production**. There is no staging. Midtrans sandbox and a local backend are the only ways to test payments safely.

### How a deploy happens

Push to `main` → Cloud Build trigger runs `cloudbuild.yaml` → Docker build with Bun → push to Artifact Registry `asia-southeast1-docker.pkg.dev/examineriq/park-n-shine/app` → `gcloud run deploy park-n-shine` with the SHA-tagged image. The build runs on an `E2_HIGHCPU_8` machine with a 30 minute timeout. The trigger itself is configured in the Cloud Build console, not in the repo.

There are **no tests in the pipeline**. A broken push to `main` deploys a broken build. Run the section 9 checks before pushing.

### Configuration

All `NEXT_PUBLIC_*` values live as substitutions at the top of `cloudbuild.yaml` and are passed as `--build-arg`, because Next inlines them at build time. To change one, edit the file and push. Two secrets (`ADMIN_JWT_SECRET`, `CREW_JWT_SECRET`) are mounted from Secret Manager but are only read when the cookie gate is on.

### Rollback

Cloud Run keeps previous revisions. In the console, route 100% traffic to the previous revision. Every image is also tagged with its short SHA if you need to redeploy an older one.

### Domains

Production is `parknshine.net`. `docs/DEPLOY.md` and the middleware comments still say `park-shine.sg`, which was the original plan. The middleware does not care about the base domain, only the first label, so this is cosmetic.

### Backend

The backend deploys the same way from its own repo (`park_n_shine_be/cloudbuild.yaml`) to Cloud Run service `park-n-shine-api` with Cloud SQL instance `examineriq:asia-southeast1:parknshine`. Scheduled jobs run via Cloud Scheduler hitting `POST /v1/internal/jobs/:jobName` with an `X-Cron-Secret` header.

---

## 9. Verified baseline (as of this handover)

Run these after cloning to make sure your setup matches. Results below were produced on `main` at `0c5f151` with Bun 1.3.14.

| Check | Command | Result |
|---|---|---|
| Typecheck | `bun run typecheck` | **clean** |
| Lint | `bun run lint` | 1 error, 18 warnings. The error is a `require()` in `src/middleware.test.ts:186`. The warnings are unused vars and `<img>` usage. |
| Unit tests | `bun run test` | 125 pass, 1 fail. `src/app/(crew)/crew/home/page.test.ts` fails to load because it imports the page component, which pulls `react-hot-toast` and needs a DOM. |
| E2E | `bun run test:e2e` | Not run here. Needs the backend on :3001 and Playwright browsers installed. |

`bunfig.toml` roots `bun test` at `src/` so it ignores the Playwright specs in `e2e/` and any nested backend checkout. If you see hundreds of tests running, that scoping has been lost.

`npm ci` fails because `package-lock.json` is stale. Bun and `bun.lock` are canonical. You can delete `package-lock.json`.

---

## 10. Git state and unmerged work

| Branch | State | Recommendation |
|---|---|---|
| `main` | production | protect it; consider requiring PRs |
| `feat/promo-wash-signup` | 59 files differ from `main`. Contains promo-code admin CRUD, customer promo input, signup discount, and loyalty settings UI (commits dated 27 Aug 2026). It shares **no common ancestor** with `main` (`git merge-base` returns nothing) because `main`'s history was rewritten on 28 Aug, so `git merge` will refuse with "unrelated histories". | Cherry-pick or diff-apply the promo work onto a fresh branch from `main`. Confirm with the product owner whether the promo/loyalty feature is still wanted before investing. |
| `feat/customer-firebase-auth` | Stale. Its Firebase auth work was already merged into `main` through a different history; the diff against `main` is mostly deletions. | Delete. |
| `feat--custom-payment-page` | Fully merged. | Delete. |

History note: `main` was force-pushed / re-merged around 28 Aug 2026 (see the "Merge github.com:singabytesg/park_n_shine_fe" commit). That is why the feature branches show as hundreds of commits behind. Do not try to reconcile the histories; treat `main` as the only truth.

Almost all 248 commits are by a single developer. Commit messages are terse (`fix: issue translation`). There is no changelog; `git log` is the changelog.

---

## 11. Known issues, gotchas, and tech debt

Ordered roughly by how likely they are to bite you.

1. **Cookie auth middleware must stay off.** `NEXT_PUBLIC_COOKIE_AUTH=true` makes `middleware.ts` verify the crew/admin cookie JWT on every navigation and 307 to login if invalid. When a crew cookie expired mid-shift, the redirect to `/crew/login` fought with the client-side session recovery and trapped crews in a spinner loop. It was turned off; client-side shells plus API auth protect everything. If you want a server-side gate, fix the loop first.

2. **Admin layout rehydration race.** On a hard reload of any `(admin)` URL, the first render sees `isAuthenticated === false` (Zustand has not rehydrated from localStorage yet), bounces to `/admin/login`, which then sees `true` and bounces to `/dashboard`. Net effect: deep-linking to `/sites` on a full reload can land you on `/dashboard`. Client-side `<Link>` navigation is unaffected. The customer and crew stores solved this with a `_hasHydrated` flag; the admin `auth-store` does not have one yet.

3. **The Snap payment workaround** (section 6) is temporary and has flags in three places: backend `MIDTRANS_CHARGE_MODE`, backend `MIDTRANS_ENABLED_PAYMENTS`, frontend `NEXT_PUBLIC_SKIP_PAYMENT_METHOD_SELECTION`. Keep them in sync.

4. **Realtime/push flags must match the backend.** If the frontend has push enabled and the backend does not, subscriptions silently fail. `cloudbuild.yaml` has comments about this.

5. **localStorage quota.** The TanStack persister plus five Zustand stores can fill localStorage on long-lived crew devices. `safe-storage.ts` prevents crashes but data may stop persisting. There is a commit "fix issue localstorage full" from 3 Sep 2026; keep an eye on Sentry for `QuotaExceededError`.

6. **CSP is hand-maintained** in `next.config.ts`. Adding any third-party script, image host, or API origin requires editing it, or it will be blocked silently in production (dev allows `unsafe-eval` and localhost). Sentry ingest and Midtrans are already there.

7. **Sentry sourcemap upload is disabled** (`sourcemaps.disable: true`), so production stack traces are minified. Enabling it needs a `SENTRY_AUTH_TOKEN` in Cloud Build.

8. **Unit test and lint failures** listed in section 9 are pre-existing. Neither blocks the build.

9. **Leftover scratch files** at the repo root and in `scripts/`: `scratch_shoot.mjs`, `tmp-admin-screenshots.mjs`, `tmp-debug-nav.mjs`, `scripts/tmp-crew-edge-screenshots.mjs`, `scripts/tmp-manual-screenshots.mjs`. They generated the user-manual screenshots, contain the previous developer's absolute paths, and are safe to delete. One of them hardcodes a `CRON_SECRET` value; see section 13.

10. **`package.json` is still named `windsurf-project`.** Cosmetic. Renaming it requires regenerating `bun.lock`.

11. **`docs/DEPLOY.md` is partly outdated**: wrong domain, and it predates Cloud Build. Sections on Vercel and self-hosted VM are still accurate as alternatives. `nginx.conf` is only for the VM option.

12. **Google Translate breaks the app** if the `notranslate` meta is removed (section 4.6).

13. **Docs are bilingual.** The PRD and sprint plan are in Indonesian (`SPRINT_PLANNING_EN.md` is the English sprint plan). Code comments are mostly English with some Indonesian. UI copy is Indonesian-first.

14. **No staging, no CI.** Every push to `main` is a production deploy. Adding a GitHub Actions job for lint + typecheck + unit tests is cheap and worth doing early. The E2E README has an opt-in job you can start from.

---

## 12. Accounts and services to transfer

Make sure you (or the business owner) hold admin access to each of these before the previous developer's access is removed:

| Service | What it is used for | Identifier |
|---|---|---|
| GitHub org `singabytesg` | both repos | `park_n_shine_fe`, `park_n_shine_be` |
| Google Cloud project | Cloud Run, Cloud Build, Artifact Registry, Cloud SQL, Secret Manager, Cloud Scheduler, GCS, Cloud Vision | `examineriq` |
| Firebase project | customer auth (email + Google) | `parknshine-9c1c1`, auth domain `auth.parknshine.net` |
| Midtrans | payments | merchant dashboard (production + sandbox) |
| Sentry | error monitoring, frontend + backend | org `o4511527441006592` |
| Maileroo | marketing email from the admin console | sending domain for `parknshine.net` |
| api.co.id | WhatsApp outbound + inbound (admin inbox) | API key + webhook secret |
| Domain registrar / DNS | `parknshine.net` and subdomains | check where the nameservers point |
| Cloudinary | legacy/optional photo storage (`STORAGE_PROVIDER=cloudinary`) | only if still in use |

---

## 13. Security notes for the new owner

None of these are emergencies, but rotate them as part of the handover so the previous developer no longer holds live credentials:

- **Backend `cloudbuild.yaml`** has a Maileroo API key committed as a plaintext substitution. Move it to Secret Manager and rotate the key.
- **`scripts/tmp-crew-edge-screenshots.mjs`** in this repo hardcodes a `CRON_SECRET` value. Delete the file and rotate the backend `CRON_SECRET` (also check the fallback hardcoded in the backend's `InternalJobsController.ts`).
- **Backend working directories** may contain GCP service-account JSON files (`examineriq-*.json`). They are gitignored but exist on disk in the previous developer's checkout. Revoke those service-account keys in IAM and create new ones if needed.
- The Firebase web API key, VAPID public key, and Sentry DSN in `cloudbuild.yaml` and `src/lib/firebase.ts` are public client config by design. They are fine to leave, but restrict the Firebase API key to your domains in the Google Cloud console.
- `NEXT_PUBLIC_COOKIE_AUTH` secrets in Secret Manager (`parknshine-crew-jwt-secret`, `parknshine-admin-jwt-secret`) must equal the backend's `CREW_JWT_SECRET` / `ADMIN_JWT_SECRET`. If you rotate one side, rotate both.

---

## 14. Suggested first month

1. Add a CI job for `lint`, `typecheck`, and `test`. Fix the one lint error and the one failing unit test so CI is green.
2. Fix the admin rehydration race by adding `_hasHydrated` to `auth-store`, mirroring `crew-auth-store`.
3. Decide the fate of `feat/promo-wash-signup` with the product owner. Delete the other two branches.
4. Rotate the credentials in section 13.
5. Delete the scratch scripts and `package-lock.json`.
6. Enable Sentry sourcemaps so you can read production errors.
7. Check with Midtrans whether Core API channels are now activated; if so, plan the removal of the Snap workaround.

---

## 15. Where to look for things

| Question | Look at |
|---|---|
| What does the backend expect for endpoint X? | backend `src/application/controllers/*Controller.ts`, or `/swagger` on a running backend |
| What error codes exist? | `src/lib/api-error.ts` (frontend) and backend `src/application/errors/` |
| What are all the query keys? | `src/lib/query-keys.ts` |
| Which env vars exist and what they do? | README "Environment variables", `.env.example`, `Dockerfile` ARGs |
| Booking states and what each surface shows | `docs/PRD_Frontend.md` section 10 |
| Original functional requirements (FR-01 to FR-23) | `docs/PRD_Frontend.md` |
| What the app looks like | `docs/user-manual/*.pdf` |
| How to write an E2E test | `e2e/README.md`, `e2e/fixtures.ts` |
| Mock API shapes | `mock-server.ts`, `src/lib/api-response-examples.ts` |
| Production config | `cloudbuild.yaml`, `Dockerfile`, `next.config.ts` (headers + CSP) |
