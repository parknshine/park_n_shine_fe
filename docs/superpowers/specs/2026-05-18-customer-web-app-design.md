# Customer Web App — Design Spec
**Date:** 2026-05-18  
**Scope:** Park & Shine Customer Web App (PWA) — all pages from QR scan to rating  
**PRD reference:** `docs/PRD_Frontend.md` FR-01–FR-23

---

## 1. Brand & Design Tokens

### Palette (replaces current indigo tokens in `globals.css`)

| Token | Light | Dark |
|---|---|---|
| `--background` | `#eaf4f7` (icy blue-white) | `#020c0e` |
| `--foreground` | `#0d3d4e` (dark navy-teal) | `#e0f2f1` |
| `--card` | `#ffffff` | `#0d2b33` |
| `--card-foreground` | `#0d3d4e` | `#e0f2f1` |
| `--muted` | `#d0ebf0` | `#0d2b33` |
| `--muted-foreground` | `#4b7a80` | `#7fb8c0` |
| `--border` | `#b2dfdb` | `#134e4a` |
| `--primary` | `#0d9488` (teal-600) | `#2dd4bf` (teal-400) |
| `--primary-foreground` | `#ffffff` | `#022c22` |
| `--secondary` | `#d0ebf0` | `#0d2b33` |
| `--secondary-foreground` | `#0d3d4e` | `#e0f2f1` |
| `--destructive` | `#ef4444` | `#f87171` |
| `--destructive-foreground` | `#ffffff` | `#7f1d1d` |
| `--ring` | `#0d9488` | `#2dd4bf` |
| `--accent` | `#f59e0b` (amber — badge highlight) | `#fbbf24` |
| `--accent-foreground` | `#ffffff` | `#1c1407` |

> `--accent` and `--accent-foreground` must be added to both `:root`/`.dark` blocks **and** the `@theme inline` mapping in `globals.css` (currently missing from the base template).

### Button shape
All CTA buttons in the customer app use `rounded-full` (pill shape) matching brand identity from the reference site.

### Typography
- Headlines: `font-bold` `tracking-tight` in `--foreground` (dark navy-teal)
- Sub-labels: amber pill badge (`bg-amber-400 text-white rounded-full text-xs font-semibold uppercase`)

---

## 2. Route Structure

```
src/app/
  (customer)/
    layout.tsx               ← minimal shell: brand header + WhatsApp widget, light only
    q/
      [qrId]/
        page.tsx             ← Landing — Server Component
        capture/
          page.tsx           ← Photo Capture — Client Component
        confirm/
          page.tsx           ← Review & Pay — Client Component
    booking/
      [id]/
        status/
          page.tsx           ← Live Status — Server + Client polling
        rate/
          page.tsx           ← Rating — Client Component
```

The existing `src/app/page.tsx` (component showcase) is untouched.

---

## 3. State Flow (nuqs URL params)

`nuqs` must be installed: `bun add nuqs`

| Page | Reads | Writes |
|---|---|---|
| `/q/[qrId]` | — | `bookingId`, `token` (after POST /v1/bookings) |
| `/q/[qrId]/capture` | `bookingId`, `token` | `plate`, `slot` (after OCR results) |
| `/q/[qrId]/confirm` | `bookingId`, `token`, `plate`, `slot` | — |
| `/booking/[id]/status` | `token` | — |
| `/booking/[id]/rate` | `token` | — |

All params are shallow-pushed via `nuqs` `useQueryState`. On back navigation, params are still in the URL so pages reconstruct correctly.

---

## 4. Shared Layout — `(customer)/layout.tsx`

- **No theme toggle** — customer app is light mode only; dark tokens exist for system-dark-mode support but the toggle is hidden
- **Brand header:** Park & Shine logo mark (SVG icon from `/icons/icon.svg`) + wordmark "Park & Shine" in `--foreground`, fixed top, `h-14`, `bg-white/80 backdrop-blur`
- **WhatsappSupportWidget** (existing `src/features/customer/components/whatsapp-support-widget.tsx`) floats bottom-right on every page
- **NuqsAdapter** from `nuqs/adapters/next/app` wraps children for URL state

---

## 5. Pages

### 5.1 Landing — `/q/[qrId]`

**Server Component.** Fetches `/v1/qr/{qrId}` server-side to get `SiteQrResolution`.

