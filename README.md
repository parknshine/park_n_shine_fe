# Park & Shine — Frontend

Web frontend for **Park & Shine**, a waterless car-wash service that comes to the customer's parking spot. Customers scan a site QR code, photograph their plate, pay, and get notified when the car is clean. Crews work jobs from a mobile PWA. Supervisors run everything from an admin console.

This is a single Next.js app that serves **four surfaces**, split by subdomain in production and by path in local dev:

| Surface | Route group | Local path | Production host |
|---|---|---|---|
| Landing / marketing | `src/app/page.tsx`, `/contact`, `/support`, `/terms`, `/privacy-policy` | `/` | `parknshine.net` |
| Customer app (PWA) | `src/app/(customer)` | `/q/:qrId`, `/book`, `/booking/:id`, `/login`, `/home`, `/history`, `/account` | `app.parknshine.net` |
| Crew app (PWA) | `src/app/(crew)` | `/crew/login`, `/crew/home`, `/crew/jobs/:jobId/*` | `crew.parknshine.net` |
| Admin console | `src/app/(admin)` + `src/app/admin` | `/admin/login`, `/dashboard`, `/sites`, `/reports`, ... | `admin.parknshine.net` |

The backend API lives in a separate repo: `singabytesg/park_n_shine_be` (Hono + Prisma + Postgres + Redis).

> **Taking over this project?** Read [`docs/HANDOVER.md`](docs/HANDOVER.md) first. It covers architecture, auth flows, environments, deployment, known issues, and the branches that still hold unmerged work.

---

## Tech stack

- **Next.js 16** (App Router, React 19, React Compiler enabled, `output: "standalone"`)
- **TypeScript** (strict), **Tailwind CSS 4**, Radix UI primitives, `lucide-react`
- **TanStack Query 5** for server state (with localStorage persistence), **Zustand 5** + immer for client state
- **react-hook-form** + **zod** for forms
- **i18next** for ID / EN localisation (Indonesian is the default)
- **Firebase Auth** (email/password + Google) for customer accounts
- **Midtrans** hosted payments (QRIS, GoPay, ShopeePay, card)
- **Server-Sent Events** for realtime updates, **Web Push** via a custom service worker (`public/sw.js`)
- **Sentry** for error monitoring
- **Playwright** for E2E, **bun test** for unit tests
- **Bun** as the package manager and runtime (the Dockerfile builds with Bun; `bun.lock` is the source of truth)

---

## Prerequisites

