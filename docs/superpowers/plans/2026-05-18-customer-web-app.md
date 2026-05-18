# Customer Web App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full Park & Shine Customer Web App PWA — 5 pages covering the complete booking flow from QR scan through photo capture, payment confirmation, live status tracking, and star rating.

**Architecture:** A `(customer)` route group under `src/app` provides a shared minimal brand layout with NuqsAdapter; each booking step is a dedicated page; nuqs carries `bookingId`, `token`, `plate`, and `slot` between steps via URL search params; existing scaffolded hooks (`usePhotoUpload`, `useBookingStatus`, `usePaymentAction`) and components (`PhotoUploadField`, `BookingStatusTimeline`, `WhatsAppSupportWidget`) are reused throughout. New components live in `src/features/customer/components/`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, nuqs v2 (URL state), TanStack Query v5, shadcn/Radix UI primitives (Button, Card, Alert, Input, Textarea), Lucide React icons

---

## File Map

### Modify
| File | Change |
|---|---|
| `src/app/globals.css` | Replace indigo palette with Park & Shine teal; add `--accent`/`--accent-foreground` tokens |
| `src/app/layout.tsx` | Strip inline navbar (move to page.tsx) — becomes pure providers wrapper |
| `src/app/page.tsx` | Add inline sticky navbar back at top of component return |
| `src/lib/query-keys.ts` | Add `mutationKeys.customer.createBooking()` and `mutationKeys.customer.rate()` |
| `src/features/customer/components/index.ts` | Export all new components |
| `src/features/customer/index.ts` | Re-export new components through feature index |

### Create
| File | Purpose |
|---|---|
| `src/app/(customer)/layout.tsx` | Brand header + NuqsAdapter + WhatsApp widget |
| `src/app/(customer)/q/[qrId]/page.tsx` | Landing page (Server Component) |
| `src/app/(customer)/q/[qrId]/capture/page.tsx` | Photo capture page (Client Component) |
| `src/app/(customer)/q/[qrId]/confirm/page.tsx` | Review & pay page (Client Component) |
| `src/app/(customer)/booking/[id]/status/page.tsx` | Live status page (Client Component) |
| `src/app/(customer)/booking/[id]/rate/page.tsx` | Star rating page (Client Component) |
| `src/features/customer/components/landing-hero.tsx` | Amber badge + headline + hero image |
| `src/features/customer/components/how-it-works-panel.tsx` | 4-step horizontal scroll |
| `src/features/customer/components/qr-error-state.tsx` | Full-page error for invalid QR / paused intake |
| `src/features/customer/components/book-now-button.tsx` | Client island — POST /v1/bookings + navigate |
| `src/features/customer/components/ocr-edit-field.tsx` | Editable OCR result input field |
| `src/features/customer/components/booking-summary-card.tsx` | Plate / slot / price / time summary |
| `src/features/customer/components/pay-button.tsx` | Wraps usePaymentAction with idempotency guard |
| `src/features/customer/components/status-hero.tsx` | Animated large status display |
| `src/features/customer/components/payment-check-button.tsx` | Appears after 30s, triggers re-poll |
| `src/features/customer/components/star-rating.tsx` | 1–5 star controlled input |

---

## Task 1: Install nuqs, update design tokens, extend query-keys

**Files:**
- Install: `nuqs`
- Modify: `src/app/globals.css`
- Modify: `src/lib/query-keys.ts`

- [ ] **Step 1: Install nuqs**

```bash
bun add nuqs
```

Expected: nuqs appears in `package.json` dependencies and `bun.lock` is updated.

- [ ] **Step 2: Replace `src/app/globals.css` with teal palette**

Full file replacement:

```css
@import "tailwindcss";

/* ─── Class-based dark variant ─────────────────────────────────────────────── */
@custom-variant dark (&:is(.dark *));

/* ─── Design tokens ────────────────────────────────────────────────────────── */
:root {
  --background:              #eaf4f7;
  --foreground:              #0d3d4e;
  --card:                    #ffffff;
  --card-foreground:         #0d3d4e;
  --muted:                   #d0ebf0;
  --muted-foreground:        #4b7a80;
  --border:                  #b2dfdb;
  --primary:                 #0d9488;
  --primary-foreground:      #ffffff;
  --secondary:               #d0ebf0;
  --secondary-foreground:    #0d3d4e;
  --destructive:             #ef4444;
  --destructive-foreground:  #ffffff;
  --accent:                  #f59e0b;
  --accent-foreground:       #ffffff;
  --ring:                    #0d9488;
}

.dark {
  --background:              #020c0e;
  --foreground:              #e0f2f1;
  --card:                    #0d2b33;
  --card-foreground:         #e0f2f1;
  --muted:                   #0d2b33;
  --muted-foreground:        #7fb8c0;
  --border:                  #134e4a;
  --primary:                 #2dd4bf;
  --primary-foreground:      #022c22;
  --secondary:               #0d2b33;
  --secondary-foreground:    #e0f2f1;
  --destructive:             #f87171;
  --destructive-foreground:  #7f1d1d;
  --accent:                  #fbbf24;
  --accent-foreground:       #1c1407;
  --ring:                    #2dd4bf;
}

/* ─── Tailwind theme mapping ────────────────────────────────────────────────── */
@theme inline {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);

  --color-background:              var(--background);
  --color-foreground:              var(--foreground);
  --color-card:                    var(--card);
  --color-card-foreground:         var(--card-foreground);
  --color-muted:                   var(--muted);
  --color-muted-foreground:        var(--muted-foreground);
  --color-border:                  var(--border);
  --color-primary:                 var(--primary);
  --color-primary-foreground:      var(--primary-foreground);
  --color-secondary:               var(--secondary);
  --color-secondary-foreground:    var(--secondary-foreground);
  --color-destructive:             var(--destructive);
  --color-destructive-foreground:  var(--destructive-foreground);
  --color-accent:                  var(--accent);
  --color-accent-foreground:       var(--accent-foreground);
  --color-ring:                    var(--ring);
}

body {
  background-color: var(--background);
  color: var(--foreground);
}
```

