# Park & Shine — Sprint Planning

**Confidential — For internal use only**

```
Document version  1.0 (MVP)
Status            Draft
Owner             Engineering Team — Park & Shine
Date              May 2026
Based on          PRD_Frontend.md v1.0
```

---

## Summary

| Sprint | Surface | Name | Status | Points |
|--------|---------|------|--------|--------|
| 0 | All | Foundation & Infrastructure | ✅ Done | 14 |
| 1 | Customer | Booking Entry Flow | ✅ Done | 20 |
| 2 | Customer | Payment & Status Flow | ✅ Done | 18 |
| 3 | Customer | Customer Polish | 🔲 Pending | 22 |
| 4 | Crew | Auth & Queue | 🔲 Pending | 18 |
| 5 | Crew | Plate Verify & Before Photos | 🔲 Pending | 12 |
| 6 | Crew | Wash Checklist & Finish | 🔲 Pending | 16 |
| 7 | Admin | Queue & Booking Management | 🔲 Pending | 31 |
| 8 | Admin | Escalations & Reports | 🔲 Pending | 19 |
| 9 | All | NFR & Launch Readiness | 🔲 Pending | — |

---

## Sprint 0 — Foundation & Infrastructure ✅ Done

**Goal:** Set up architecture, tooling, and shared infrastructure for all three surfaces.

### Tickets

| ID | Description | Points |
|----|-------------|--------|
| INFRA-01 | Next.js App Router setup, route groups `(customer)` `(crew)` `(admin)` | 3 |
| INFRA-02 | Design tokens, Tailwind v4, shadcn/ui primitives (Button, Input, Dialog, etc.) | 3 |
| INFRA-03 | Zustand stores (auth, ui), axios instance, TanStack Query provider | 3 |
| INFRA-04 | `AppShell` layout, `ThemeProvider`, PWA manifest + service worker | 3 |
| INFRA-05 | Query/mutation key factory (`query-keys.ts`), API response/error contracts | 2 |

**Total: 14 points**

---

## Sprint 1 — Customer: Booking Entry Flow ✅ Done

**Goal:** Customer can scan QR, open the landing page, photograph plate + slot, and proceed to confirmation.

**FR:** FR-01, FR-02, FR-20 (partial)

### Tickets

| ID | Description | FR | Points |
|----|-------------|-----|--------|
| CUST-01 | QR Landing Page `/q/[qrId]` — resolve site, CTA "Book a Wash", cutoff/pause states | FR-01 | 3 |
| CUST-02 | `BookNowButton` — create booking mutation, navigate to capture with `bookingId` + `token` | FR-01 | 2 |
| CUST-03 | Capture Page `/q/[qrId]/capture` — two photo uploads, OCR pre-fill, both photos required | FR-02 | 5 |
| CUST-04 | `PhotoUploadField` component — progress bar, states (idle/uploading/success/error/retrying) | FR-02, FR-20 | 3 |
| CUST-05 | `OcrEditField` component — editable field to correct OCR results | FR-02 | 2 |
| CUST-06 | `usePhotoUpload` hook — upload to `/v1/bookings/{id}/media`, state machine, OCR result | FR-02, FR-20 | 5 |

**Total: 20 points**

---

## Sprint 2 — Customer: Payment & Status Flow ✅ Done

**Goal:** Customer can confirm booking, pay, and track status in real time.

**FR:** FR-03, FR-04, FR-16, FR-19, FR-23

### Tickets

| ID | Description | FR | Points |
|----|-------------|-----|--------|
| CUST-07 | Confirm Page `/q/[qrId]/confirm` — review plate/slot/price/estimate, confirm mutation | FR-03, FR-19 | 5 |
| CUST-08 | `PayButton` — disabled after first tap, idempotency key, redirect to payment gateway | FR-03, FR-19 | 3 |
| CUST-09 | Status Page `/booking/[id]/status` — polling every 5s, label per state machine | FR-04 | 5 |
| CUST-10 | `PaymentCheckButton` — 30s timer, call reconciliation endpoint, WhatsApp fallback | FR-23 | 3 |
| CUST-11 | `WhatsAppSupportWidget` — floating `wa.me` widget, shown on all customer pages | FR-16 | 2 |