- [Bun](https://bun.sh) 1.3+ (`curl -fsSL https://bun.sh/install | bash`)
- Node 20+ (only needed for the production runtime image and Playwright)
- The backend API running locally on `http://localhost:3001` (see the backend repo's README), **or** the bundled mock server (see below)

---

## Getting started

```bash
# 1. Install dependencies
bun install --frozen-lockfile

# 2. Create your local env file
cp .env.example .env.local
# edit NEXT_PUBLIC_API_URL if your backend is not on :3001

# 3. Run the dev server
bun run dev
```

Open <http://localhost:3000>. In local dev there is no subdomain, so every surface is reachable by path:

- Customer: <http://localhost:3000/> then scan/enter a QR, or <http://localhost:3000/login>
- Crew: <http://localhost:3000/crew/login>
- Admin: <http://localhost:3000/admin/login>

### Running without the real backend

A self-contained mock API exists for the customer and crew flows:

```bash
bun mock-server.ts            # listens on :4000
NEXT_PUBLIC_API_URL=http://localhost:4000 bun run dev
```

It supports QR resolution, booking creation, photo upload (fake OCR), confirm/payment, crew login, job claim, verify, and before-photos. Use `POST /v1/mock/advance/:id` to move a booking through its statuses. It does **not** cover admin endpoints or customer accounts.

---

## Scripts

| Command | What it does |
|---|---|
| `bun run dev` | Next.js dev server on :3000 |
| `bun run build` | Production build (standalone output) |
| `bun run start` | Serve the production build |
| `bun run lint` | ESLint (next/core-web-vitals + typescript) |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run test` | Unit tests (`bun test`, rooted at `src/` via `bunfig.toml`) |
| `bun run test:e2e` | Playwright suite, boots its own dev server on :3100 |
| `bun run test:e2e:ui` | Playwright UI mode |
| `bun run test:e2e:headed` | Playwright with visible browsers |
| `bun run test:e2e:debug` | Playwright inspector |
| `bun run test:e2e:report` | Open the last HTML report |
| `bun run test:e2e:codegen` | Record a spec against :3100 |

Playwright needs browsers installed once: `bunx playwright install --with-deps`.

See [`e2e/README.md`](e2e/README.md) for fixtures, device projects, and how to add authenticated specs.

---

## Environment variables

All frontend config is `NEXT_PUBLIC_*` and is **inlined at build time**. Changing a value requires a rebuild (in Cloud Build they are passed as `--build-arg`). Copy `.env.example` to `.env.local` for local dev.

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | yes | Backend base URL, e.g. `http://localhost:3001` |
| `NEXT_PUBLIC_FIREBASE_*` | yes for customer login | Firebase web config (`API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, `STORAGE_BUCKET`, `MESSAGING_SENDER_ID`, `APP_ID`, `MEASUREMENT_ID`). Falls back to the `parknshine-9c1c1` project if unset. |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | yes for card payments | Midtrans client key (Snap / 3DS) |
| `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION` | no | `true` for production Midtrans, else sandbox |
| `NEXT_PUBLIC_SKIP_PAYMENT_METHOD_SELECTION` | no | **Temporary** workaround, mirrors backend `MIDTRANS_CHARGE_MODE=snap`. Skips the payment-method picker. Currently `true` in prod. |
| `NEXT_PUBLIC_REALTIME_ENABLED` | no | Enable SSE realtime updates (default `true` in Docker) |
| `NEXT_PUBLIC_PUSH_ENABLED` | no | Enable the Web Push soft-ask prompt |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | if push enabled | Must match the backend's `VAPID_PUBLIC_KEY` |
| `NEXT_PUBLIC_PAYMENT_POLL_INTERVAL_MS` | no | Override payment status polling interval |
| `NEXT_PUBLIC_SENTRY_DSN` | no | Sentry is a no-op when unset |
| `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | no | Defaults to `NODE_ENV` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | no | Fallback support number if `/v1/settings` is unreachable |
| `NEXT_PUBLIC_COOKIE_AUTH` | no | Middleware cookie-JWT gate for `/admin` and `/crew`. **Keep `false`** (see HANDOVER, Known issues). |
| `ADMIN_JWT_SECRET`, `CREW_JWT_SECRET` | only if `COOKIE_AUTH=true` | Server-side secrets used by the middleware to verify cookies. Injected from Secret Manager in Cloud Run. |
| `UPLOAD_DIR` | dev only | Local upload dir for the crew photo-download proxy |

---

## Project layout

```
src/
├── app/                    # Next.js App Router
│   ├── (customer)/         # customer surface (route group, no URL prefix)
│   ├── (crew)/             # crew surface, all under /crew
│   ├── (admin)/            # admin pages (/dashboard, /sites, /reports, ...)
│   ├── admin/login         # admin login (outside the guarded group)
│   ├── crew/login          # crew login (outside the guarded group)
│   ├── api/crew/photo-download   # only server route: proxies photo downloads
│   ├── contact, support, terms, privacy-policy   # marketing pages
│   ├── layout.tsx          # providers: i18n, theme, react-query, PWA, toaster
│   └── page.tsx            # landing page
├── features/
│   ├── customer/           # components, hooks, types, utils per surface
│   ├── crew/
│   └── admin/
├── components/
│   ├── ui/                 # shadcn-style primitives (button, dialog, data-table, ...)
│   ├── shared/             # cross-surface widgets (app shell, language switcher, offline banner, ...)
│   ├── forms/
│   └── providers/
├── lib/
│   ├── axios*.ts           # 4 axios clients: base, customer, crew, admin
│   ├── api-error.ts        # error code catalogue + normaliser
│   ├── query-keys.ts       # every TanStack Query key
│   ├── firebase.ts         # Firebase client init
│   ├── use-realtime-events.ts   # SSE hook with reconnect + replay
│   ├── use-push-notification.ts # Web Push subscribe
│   ├── menu-access.ts      # admin RBAC (super_admin / admin + per-menu read/write)
│   └── safe-storage.ts     # localStorage wrapper that survives quota errors
├── store/                  # zustand stores: auth (admin), crew-auth, customer-auth, ui, booking-capture
├── i18n/ + locales/{id,en} # i18next config and JSON bundles (common, customer, crew, admin)
├── hooks/                  # cross-surface hooks (use-api, use-admin-realtime)
├── types/                  # shared API types
└── middleware.ts           # subdomain routing + optional cookie-JWT gate

e2e/                        # Playwright specs and fixtures
docs/                       # PRD, sprint plan, deployment guide, user manuals (PDF), HANDOVER.md
public/sw.js                # service worker: push notifications + crew app-shell cache
mock-server.ts              # standalone mock API (bun)
Dockerfile, cloudbuild.yaml # production build + Cloud Run deploy
nginx.conf                  # reference config for self-hosted VM deploys only
```

---

## Testing

**Unit tests** live next to the code as `*.test.ts` and run on `bun test`:

```bash
bun run test
```

**E2E tests** use Playwright across desktop Chromium/Firefox/WebKit and iPhone 14 / Pixel 7 viewports. They boot a dev server on :3100 and point it at `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`), so most specs need the backend up:

```bash
bun run test:e2e
bunx playwright test --project=mobile-safari e2e/customer-flow.spec.ts
```

There is deliberately **no CI test step**. Run lint, typecheck, and tests locally before pushing to `main`, because a push to `main` deploys to production.

---

## Deployment

Production runs on **GCP Cloud Run** (region `asia-southeast1`) and is deployed automatically by **Cloud Build** on every push to `main` using `cloudbuild.yaml`:

1. Docker build (Bun install + `next build`), tagged with the commit SHA and `latest`
2. Push to Artifact Registry `park-n-shine/app`
3. `gcloud run deploy park-n-shine` with the SHA image, min 1 / max 10 instances, 512Mi

All `NEXT_PUBLIC_*` values are set as Cloud Build substitutions at the top of `cloudbuild.yaml`. To change one, edit the substitution (or override it on the trigger) and push. To roll back, redeploy a previous SHA tag from the Cloud Run console.

Subdomain routing (`app.`, `crew.`, `admin.`) is done by `src/middleware.ts` reading the `Host` header. The GCP load balancer must forward `Host` unchanged.

`docs/DEPLOY.md` (Indonesian) documents the alternative Vercel and self-hosted VM options. Note it still refers to the older `park-shine.sg` domain; production is `parknshine.net`.

---

## Docs

- [`docs/HANDOVER.md`](docs/HANDOVER.md): developer handover, start here
- [`docs/PRD_Frontend.md`](docs/PRD_Frontend.md): product requirements, booking state machine, API contract (Indonesian)
- [`docs/SPRINT_PLANNING_EN.md`](docs/SPRINT_PLANNING_EN.md): original sprint plan (English; the ID version is `SPRINT_PLANNING.md`)
- [`docs/DEPLOY.md`](docs/DEPLOY.md): deployment options (Indonesian)
- [`docs/user-manual/`](docs/user-manual/): end-user PDF manuals for the customer app, crew app, and admin console
- [`e2e/README.md`](e2e/README.md): Playwright guide