- [ ] **Step 3: Add createBooking and rate mutation keys to `src/lib/query-keys.ts`**

```typescript
export const queryKeys = {
  admin: {
    queue: (siteId: string) => ["admin", "queue", siteId] as const,
  },
  crew: {
    session: () => ["crew", "session"] as const,
    job: (jobId: string) => ["crew", "job", jobId] as const,
    nextJob: () => ["crew", "jobs", "next"] as const,
  },
  customer: {
    booking: (bookingId: string) => ["customer", "booking", bookingId] as const,
  },
} as const;

export const mutationKeys = {
  admin: {
    overrideStatus: (bookingId: string) =>
      ["admin", "booking", bookingId, "status-override"] as const,
    reassign: (bookingId: string) =>
      ["admin", "booking", bookingId, "reassign"] as const,
    refund: (bookingId: string) =>
      ["admin", "booking", bookingId, "refund"] as const,
  },
  crew: {
    checklist: (jobId: string) => ["crew", "job", jobId, "checklist"] as const,
    login: () => ["crew", "sessions"] as const,
    nextJob: () => ["crew", "jobs", "next"] as const,
  },
  customer: {
    confirmPayment: (bookingId: string) =>
      ["customer", "booking", bookingId, "confirm"] as const,
    createBooking: () => ["customer", "booking", "create"] as const,
    media: (bookingId: string) =>
      ["customer", "booking", bookingId, "media"] as const,
    rate: (bookingId: string) =>
      ["customer", "booking", bookingId, "rate"] as const,
  },
} as const;
```

- [ ] **Step 4: Run dev server to verify tokens apply**

```bash
bun run dev
```

Open http://localhost:3000 — background should now be icy blue-white, buttons teal. No TypeScript errors in terminal.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/lib/query-keys.ts bun.lock package.json
git commit -m "feat: install nuqs, apply Park & Shine teal palette, extend mutation keys"
```

---

## Task 2: Strip navbar from root layout, restore it in showcase page

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Remove the `<header>` block from `src/app/layout.tsx`**

The root layout should become a pure providers wrapper. Replace the entire file with:

```tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/providers/toaster";
import { PwaProvider } from "@/components/providers/pwa-provider";
import { QueryProvider } from "@/components/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Park & Shine",
    template: "%s | Park & Shine",
  },
  description:
    "Waterless car wash PWA for booking, crew operations, and site supervision.",
  applicationName: "Park & Shine",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Park & Shine",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
  colorScheme: "light dark",
  minimumScale: 1,
  initialScale: 1,
  width: "device-width",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var dark=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(dark)document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster />
            <PwaProvider />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Add inline navbar to the top of `src/app/page.tsx` component return**

Find the opening `return (` in `src/app/page.tsx` and replace the outer wrapper with one that includes a local sticky header. Replace just the return statement's outer `<div>` and `<main>`:

```tsx
// Replace:
//   <div className="min-h-screen bg-background">
//     <main className="mx-auto max-w-2xl px-6 pb-20 pt-12">
// With:
return (
  <div className="min-h-screen bg-background">
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-sm font-semibold text-foreground">Next.js Starter</span>
        </div>
        <ThemeToggle />
      </div>
    </header>
    <main className="mx-auto max-w-2xl px-6 pb-20 pt-12 mt-14">
```

Also add the `ThemeToggle` import at the top of the file if not already present:
```tsx
import { ThemeToggle } from "@/components/ui/theme-toggle";
```

Close the `</main>` and `</div>` at the bottom of the component to match.

- [ ] **Step 3: Verify dev server — showcase page still shows navbar**

```bash
bun run dev
```

Open http://localhost:3000 — "Next.js Starter" navbar still appears. No layout shift.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx
git commit -m "refactor: move navbar from root layout into showcase page"
```

---

## Task 3: Create `(customer)` route group layout

**Files:**
- Create: `src/app/(customer)/layout.tsx`

- [ ] **Step 1: Create the directory and layout file**

```tsx
// src/app/(customer)/layout.tsx
import type { ReactNode } from "react";
import Image from "next/image";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { WhatsAppSupportWidget } from "@/features/customer/components";