**Total: 18 points**

---

## Sprint 3 — Customer: Customer Polish 🔲 Pending

**Goal:** All customer pages are *production-ready* — image compression, auto-retry, push notifications, rating, i18n.

**FR:** FR-08, FR-12, FR-13, FR-20

### Tickets

---

#### CUST-12 — Rating Page Integration
**FR:** FR-12 | **Points:** 3 | **Priority:** Medium

**Description:**
The `/booking/[id]/rate` page structure already exists. This ticket ensures full API integration and PRD-compliant behavior.

**Acceptance Criteria:**
- [ ] `StarRating` component supports selection of 1–5 stars
- [ ] If rating ≤ 2, a free-text field "What could be improved?" appears
- [ ] "Submit" button calls `POST /v1/bookings/{id}/rate`
- [ ] A "Skip" button is available at any time without submitting a rating
- [ ] After submit / skip → redirect to a thank-you page or `/q/{qrId}`
- [ ] Submit button is disabled after first tap (prevent double submit)

---

#### CUST-13 — Client-side Image Compression
**FR:** FR-20 | **Points:** 3 | **Priority:** High 🔴

**Description:**
Photos uploaded by the user are currently not compressed. The PRD requires every photo to be < 500 KB before being sent to the server. Use the browser's Canvas API to resize and compress.

**Acceptance Criteria:**
- [ ] Every image file is compressed to < 500 KB before upload
- [ ] JPEG output quality minimum 0.7 (configurable)
- [ ] Maximum dimension 1280px on the longest side
- [ ] Files already < 500 KB are not re-compressed
- [ ] Compression occurs before the progress bar appears (transparent to the user)
- [ ] No external libraries — use the native Canvas API

**Implementation notes:**
Create utility `src/lib/compress-image.ts` → `compressImage(file: File): Promise<File>`. Call it in `usePhotoUpload` before the upload begins.

---

#### CUST-14 — Auto-Retry with Exponential Backoff
**FR:** FR-20 | **Points:** 3 | **Priority:** High 🔴

**Description:**
If the connection drops during a photo upload, the client should automatically retry. Currently, if an upload fails the user must tap retry manually.

**Acceptance Criteria:**
- [ ] Maximum 3 automatic retries after upload fails due to a network error
- [ ] Retry delays: 1s → 2s → 4s (exponential backoff)
- [ ] Status `"retrying"` is shown in `PhotoUploadField` during the retry process
- [ ] After 3 failed retries → status `"error"`, manual retry button appears
- [ ] Non-network errors (4xx from server) are not retried automatically
- [ ] Auto-retry is not triggered if the user has already tapped retry manually

**Implementation notes:**
Add retry logic in the `usePhotoUpload` hook. Distinguish `NetworkError` vs `ApiContractError` before deciding to retry.

---

#### CUST-15 — Web Push Notification When Booking is READY
**FR:** FR-08 | **Points:** 5 | **Priority:** Medium

**Description:**
While the customer is waiting on the Status Page, request Web Push permission. When the status changes to `READY`, send a push notification even if the browser is in the background.

**Acceptance Criteria:**
- [ ] Web Push permission prompt appears on the Status Page after 5 seconds when status is `PAID`
- [ ] If the user declines → prompt never appears again (respect `denied` state)
- [ ] Subscribe push endpoint → save to backend (`POST /v1/bookings/{id}/push-subscription`)
- [ ] When polling detects `READY` → send notification via service worker
- [ ] Notification content: title "Your car is clean! 🎉", body is the site name
- [ ] Tapping the notification → opens the Status Page for that booking
- [ ] Fallback: if push is not supported → on-page polling continues (already in place)