**Happy path layout (top → bottom, mobile-first single column):**
1. Amber pill badge: "Cuci Mobil Tanpa Perlu Keluar Parkir"
2. Bold headline (dark navy-teal): "Mobil Bersih,\nTanpa Keluar Parkiran."
3. Sub-copy: site name in teal pill (`{siteName}`)
4. Hero image: `park-shine-hero.jpeg` in rounded-2xl card (aspect-video)
5. "How it works" — 4 steps using `park-shine-panel-1..4.jpeg` in a horizontal scroll row
6. Price/time info card (from QR resolution: estimated time, price)
7. Teal pill CTA button: **"Book a Wash"** — triggers `BookNowButton` (Client Component island)

**`BookNowButton`** (Client island, `use client`):
- On tap: POST `/v1/bookings` with `{ qrId, locale }` → on success push nuqs params `bookingId` + `token` then `router.push` to `/q/[qrId]/capture?bookingId=...&token=...`
- Shows spinner while pending
- Disabled while pending

**Error states (replace CTA):**
| Condition | Message |
|---|---|
| `intakePaused: true` | "Booking sedang ditutup sementara. Silakan coba lagi nanti." |
| Past `cutoffTime` | "Booking hari ini sudah ditutup. Coba lagi besok!" |
| QR not found (404) | "QR Code tidak valid atau sudah kadaluarsa." |
| Network error | "Gagal memuat halaman. Periksa koneksi kamu." |

**New components:**
- `LandingHero` — amber badge + headline + hero image + site pill
- `HowItWorksPanel` — 4-image horizontal scroll with step numbers
- `QrErrorState` — full-page centered error with icon + message

---

### 5.2 Capture — `/q/[qrId]/capture`

**Client Component.** Reads `bookingId` + `token` from nuqs. Guards: if either is missing, redirects back to `/q/[qrId]`.

**Layout:**
1. Step indicator: "Langkah 1 dari 2 — Foto Kendaraan"
2. `PhotoUploadField` for `plate` kind — label: "Foto Plat Nomor"
3. `OcrEditField` — appears after plate upload succeeds; shows OCR result in editable input; user can correct text
4. `PhotoUploadField` for `slot` kind — label: "Foto Slot Parkir"
5. `OcrEditField` for slot — same pattern
6. "Lanjut →" teal pill button — disabled until both uploads succeeded AND both text fields non-empty
7. On submit: writes `plate` + `slot` nuqs params → `router.push` to confirm page

**New components:**
- `OcrEditField` — shows detected text in an editable `Input`, pre-filled with `ocrText` from `BookingMedia`; includes edit icon to signal it's editable

**Reused:**
- `PhotoUploadField` (existing)
- `usePhotoUpload` hook (existing) — manages retries, progress, OCR result

---

### 5.3 Confirm — `/q/[qrId]/confirm`

**Client Component.** Reads `bookingId`, `token`, `plate`, `slot` from nuqs. Guards: if any missing, redirects to capture.

**Layout:**
1. Step indicator: "Langkah 2 dari 2 — Konfirmasi"
2. `BookingSummaryCard` — shows:
   - Plate number (large, bold)
   - Slot number
   - Site name — fetched via `useBookingStatus(bookingId, token)` (single poll, no interval)
   - Price (IDR formatted, from `booking.priceAmount` + `booking.currency`)
   - Estimated ready time (`booking.estimatedReadyAt`, formatted as locale time)
3. Edit link → back to capture (preserves nuqs params)
4. `PayButton` — teal pill "Bayar Sekarang", disabled after first tap (FR-19)
5. On tap: `confirmAndRedirect({ plateText, slotText })` from `usePaymentAction`
6. Error: inline `Alert` variant destructive below button, re-enables Pay button

**New components:**
- `BookingSummaryCard` — displays booking detail rows with icons
- `PayButton` — wraps Button + `usePaymentAction`, handles disabled state + spinner

**Reused:**
- `usePaymentAction` hook (existing)

---

### 5.4 Status — `/booking/[id]/status`

**Server Component** for initial render, Client Component island for polling.