interface CustomerLayoutProps {
  children: ReactNode;
}

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6281234567890";

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  return (
    <NuqsAdapter>
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-md items-center px-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/icons/icon.svg"
              alt="Park & Shine logo"
              width={28}
              height={28}
              className="shrink-0"
            />
            <span className="text-base font-bold text-foreground">
              Park & Shine
            </span>
          </div>
        </div>
      </header>

      {children}

      <WhatsAppSupportWidget
        phoneNumber={WHATSAPP_NUMBER}
        label="Hubungi dukungan via WhatsApp"
        message="Halo Park & Shine, saya butuh bantuan dengan booking saya."
      />
    </NuqsAdapter>
  );
}
```

- [ ] **Step 2: Create a temporary test page to verify the layout renders**

```tsx
// src/app/(customer)/test/page.tsx  (TEMPORARY — delete after verifying)
export default function TestPage() {
  return <div className="p-8 text-foreground">Customer layout test</div>;
}
```

- [ ] **Step 3: Open http://localhost:3000/test in the browser**

Expected: Park & Shine header at the top with icon + wordmark, teal background, green WhatsApp button floating bottom-right.

- [ ] **Step 4: Delete the temporary test page**

```bash
rm -rf src/app/\(customer\)/test
```

- [ ] **Step 5: Commit**

```bash
git add src/app/\(customer\)/layout.tsx
git commit -m "feat: add customer route group layout with brand header and WhatsApp widget"
```

---

## Task 4: Create LandingHero, HowItWorksPanel, QrErrorState components

**Files:**
- Create: `src/features/customer/components/landing-hero.tsx`
- Create: `src/features/customer/components/how-it-works-panel.tsx`
- Create: `src/features/customer/components/qr-error-state.tsx`

- [ ] **Step 1: Create `landing-hero.tsx`**

```tsx
// src/features/customer/components/landing-hero.tsx
import Image from "next/image";

interface LandingHeroProps {
  siteName: string;
}