**Implementation notes:**
Push subscription logic in `status/page.tsx`. Add a `push` event handler in `public/sw.js`.

---

#### CUST-16 — Internationalization (id-ID / en-US)
**FR:** FR-13 | **Points:** 8 | **Priority:** Low (implement last)

**Description:**
All customer copy is currently hardcoded in Bahasa Indonesia. The PRD requires two locales: **id-ID** (default) and **en-US**, with a language switcher on every customer page.

**Acceptance Criteria:**
- [ ] Set up `next-intl` with locales `id-ID` and `en-US`
- [ ] All customer-facing strings moved to `messages/id.json` and `messages/en.json`
- [ ] Language switcher (ID/EN toggle) in the header of all customer pages
- [ ] Language preference saved to `localStorage`, persisted across sessions
- [ ] Default locale `id-ID` when no preference is stored
- [ ] URL does not change when switching language (not `/en/q/...`)
- [ ] No hardcoded strings remain in customer components

**Translation scope:** Landing, Capture, Confirm, Status, Rating, all error states & toasts.

---

### Dependency & Execution Order — Sprint 3

```
CUST-13 (compression)
   └─→ CUST-14 (retry) — continues in the same hook

CUST-12 (rating)    — parallel, independent
CUST-15 (push)      — after CUST-09 is stable
CUST-16 (i18n)      — last, after all copy is final
```

**Total: 22 points**

---

## Sprint 4 — Crew: Auth & Queue 🔲 Pending

**Goal:** Crew can log in with a shift code + PIN and claim the next job.

**FR:** FR-05, FR-22

### Tickets

| ID | Description | FR | Points |
|----|-------------|-----|--------|
| CREW-01 | Crew login page — form with shift code (6-digit) + PIN | FR-22 | 3 |
| CREW-02 | `POST /v1/crew/sessions` integration, token storage, 12h session expiry + auto-redirect to login | FR-22 | 3 |
| CREW-03 | Crew `(crew)` route group layout + `AppShell` surface | — | 2 |
| CREW-04 | Home/Queue page — large "Claim Next Job" button, empty state, automatic polling | FR-05 | 3 |
| CREW-05 | Claim job mutation `POST /v1/crew/jobs/next`, navigate to Job Detail | FR-05 | 2 |
| CREW-06 | Job Detail page — display plate, slot, customer photos, countdown ETA | FR-05 | 5 |

**Total: 18 points**

---

## Sprint 5 — Crew: Plate Verify & Before Photos 🔲 Pending

**Goal:** Crew can confirm the vehicle plate and upload 4 before-condition photos.

**FR:** FR-06, FR-15

### Tickets

| ID | Description | FR | Points |
|----|-------------|-----|--------|
| CREW-07 | Verify Plate page — display photo + OCR text, "Plate Matches" / "Not Found" buttons | FR-06 | 3 |
| CREW-08 | "Not Found" → NEEDS_HELP transition, escalation message + supervisor WhatsApp link | FR-06 | 2 |
| CREW-09 | Before Photos page — 4 upload fields (front, rear, left, right) | FR-15 | 5 |
| CREW-10 | Reuse `PhotoUploadField` with crew kind enum; block progress until all 4 photos are complete | FR-15 | 2 |

**Total: 12 points**

---

## Sprint 6 — Crew: Wash Checklist & Finish 🔲 Pending

**Goal:** Crew can follow the SOP checklist step-by-step, resume after refresh, and mark the job as complete.

**FR:** FR-07, FR-18

### Tickets