**Layout:**
1. `StatusHero` — large booking status badge (uses existing `StatusBadge` + `BOOKING_STATUS_TONES`), animated pulse when `IN_PROGRESS`
2. Plate + slot info row
3. Estimated ready time countdown (when status is `ASSIGNED` or `IN_PROGRESS`)
4. `BookingStatusTimeline` (existing) — collapsible history list
5. `PaymentCheckButton` — shown when status is still `PENDING` after 30s; label "Cek Status Pembayaran" re-polls immediately
6. When `READY`: celebration card with "Mobil Kamu Sudah Bersih! 🎉" + "Beri Rating" teal pill button → `/booking/[id]/rate?token=...`
7. When `CLOSED`: done state — "Terima kasih sudah menggunakan Park & Shine"
8. When `EXPIRED` / `CANCELLED`: error state with WhatsApp support CTA

**Polling:** `useBookingStatus` with default 5s interval. Stops polling when status is `READY`, `CLOSED`, `EXPIRED`, or `CANCELLED`.

**New components:**
- `StatusHero` — large status display, animated pulse for active states
- `PaymentCheckButton` — timer-aware button, appears after 30s if still PENDING

**Reused:**
- `BookingStatusTimeline` (existing)
- `useBookingStatus` hook (existing)

---

### 5.5 Rating — `/booking/[id]/rate`

**Client Component.** Reads `token` from nuqs. The `id` comes from the route param.

**Layout:**
1. "Bagaimana pengalaman kamu?" heading
2. `StarRating` — 5 tappable stars, selected star fills teal
3. If score ≤ 2: `Textarea` appears with label "Ceritakan masalahnya (opsional)"
4. "Kirim Rating" teal pill button
5. Skip link below: "Lewati" (text-muted-foreground, underline)
6. Both submit and skip navigate to a thank-you inline state (no new page): "Terima kasih! Sampai jumpa." with Park & Shine logo

**Error handling:** Rating failure is silent — on error, transition to thank-you state anyway (rating is optional per FR-23).

**New components:**
- `StarRating` — 5 star tap targets, controlled component

---

## 6. New Components Summary

| Component | Location | Notes |
|---|---|---|
| `LandingHero` | `features/customer/components/` | Server-safe (no hooks) |
| `HowItWorksPanel` | `features/customer/components/` | 4 images from /public |
| `QrErrorState` | `features/customer/components/` | Full-page error |
| `BookNowButton` | `features/customer/components/` | `use client` island |
| `OcrEditField` | `features/customer/components/` | Editable OCR result input |
| `BookingSummaryCard` | `features/customer/components/` | Display-only summary |
| `PayButton` | `features/customer/components/` | Wraps usePaymentAction |
| `StatusHero` | `features/customer/components/` | Animated status display |
| `PaymentCheckButton` | `features/customer/components/` | 30s timer + re-poll |
| `StarRating` | `features/customer/components/` | Controlled 1–5 star input |

All exported through `src/features/customer/components/index.ts`.

---

## 7. Dependencies to Install

```bash
bun add nuqs
```

No other new dependencies. All UI primitives already available (Button, Input, Textarea, Badge, Alert, Card, Dialog from shadcn).

---

## 8. Files to Create / Modify

### Modify
- `src/app/globals.css` — replace design tokens with Park & Shine teal palette
- `src/features/customer/components/index.ts` — add new component exports

### Create
- `src/app/(customer)/layout.tsx`
- `src/app/(customer)/q/[qrId]/page.tsx`
- `src/app/(customer)/q/[qrId]/capture/page.tsx`
- `src/app/(customer)/q/[qrId]/confirm/page.tsx`
- `src/app/(customer)/booking/[id]/status/page.tsx`
- `src/app/(customer)/booking/[id]/rate/page.tsx`
- `src/features/customer/components/landing-hero.tsx`
- `src/features/customer/components/how-it-works-panel.tsx`
- `src/features/customer/components/qr-error-state.tsx`
- `src/features/customer/components/book-now-button.tsx`
- `src/features/customer/components/ocr-edit-field.tsx`
- `src/features/customer/components/booking-summary-card.tsx`
- `src/features/customer/components/pay-button.tsx`
- `src/features/customer/components/status-hero.tsx`
- `src/features/customer/components/payment-check-button.tsx`
- `src/features/customer/components/star-rating.tsx`

---

## 9. Out of Scope

- Admin Console pages
- Crew Operator App pages
- i18n language switcher (separate spec)
- Push notifications
- Offline queueing beyond what TanStack Query already provides