export function LandingHero({ siteName }: LandingHeroProps) {
  return (
    <div className="space-y-5">
      <div className="inline-flex items-center rounded-full bg-amber-400 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
        Cuci Mobil Tanpa Perlu Keluar Parkir
      </div>

      <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground">
        Mobil Bersih,
        <br />
        Tanpa Keluar
        <br />
        Parkiran.
      </h1>

      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground">
        <span className="h-2 w-2 rounded-full bg-primary" />
        {siteName}
      </div>

      <div className="overflow-hidden rounded-2xl">
        <Image
          src="/park-shine-hero.jpeg"
          alt="Keluarga bahagia di parkiran dengan mobil bersih"
          width={600}
          height={400}
          className="w-full object-cover"
          priority
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `how-it-works-panel.tsx`**

```tsx
// src/features/customer/components/how-it-works-panel.tsx
import Image from "next/image";

const STEPS = [
  {
    src: "/park-shine-panel-1.jpeg",
    alt: "Scan QR code di area parkir",
    step: "1",
  },
  {
    src: "/park-shine-panel-2.jpeg",
    alt: "Foto plat dan slot parkir",
    step: "2",
  },
  {
    src: "/park-shine-panel-3.jpeg",
    alt: "Tim kami mencuci mobilmu",
    step: "3",
  },
  {
    src: "/park-shine-panel-4.jpeg",
    alt: "Mobilmu siap dan bersih!",
    step: "4",
  },
] as const;

export function HowItWorksPanel() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Cara Kerja</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
        {STEPS.map(({ src, alt, step }) => (
          <div key={step} className="relative w-36 shrink-0">
            <div className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {step}
            </div>
            <div className="aspect-[4/5] overflow-hidden rounded-xl">
              <Image
                src={src}
                alt={alt}
                width={144}
                height={180}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-1.5 text-center text-xs text-muted-foreground">
              {alt}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `qr-error-state.tsx`**

```tsx
// src/features/customer/components/qr-error-state.tsx
import { AlertTriangle } from "lucide-react";

interface QrErrorStateProps {
  message: string;
}

export function QrErrorState({ message }: QrErrorStateProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-foreground">Tidak Dapat Melanjutkan</p>
        <p className="max-w-xs text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/features/customer/components/landing-hero.tsx \
        src/features/customer/components/how-it-works-panel.tsx \
        src/features/customer/components/qr-error-state.tsx
git commit -m "feat: add LandingHero, HowItWorksPanel, QrErrorState components"
```

---

## Task 5: Create BookNowButton component

**Files:**
- Create: `src/features/customer/components/book-now-button.tsx`

- [ ] **Step 1: Create `book-now-button.tsx`**

```tsx
// src/features/customer/components/book-now-button.tsx
"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { mutationKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";
import type { CustomerBooking, CreateBookingPayload } from "@/features/customer/types";

interface BookNowButtonProps {
  qrId: string;
}

export function BookNowButton({ qrId }: BookNowButtonProps) {
  const router = useRouter();

  const mutation = useMutation({
    meta: { persist: false },
    mutationFn: async () => {
      const payload: CreateBookingPayload = { qrId, locale: "id-ID" };
      const response = await api.post<CustomerBooking>("/v1/bookings", payload);
      return response.data;
    },
    mutationKey: mutationKeys.customer.createBooking(),
    onSuccess: (booking) => {
      const params = new URLSearchParams({
        bookingId: booking.id,
        token: booking.signedToken,
      });
      router.push(`/q/${qrId}/capture?${params.toString()}`);
    },
  });

  return (
    <div className="space-y-2">
      <Button
        size="lg"
        className="w-full rounded-full"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          "Book a Wash"
        )}
      </Button>
      {mutation.error && (
        <p className="text-center text-sm text-destructive">
          {mutation.error instanceof Error
            ? mutation.error.message
            : "Gagal membuat booking. Coba lagi."}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/customer/components/book-now-button.tsx
git commit -m "feat: add BookNowButton client island"
```

---

## Task 6: Create landing page `/q/[qrId]/page.tsx`

**Files:**
- Create: `src/app/(customer)/q/[qrId]/page.tsx`

- [ ] **Step 1: Create the directory structure and page**

```tsx
// src/app/(customer)/q/[qrId]/page.tsx
import type { Metadata } from "next";
import { AppShell } from "@/components/shared";
import {
  BookNowButton,
  HowItWorksPanel,
  LandingHero,
  QrErrorState,
} from "@/features/customer/components";
import type { SiteQrResolution } from "@/features/customer/types";

interface Props {
  params: Promise<{ qrId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { qrId } = await params;
  const resolution = await getQrResolution(qrId);
  return {
    title: resolution ? `Book at ${resolution.siteName}` : "Book a Wash",
  };
}

async function getQrResolution(
  qrId: string
): Promise<SiteQrResolution | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";
  try {
    const res = await fetch(`${baseUrl}/v1/qr/${qrId}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json() as Promise<SiteQrResolution>;
  } catch {
    return null;
  }
}

export default async function LandingPage({ params }: Props) {
  const { qrId } = await params;
  const resolution = await getQrResolution(qrId);

  if (!resolution) {
    return (
      <AppShell surface="customer">
        <QrErrorState message="QR Code tidak valid atau sudah kadaluarsa." />
      </AppShell>
    );
  }

  const now = new Date();
  const [cutoffHour, cutoffMinute] = resolution.cutoffTime
    .split(":")
    .map(Number);
  const cutoff = new Date(now);
  cutoff.setHours(cutoffHour, cutoffMinute, 0, 0);
  const isPastCutoff = now > cutoff;

  const blockingMessage = resolution.intakePaused
    ? "Booking sedang ditutup sementara. Silakan coba lagi nanti."
    : isPastCutoff
      ? "Booking hari ini sudah ditutup. Coba lagi besok!"
      : null;

  return (
    <AppShell surface="customer">
      <div className="space-y-8 pb-10">
        <LandingHero siteName={resolution.siteName} />
        <HowItWorksPanel />
        {blockingMessage ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-center text-sm text-destructive">
            {blockingMessage}
          </div>
        ) : (
          <BookNowButton qrId={qrId} />
        )}
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 2: Run the dev server and navigate to a test URL**

```bash
bun run dev
```

Open http://localhost:3000/q/test123 — should show the QrErrorState ("QR Code tidak valid") since the API isn't running. The page should still render without crashing.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(customer\)/q/
git commit -m "feat: add customer landing page /q/[qrId]"
```

---

## Task 7: Create OcrEditField component

**Files:**
- Create: `src/features/customer/components/ocr-edit-field.tsx`

- [ ] **Step 1: Create `ocr-edit-field.tsx`**

```tsx
// src/features/customer/components/ocr-edit-field.tsx
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";

interface OcrEditFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function OcrEditField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: OcrEditFieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-xs font-medium text-muted-foreground"
      >
        {label}
      </label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        suffix={<Pencil className="h-4 w-4 text-muted-foreground" />}
        className="font-mono font-semibold uppercase tracking-wider"
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/customer/components/ocr-edit-field.tsx
git commit -m "feat: add OcrEditField component"
```

---

## Task 8: Create capture page `/q/[qrId]/capture/page.tsx`

**Files:**
- Create: `src/app/(customer)/q/[qrId]/capture/page.tsx`

- [ ] **Step 1: Create `capture/page.tsx`**

```tsx
// src/app/(customer)/q/[qrId]/capture/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { parseAsString, useQueryStates } from "nuqs";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { OcrEditField, PhotoUploadField } from "@/features/customer/components";
import { usePhotoUpload } from "@/features/customer/hooks";

export default function CapturePage() {
  const router = useRouter();
  const { qrId } = useParams<{ qrId: string }>();
  const [{ bookingId, token }] = useQueryStates({
    bookingId: parseAsString,
    token: parseAsString,
  });

  const [plateText, setPlateText] = useState("");
  const [slotText, setSlotText] = useState("");

  const plateUpload = usePhotoUpload({
    bookingId: bookingId ?? "",
    signedToken: token ?? undefined,
  });
  const slotUpload = usePhotoUpload({
    bookingId: bookingId ?? "",
    signedToken: token ?? undefined,
  });

  // Redirect if required params are missing
  useEffect(() => {
    if (!bookingId || !token) {
      router.replace(`/q/${qrId}`);
    }
  }, [bookingId, token, router, qrId]);

  // Pre-fill OCR result when plate upload completes
  useEffect(() => {
    if (plateUpload.media?.ocrText) {
      setPlateText(plateUpload.media.ocrText);
    }
  }, [plateUpload.media?.ocrText]);

  // Pre-fill OCR result when slot upload completes
  useEffect(() => {
    if (slotUpload.media?.ocrText) {
      setSlotText(slotUpload.media.ocrText);
    }
  }, [slotUpload.media?.ocrText]);

  const canContinue =
    plateUpload.status === "success" &&
    slotUpload.status === "success" &&
    plateText.trim().length > 0 &&
    slotText.trim().length > 0;

  function handleContinue() {
    const params = new URLSearchParams({
      bookingId: bookingId ?? "",
      token: token ?? "",
      plate: plateText.trim().toUpperCase(),
      slot: slotText.trim().toUpperCase(),
    });
    router.push(`/q/${qrId}/confirm?${params.toString()}`);
  }

  return (
    <AppShell surface="customer">
      <div className="space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Langkah 1 dari 2
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">
            Foto Kendaraan
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ambil foto plat nomor dan slot parkir mobilmu.
          </p>
        </div>

        <div className="space-y-4">
          <PhotoUploadField
            id="plate-photo"
            kind="plate"
            label="Foto Plat Nomor"
            state={plateUpload}
            onSelect={(file, kind) => plateUpload.uploadPhoto({ file, kind })}
            onRetry={plateUpload.reset}
          />
          {plateUpload.status === "success" && (
            <OcrEditField
              id="plate-text"
              label="Nomor Plat (perbaiki jika ada yang salah)"
              value={plateText}
              onChange={setPlateText}
              placeholder="contoh: B 1234 SKJ"
            />
          )}

          <PhotoUploadField
            id="slot-photo"
            kind="slot"
            label="Foto Slot Parkir"
            state={slotUpload}
            onSelect={(file, kind) => slotUpload.uploadPhoto({ file, kind })}
            onRetry={slotUpload.reset}
          />
          {slotUpload.status === "success" && (
            <OcrEditField
              id="slot-text"
              label="Nomor Slot (perbaiki jika ada yang salah)"
              value={slotText}
              onChange={setSlotText}
              placeholder="contoh: P2-G15"
            />
          )}
        </div>

        <Button
          size="lg"
          className="w-full rounded-full"
          disabled={!canContinue}
          suffix={<ArrowRight className="h-4 w-4" />}
          onClick={handleContinue}
        >
          Lanjut
        </Button>
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 2: Verify the route exists**

```bash
bun run dev
```

Open http://localhost:3000/q/test123/capture?bookingId=bk_1&token=tok_abc — should render the capture page with "Langkah 1 dari 2" heading. Without `bookingId`/`token` params it should redirect to `/q/test123`.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(customer\)/q/\[qrId\]/capture/
git commit -m "feat: add capture page /q/[qrId]/capture"
```

---

## Task 9: Create BookingSummaryCard and PayButton components

**Files:**
- Create: `src/features/customer/components/booking-summary-card.tsx`
- Create: `src/features/customer/components/pay-button.tsx`

- [ ] **Step 1: Create `booking-summary-card.tsx`**

```tsx
// src/features/customer/components/booking-summary-card.tsx
import { Banknote, Car, Clock, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface BookingSummaryCardProps {
  plate: string;
  slot: string;
  siteName?: string | null;
  priceAmount?: number;
  currency?: "IDR";
  estimatedReadyAt?: string | null;
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatLocalTime(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
}

export function BookingSummaryCard({
  plate,
  slot,
  siteName,
  priceAmount,
  currency,
  estimatedReadyAt,
}: BookingSummaryCardProps) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-5">
        <div className="flex items-center gap-3">
          <Car className="h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Plat Nomor</p>
            <p className="font-mono text-lg font-bold uppercase tracking-widest text-foreground">
              {plate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Slot Parkir</p>
            <p className="font-semibold text-foreground">{slot}</p>
          </div>
        </div>

        {siteName && (
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Lokasi</p>
              <p className="font-semibold text-foreground">{siteName}</p>
            </div>
          </div>
        )}

        {priceAmount !== undefined && (
          <div className="flex items-center gap-3">
            <Banknote className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Harga</p>
              <p className="font-semibold text-foreground">
                {currency === "IDR" ? formatIDR(priceAmount) : String(priceAmount)}
              </p>
            </div>
          </div>
        )}

        {estimatedReadyAt && (
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Estimasi Selesai</p>
              <p className="font-semibold text-foreground">
                {formatLocalTime(estimatedReadyAt)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Create `pay-button.tsx`**

```tsx
// src/features/customer/components/pay-button.tsx
"use client";

import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { usePaymentAction } from "@/features/customer/hooks";

interface PayButtonProps {
  bookingId: string;
  signedToken: string;
  plateText: string;
  slotText: string;
}

export function PayButton({
  bookingId,
  signedToken,
  plateText,
  slotText,
}: PayButtonProps) {
  const { canSubmit, confirmAndRedirect, error, isSubmitting } =
    usePaymentAction(bookingId, signedToken);

  return (
    <div className="space-y-3">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error === "payment_confirm_failed"
              ? "Gagal memproses pembayaran. Coba lagi."
              : error}
          </AlertDescription>
        </Alert>
      )}
      <Button
        size="lg"
        className="w-full rounded-full"
        disabled={!canSubmit || isSubmitting}
        onClick={() => confirmAndRedirect({ plateText, slotText })}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          "Bayar Sekarang"
        )}
      </Button>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/customer/components/booking-summary-card.tsx \
        src/features/customer/components/pay-button.tsx
git commit -m "feat: add BookingSummaryCard and PayButton components"
```

---

## Task 10: Create confirm page `/q/[qrId]/confirm/page.tsx`

**Files:**
- Create: `src/app/(customer)/q/[qrId]/confirm/page.tsx`

- [ ] **Step 1: Create `confirm/page.tsx`**

```tsx
// src/app/(customer)/q/[qrId]/confirm/page.tsx
"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { parseAsString, useQueryStates } from "nuqs";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/shared";
import {
  BookingSummaryCard,
  PayButton,
} from "@/features/customer/components";
import { useBookingStatus } from "@/features/customer/hooks";

export default function ConfirmPage() {
  const router = useRouter();
  const { qrId } = useParams<{ qrId: string }>();
  const [{ bookingId, token, plate, slot }] = useQueryStates({
    bookingId: parseAsString,
    token: parseAsString,
    plate: parseAsString,
    slot: parseAsString,
  });

  useEffect(() => {
    if (!bookingId || !token || !plate || !slot) {
      router.replace(`/q/${qrId}/capture`);
    }
  }, [bookingId, token, plate, slot, router, qrId]);

  // Fetch booking once to get price, site name, estimated time
  const { booking } = useBookingStatus({
    bookingId: bookingId ?? "",
    signedToken: token ?? "",
    // Infinity disables the interval timer — just fetches once on mount
    pollIntervalMs: Infinity,
    enabled: !!bookingId && !!token,
  });

  if (!bookingId || !token || !plate || !slot) {
    return null;
  }

  return (
    <AppShell surface="customer">
      <div className="space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Langkah 2 dari 2
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">
            Konfirmasi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Periksa detail booking sebelum membayar.
          </p>
        </div>

        <BookingSummaryCard
          plate={plate}
          slot={slot}
          siteName={booking?.siteName}
          priceAmount={booking?.priceAmount}
          currency={booking?.currency}
          estimatedReadyAt={booking?.estimatedReadyAt}
        />

        <button
          type="button"
          className="flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-2 hover:underline"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Ubah foto
        </button>

        <PayButton
          bookingId={bookingId}
          signedToken={token}
          plateText={plate}
          slotText={slot}
        />
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 2: Verify the route**

Open http://localhost:3000/q/test123/confirm?bookingId=bk_1&token=tok&plate=B1234SKJ&slot=P2G15 — should show the confirm page. Without all 4 params it should redirect to capture.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(customer\)/q/\[qrId\]/confirm/
git commit -m "feat: add confirm page /q/[qrId]/confirm"
```

---

## Task 11: Create StatusHero and PaymentCheckButton components

**Files:**
- Create: `src/features/customer/components/status-hero.tsx`
- Create: `src/features/customer/components/payment-check-button.tsx`

- [ ] **Step 1: Create `status-hero.tsx`**

```tsx
// src/features/customer/components/status-hero.tsx
import {
  Car,
  CheckCircle2,
  CreditCard,
  Droplets,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared";
import {
  BOOKING_STATUS_TONES,
  BOOKING_STATUSES,
  type BookingStatus,
} from "@/features/customer/types";

interface StatusHeroProps {
  status: BookingStatus;
  plate?: string | null;
  slot?: string | null;
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  DRAFT: "Menunggu",
  PENDING: "Menunggu Pembayaran",
  PAID: "Pembayaran Diterima",
  ASSIGNED: "Menunggu Tim",
  IN_PROGRESS: "Sedang Dicuci",
  READY: "Mobil Siap!",
  CLOSED: "Selesai",
  EXPIRED: "Kadaluarsa",
  CANCELLED: "Dibatalkan",
  NEEDS_HELP: "Butuh Bantuan",
  STALE: "Tidak Aktif",
};

function StatusIcon({ status }: { status: BookingStatus }) {
  const base = "h-10 w-10";
  if (status === BOOKING_STATUSES.READY || status === BOOKING_STATUSES.CLOSED) {
    return <CheckCircle2 className={cn(base, "text-primary")} />;
  }
  if (
    status === BOOKING_STATUSES.IN_PROGRESS ||
    status === BOOKING_STATUSES.ASSIGNED
  ) {
    return <Droplets className={cn(base, "text-primary")} />;
  }
  if (status === BOOKING_STATUSES.PENDING) {
    return <CreditCard className={cn(base, "text-primary")} />;
  }
  if (
    status === BOOKING_STATUSES.EXPIRED ||
    status === BOOKING_STATUSES.CANCELLED ||
    status === BOOKING_STATUSES.NEEDS_HELP
  ) {
    return <XCircle className={cn(base, "text-destructive")} />;
  }
  return <Car className={cn(base, "text-muted-foreground")} />;
}

export function StatusHero({ status, plate, slot }: StatusHeroProps) {
  const isActive =
    status === BOOKING_STATUSES.ASSIGNED ||
    status === BOOKING_STATUSES.IN_PROGRESS;
  const isReady = status === BOOKING_STATUSES.READY;

  return (
    <div className="space-y-4 text-center">
      <div
        className={cn(
          "mx-auto flex h-24 w-24 items-center justify-center rounded-full",
          isReady && "bg-primary/10",
          isActive && "animate-pulse bg-primary/10",
          !isReady && !isActive && "bg-muted"
        )}
      >
        <StatusIcon status={status} />
      </div>

      <StatusBadge tone={BOOKING_STATUS_TONES[status]}>
        {STATUS_LABELS[status]}
      </StatusBadge>

      {(plate || slot) && (
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          {plate && (
            <span className="font-mono font-semibold uppercase">{plate}</span>
          )}
          {slot && <span>Slot {slot}</span>}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create `payment-check-button.tsx`**

```tsx
// src/features/customer/components/payment-check-button.tsx
"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentCheckButtonProps {
  onCheck: () => void;
  delayMs?: number;
}

export function PaymentCheckButton({
  onCheck,
  delayMs = 30_000,
}: PaymentCheckButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsVisible(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  if (!isVisible) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full"
      prefix={<RefreshCw className="h-4 w-4" />}
      onClick={onCheck}
    >
      Cek Status Pembayaran
    </Button>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/customer/components/status-hero.tsx \
        src/features/customer/components/payment-check-button.tsx
git commit -m "feat: add StatusHero and PaymentCheckButton components"
```

---

## Task 12: Create status page `/booking/[id]/status/page.tsx`

**Files:**
- Create: `src/app/(customer)/booking/[id]/status/page.tsx`

- [ ] **Step 1: Create `status/page.tsx`**

```tsx
// src/app/(customer)/booking/[id]/status/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { AppShell } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  BookingStatusTimeline,
  PaymentCheckButton,
  StatusHero,
} from "@/features/customer/components";
import { useBookingStatus } from "@/features/customer/hooks";
import { BOOKING_STATUSES } from "@/features/customer/types";

export default function StatusPage() {
  const { id: bookingId } = useParams<{ id: string }>();
  const [token] = useQueryState("token", parseAsString);

  const { booking, isLoading, refresh } = useBookingStatus({
    bookingId,
    signedToken: token ?? "",
    enabled: !!token,
  });

  if (isLoading && !booking) {
    return (
      <AppShell surface="customer">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  if (!booking) {
    return (
      <AppShell surface="customer">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
          <p className="font-semibold text-foreground">Booking tidak ditemukan</p>
          <p className="text-sm text-muted-foreground">
            Hubungi dukungan jika kamu merasa ini adalah kesalahan.
          </p>
        </div>
      </AppShell>
    );
  }

  const isPending = booking.status === BOOKING_STATUSES.PENDING;
  const isReady = booking.status === BOOKING_STATUSES.READY;
  const isClosed = booking.status === BOOKING_STATUSES.CLOSED;
  const isError = [
    BOOKING_STATUSES.EXPIRED,
    BOOKING_STATUSES.CANCELLED,
    BOOKING_STATUSES.NEEDS_HELP,
  ].includes(booking.status);

  return (
    <AppShell surface="customer">
      <div className="space-y-8">
        <StatusHero
          status={booking.status}
          plate={booking.plateText}
          slot={booking.slotText}
        />

        {isPending && (
          <PaymentCheckButton onCheck={refresh} />
        )}

        {isReady && (
          <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
            <p className="text-lg font-bold text-foreground">
              Mobil kamu sudah bersih!
            </p>
            {booking.slotText && (
              <p className="text-sm text-muted-foreground">
                Temukan mobilmu di slot{" "}
                <span className="font-semibold">{booking.slotText}</span>.
              </p>
            )}
            <Button asChild size="lg" className="w-full rounded-full">
              <Link
                href={`/booking/${bookingId}/rate?token=${encodeURIComponent(token ?? "")}`}
              >
                Beri Rating
              </Link>
            </Button>
          </div>
        )}

        {isClosed && (
          <p className="text-center text-sm text-muted-foreground">
            Terima kasih sudah menggunakan Park & Shine!
          </p>
        )}

        {isError && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-center text-sm text-destructive">
            Terjadi masalah dengan bookingmu. Hubungi kami untuk bantuan.
          </div>
        )}

        {booking.statusHistory.length > 0 && (
          <details>
            <summary className="cursor-pointer select-none text-sm font-medium text-muted-foreground">
              Riwayat Status
            </summary>
            <div className="mt-3">
              <BookingStatusTimeline events={booking.statusHistory} />
            </div>
          </details>
        )}
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 2: Verify the route**

Open http://localhost:3000/booking/bk_1/status?token=tok — should render the loading spinner (then "booking tidak ditemukan" since the API is offline). No crash.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(customer\)/booking/
git commit -m "feat: add live status page /booking/[id]/status"
```

---

## Task 13: Create StarRating component and rating page

**Files:**
- Create: `src/features/customer/components/star-rating.tsx`
- Create: `src/app/(customer)/booking/[id]/rate/page.tsx`

- [ ] **Step 1: Create `star-rating.tsx`**

```tsx
// src/features/customer/components/star-rating.tsx
"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

export function StarRating({ value, onChange, max = 5 }: StarRatingProps) {
  return (
    <div className="flex gap-1" role="group" aria-label="Rating bintang">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star} bintang`}
          aria-pressed={value >= star}
          onClick={() => onChange(star)}
          className={cn(
            "rounded-full p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            value >= star ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Star
            className="h-9 w-9"
            fill={value >= star ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create `rate/page.tsx`**

```tsx
// src/app/(customer)/booking/[id]/rate/page.tsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/features/customer/components";
import api from "@/lib/axios";
import { mutationKeys } from "@/lib/query-keys";
import type { RatingPayload } from "@/features/customer/types";

export default function RatePage() {
  const { id: bookingId } = useParams<{ id: string }>();
  const [token] = useQueryState("token", parseAsString);
  const [score, setScore] = useState(0);
  const [reason, setReason] = useState("");
  const [isDone, setIsDone] = useState(false);

  const mutation = useMutation({
    meta: { persist: false },
    mutationFn: async (payload: RatingPayload) => {
      await api.post(`/v1/bookings/${bookingId}/rate`, payload, {
        headers: { "X-Booking-Token": token ?? "" },
      });
    },
    mutationKey: mutationKeys.customer.rate(bookingId),
    // Rating is optional — settle to done regardless of success/error
    onSettled: () => setIsDone(true),
  });

  function handleSubmit() {
    if (score === 0) return;
    mutation.mutate({
      score: score as RatingPayload["score"],
      reason: reason.trim() || undefined,
    });
  }

  if (isDone) {
    return (
      <AppShell surface="customer">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <p className="text-xl font-bold text-foreground">Terima kasih!</p>
          <p className="text-sm text-muted-foreground">
            Sampai jumpa di Park & Shine lagi.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell surface="customer">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Bagaimana pengalamanmu?
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bantu kami menjadi lebih baik.
          </p>
        </div>

        <StarRating value={score} onChange={setScore} />

        {score > 0 && score <= 2 && (
          <div className="space-y-1.5">
            <label
              htmlFor="reason"
              className="text-sm font-medium text-foreground"
            >
              Ceritakan masalahnya (opsional)
            </label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Tulis pengalamanmu di sini..."
              rows={3}
            />
          </div>
        )}

        <div className="space-y-2">
          <Button
            size="lg"
            className="w-full rounded-full"
            disabled={score === 0 || mutation.isPending}
            onClick={handleSubmit}
          >
            {mutation.isPending ? "Mengirim..." : "Kirim Rating"}
          </Button>
          <button
            type="button"
            className="w-full text-center text-sm text-muted-foreground underline-offset-2 hover:underline"
            onClick={() => setIsDone(true)}
          >
            Lewati
          </button>
        </div>
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/customer/components/star-rating.tsx \
        src/app/\(customer\)/booking/\[id\]/rate/
git commit -m "feat: add StarRating component and rating page /booking/[id]/rate"
```

---

## Task 14: Update customer component and feature exports

**Files:**
- Modify: `src/features/customer/components/index.ts`
- Modify: `src/features/customer/index.ts`

- [ ] **Step 1: Replace `src/features/customer/components/index.ts` with full exports**

```typescript
// src/features/customer/components/index.ts
export { BookingStatusTimeline } from "./booking-status-timeline";
export { BookingSummaryCard } from "./booking-summary-card";
export { BookNowButton } from "./book-now-button";
export { HowItWorksPanel } from "./how-it-works-panel";
export { LandingHero } from "./landing-hero";
export { OcrEditField } from "./ocr-edit-field";
export { PayButton } from "./pay-button";
export { PaymentCheckButton } from "./payment-check-button";
export { PhotoUploadField } from "./photo-upload-field";
export { QrErrorState } from "./qr-error-state";
export { StarRating } from "./star-rating";
export { StatusHero } from "./status-hero";
export { WhatsAppSupportWidget } from "./whatsapp-support-widget";
```

- [ ] **Step 2: Read `src/features/customer/index.ts` and add any missing re-exports**

The feature index should re-export components, hooks, and types. Verify it includes:

```typescript
// src/features/customer/index.ts
export * from "./components";
export * from "./hooks";
export * from "./types";
```

- [ ] **Step 3: Run TypeScript check**

```bash
bun run build 2>&1 | head -60
```

Expected: No TypeScript errors. If there are type errors, fix them before committing.

- [ ] **Step 4: Commit**

```bash
git add src/features/customer/components/index.ts src/features/customer/index.ts
git commit -m "feat: update customer feature exports — all new components wired"
```

---

## Task 15: Final smoke test and lint

- [ ] **Step 1: Run ESLint**

```bash
bun run lint
```

Expected: No errors (warnings are acceptable).

- [ ] **Step 2: Run production build**

```bash
bun run build
```

Expected: Build completes without errors. All 5 customer routes should appear in the output:
- `(customer)/q/[qrId]`
- `(customer)/q/[qrId]/capture`
- `(customer)/q/[qrId]/confirm`
- `(customer)/booking/[id]/status`
- `(customer)/booking/[id]/rate`

- [ ] **Step 3: Manual smoke test flow**

Start the dev server with `bun run dev` and verify each page renders correctly at these URLs:

| URL | Expected |
|---|---|
| `http://localhost:3000/q/test123` | QrErrorState ("QR Code tidak valid") — server fetch fails gracefully |
| `http://localhost:3000/q/test123/capture?bookingId=bk1&token=tok` | Step 1 of 2 heading, two PhotoUploadField inputs |
| `http://localhost:3000/q/test123/capture` | Redirects to `/q/test123` (missing params) |
| `http://localhost:3000/q/test123/confirm?bookingId=bk1&token=tok&plate=B1234SKJ&slot=P2G15` | Step 2 of 2, BookingSummaryCard, PayButton |
| `http://localhost:3000/booking/bk1/status?token=tok` | Loading spinner, then "booking tidak ditemukan" |
| `http://localhost:3000/booking/bk1/rate?token=tok` | Star rating UI, 5 tappable stars |

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete customer web app — all 5 pages implemented"
```