| ID | Description | FR | Points |
|----|-------------|-----|--------|
| CREW-11 | Wash SOP Checklist page — sequential steps, no skipping, timestamp per step | FR-07 | 5 |
| CREW-12 | Each checklist tap `POST`s to the server **before** UI update; rollback if server fails | FR-07, FR-18 | 5 |
| CREW-13 | Resume checklist on refresh/re-login — fetch active job + last completed step on mount | FR-18 | 3 |
| CREW-14 | Finish page — upload after photos, "Done" button → mark job READY | FR-07 | 3 |
| CREW-15 | "Report Issue" button on Job Detail — reason selection (too tight, vehicle condition, etc.), `POST /v1/crew/jobs/{id}/report`, status → NEEDS_HELP, notify Admin Console | FR-06 | 5 |

**Total: 21 points**

---

## Sprint 7 — Admin: Queue & Booking Management 🔲 Pending

**Goal:** Supervisor can monitor the live queue, view booking details, override status, and process refunds.

**FR:** FR-09, FR-10, FR-17

### Tickets

| ID | Description | FR | Points |
|----|-------------|-----|--------|
| ADMIN-01 | Google Workspace SSO login, JWT handling, admin `(admin)` route group + layout | — | 5 |
| ADMIN-02 | Dashboard / Live Queue — bookings grouped by status, card: plate, slot, crew, elapsed time | FR-09 | 8 |
| ADMIN-03 | Booking Detail page — full status history, media thumbnails, timeline | FR-09 | 5 |
| ADMIN-04 | Reassign booking to another crew member — crew dropdown + confirmation | FR-09 | 3 |
| ADMIN-05 | Manual Status Override modal — transition dropdown, reason code required, audit log | FR-17 | 5 |
| ADMIN-06 | Refund modal — full/partial options, reason code dropdown, confirmation before processing | FR-10 | 5 |

**Total: 31 points**

---

## Sprint 8 — Admin: Escalations & Reports 🔲 Pending

**Goal:** Supervisor has visibility into problematic jobs and daily KPI reports.

**FR:** FR-11, FR-21

### Tickets

| ID | Description | FR | Points |
|----|-------------|-----|--------|
| ADMIN-07 | Escalations Panel — STALE/NEEDS_HELP jobs at the top of the queue, red badge if > 20 minutes | FR-21 | 5 |
| ADMIN-08 | Configurable stale-job timeout (default 20 minutes), actions: re-prioritize / cancel+refund / extend | FR-21 | 3 |
| ADMIN-09 | Reports page — daily KPIs: total bookings, completion rate, SLA%, avg rating, revenue | FR-11 | 8 |
| ADMIN-10 | CSV report export + scheduled automated email delivery | FR-11 | 3 |

**Total: 19 points**

---

## Sprint 9 — NFR & Launch Readiness 🔲 Pending

**Goal:** All surfaces are production-ready — observability, accessibility, performance, and cutover to staging API.

| ID | Description | Target |
|----|-------------|--------|
| NFR-01 | Sentry integration across all 3 surfaces, error boundaries per route group | Day 1 |
| NFR-02 | WCAG 2.1 AA audit — contrast ratio, touch target min 44×44px, alt text sweep | 2.1 AA |
| NFR-03 | Lighthouse CI — TTI ≤ 2.5s on mid-range Android 4G | ≤ 2.5s |
| NFR-04 | Offline/resume test — upload retry, checklist persistence on reconnect | — |
| NFR-05 | Mock server → staging API cutover, audit all env vars | — |
| NFR-06 | Complete en-US translations (after all id-ID strings are final from CUST-16) | — |

---

## Definition of Done (Global)

Applies to all tickets unless otherwise noted:

- [ ] All acceptance criteria met
- [ ] `bun run build` succeeds without TypeScript errors
- [ ] `bun run lint` clean with no warnings
- [ ] Manually tested on Chrome Android (emulator or real device)
- [ ] Manually tested on Safari iOS (for Customer & Crew surfaces)
- [ ] No hardcoded strings in components (applies from Sprint 3 CUST-16 onwards)
- [ ] No `console.log` remaining in production code

---

*End of document — Park & Shine Sprint Planning v1.0*
