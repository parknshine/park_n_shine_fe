# Park & Shine — Frontend PRD

**Confidential — For internal use only**

```
Document version  1.0 (MVP)
Status            Draft — For Review
Owner             Engineering + Design Team — Park & Shine
Date              May 2026
Derived from      PRD v1.1 (May 12, 2026)
Audience          Frontend Engineers, UI/UX Designers
```

---

## Daftar Isi

1. [Ringkasan Frontend](#1-ringkasan-frontend)
2. [Tiga Surface Aplikasi](#2-tiga-surface-aplikasi)
3. [Tech Stack Frontend](#3-tech-stack-frontend)
4. [Customer Web App](#4-customer-web-app)
   - 4.1 Daftar Halaman & Flow
   - 4.2 Functional Requirements
   - 4.3 Edge Cases & Error States
5. [Crew Operator App](#5-crew-operator-app)
   - 5.1 Daftar Halaman & Flow
   - 5.2 Functional Requirements
   - 5.3 Edge Cases & Error States
6. [Admin Console](#6-admin-console)
   - 6.1 Daftar Halaman & Flow
   - 6.2 Functional Requirements
7. [UI / UX Requirements (Global)](#7-ui--ux-requirements-global)
8. [Non-Functional Requirements (Frontend)](#8-non-functional-requirements-frontend)
9. [API Endpoints yang Dikonsumsi Frontend](#9-api-endpoints-yang-dikonsumsi-frontend)
10. [State Machine Booking](#10-state-machine-booking)
11. [Out of Scope (MVP)](#11-out-of-scope-mvp)

---

## 1. Ringkasan Frontend

Park & Shine memiliki **tiga aplikasi frontend** yang berjalan di platform web. Ketiganya dibangun dengan stack yang sama (Next.js + React + TypeScript) dan di-deploy di Vercel.

| Aplikasi | Pengguna | Device Target | Auth |
|---|---|---|---|
| **Customer Web App** | Pelanggan umum | Mobile (360 px+), Android Chrome & iOS Safari | Tanpa login — signed booking token |
| **Crew Operator App** | Crew / petugas cuci | Mobile | 6-digit shift code + PIN |
| **Admin Console** | Site supervisor & operations | Desktop (utama) | SSO Google Workspace |

Tidak ada native app (iOS/Android) dalam MVP. Semua berjalan sebagai **PWA / Mobile Web**.

---

## 2. Tiga Surface Aplikasi

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  Customer Web App   │  │  Crew Operator App  │  │   Admin Console     │
│   PWA / Mobile Web  │  │   PWA / Mobile Web  │  │    Internal Web     │
└─────────┬───────────┘  └─────────┬───────────┘  └─────────┬───────────┘
          │                        │                          │
          └────────────────────────┴──────────────────────────┘
                                   │
                            API Gateway (REST/JSON, JWT)
```

---

## 3. Tech Stack Frontend

| Layer | Pilihan | Alasan |
|---|---|---|
| Framework | **Next.js (App Router)** | Sudah dipakai di marketing site (park-shine.vercel.app); PWA-friendly; server components meminimalkan first-load |
| UI Library | **React + TypeScript** | Shared component library untuk ketiga app |
| Hosting | **Vercel** | Kontinuitas dengan marketing site; zero-ops untuk MVP |
| Styling | Konsisten dengan brand marketing site (bright palette, family-friendly) | — |
| Localization | i18n dengan key-based copy — **id-ID** dan **en-US** | Copy tidak boleh hardcoded |
| Observability | **Sentry** (error tracking), **OpenTelemetry** (tracing) | Wajib dari hari pertama |

---

## 4. Customer Web App

### 4.1 Daftar Halaman & Flow

```
[QR Scan] → /q/{qr_id}
      ↓
[Landing Page] — tampilkan nama site + CTA "Book a Wash"
      ↓
[Capture Page] — foto plat + foto slot parkir
      ↓
[Confirm Page] — review plat, slot, harga, estimasi selesai
      ↓
[Redirect ke Payment Gateway] (Midtrans / Xendit hosted page)
      ↓
[Status Page] — live tracking: PAID → ASSIGNED → IN_PROGRESS → READY
      ↓
[Rating Page] — beri rating 1–5 (opsional)
```

---

### 4.2 Functional Requirements

#### FR-01 — Site-Scoped QR Landing Page ✅ Must
- QR code merupakan URL `https://book.park-shine.com/q/{qr_id}`
- Server resolve `qr_id` ke nama site; **site identifier tidak di-embed di QR**
- Halaman landing menampilkan **nama site** dan satu tombol CTA: **"Book a Wash"**
- Jika QR sudah dirotasi (`rotated_at` terlewati), tampilkan pesan error yang jelas
- Jika site sedang `intake_paused = true`, tampilkan: **"Layanan Sementara Tidak Tersedia"**
- Jika sudah melewati `cutoff_time`, tampilkan: **"Booking sudah ditutup untuk hari ini"**

#### FR-02 — Plate & Slot Photo Capture with OCR ✅ Must
- Dua upload terpisah: **foto plat nomor** dan **foto signage slot parkir**
- Keduanya **wajib diisi** sebelum bisa lanjut
- Setiap foto menampilkan **progress bar 0–100%** saat upload
- Setelah upload berhasil, sistem menampilkan hasil OCR (teks plat & slot)
- Customer **dapat mengedit** hasil OCR secara manual sebelum lanjut
- Jika OCR gagal baca → tampilkan field input manual, booking tetap bisa dilanjutkan
- **Kompresi client-side**: foto dikompresi ke < 500 KB sebelum dikirim (FR-20)
- **Auto-retry**: jika koneksi putus saat upload, client otomatis retry dengan exponential backoff

#### FR-03 — Hosted Payment Flow ✅ Must
- Setelah confirm, customer di-redirect ke halaman payment gateway (Midtrans / Xendit)
- Metode pembayaran: e-wallet (GoPay, OVO, DANA, ShopeePay), virtual account (BCA, Mandiri, BNI, BRI), kartu kredit/debit
- **Tombol "Pay" harus di-disable setelah tap pertama** untuk mencegah double charge (FR-19 — payment idempotency di UI level)
- Booking ID digunakan sebagai idempotency key di backend
- Setelah gateway redirect kembali → customer langsung ke Status Page

#### FR-04 — Live Booking Status Page ✅ Must
- Diakses via **signed link** tanpa login
- Menampilkan status real-time booking:

  | Status | Label yang Ditampilkan |
  |---|---|
  | PAID | Antrian — Menunggu crew |
  | ASSIGNED | Crew dalam perjalanan |
  | IN_PROGRESS | Sedang dicuci |
  | READY | Mobil Anda sudah bersih! |
  | EXPIRED | Booking kadaluarsa |
  | CANCELLED | Booking dibatalkan |

- Setiap perubahan status menampilkan **timestamp**
- Polling otomatis atau WebSocket untuk update real-time
- Jika status tidak berubah ke PAID dalam **30 detik** setelah redirect dari gateway → tampilkan tombol **"Cek Status Pembayaran"** (FR-23)

#### FR-08 — Completion Notification ✅ Must
- Ketika booking READY, customer menerima notifikasi melalui:
  1. **Web Push** (jika sudah grant permission di status page)
  2. **WhatsApp** (via WhatsApp Business API — templated message)
  3. **On-page polling fallback** — status screen otomatis flip ke "Mobil Anda sudah bersih!" + notification sound
- Customer tidak perlu install app apapun

#### FR-12 — Post-Wash Rating 🟡 Should
- Setelah status READY, tampilkan prompt rating **1–5 bintang**
- Jika rating ≤ 2, buka **free-text field** untuk alasan
- Rating bersifat opsional; bisa di-skip
- Rating tersimpan di booking ID yang sama

#### FR-13 — Multilingual UI (ID / EN) 🟡 Should
- Semua copy disimpan sebagai **translation keys**, tidak hardcoded
- Dua locale wajib: **id-ID** (default) dan **en-US**
- Language switcher tersedia di setiap halaman customer

#### FR-16 — WhatsApp Click-to-Chat Widget ✅ Must
- Widget WhatsApp (ikon floating) **tampil di setiap halaman** customer
- Menggunakan link `https://wa.me/<number>` — **bukan** WhatsApp Business API
- Tidak membutuhkan integrasi backend apapun
- Tap widget langsung buka WhatsApp dengan pre-filled message opsional

#### FR-19 — Payment Idempotency (UI) ✅ Must
- Tombol "Pay" di-disable segera setelah pertama kali di-tap
- Jika halaman di-refresh saat checkout, cek status booking sebelum membuat payment intent baru
- Loading state yang jelas saat proses berlangsung

#### FR-20 — Client-side Image Compression & Retry ✅ Must
- Kompresi gambar sebelum upload ke **< 500 KB** per foto
- Progress bar **0–100%** per foto saat upload
- Auto-retry dengan **exponential backoff** jika koneksi putus
- User melihat status upload yang jelas (uploading / success / failed / retrying)

#### FR-23 — Customer-Initiated Payment Status Check ✅ Must
- Jika status page belum flip ke PAID dalam 30 detik → tampilkan tombol **"Cek Status Pembayaran"**
- Tap tombol → frontend call endpoint reconciliation ke backend → backend query ke payment gateway
- Jika reconciliation berhasil → status langsung diperbarui
- Jika tetap gagal → tampilkan instruksi untuk chat WhatsApp support

---

### 4.3 Edge Cases & Error States (Customer)

| Skenario | Perilaku Frontend |
|---|---|
| OCR gagal baca plat/slot | Tampilkan input manual; booking bisa lanjut |
| Upload foto gagal | Tampilkan error per-foto, tombol retry per foto |
| Customer tutup browser setelah bayar | Status page masih bisa diakses via signed link; notif via WhatsApp/push |
| Payment gagal di gateway | Tetap di PENDING 15 menit, tampilkan tombol retry |
| Double tap "Pay" | Tombol langsung disabled setelah tap pertama |
| Status tidak flip dalam 30 detik | Tampilkan tombol "Cek Status Pembayaran" |
| QR tidak valid / kadaluarsa | Tampilkan pesan error + instruksi hubungi lokasi |
| Site paused / closed | Tampilkan pesan informatif di landing page |

---

## 5. Crew Operator App

### 5.1 Daftar Halaman & Flow

```
[Login Page] — masukkan shift code (6 digit) + PIN
      ↓
[Home / Queue Page] — tombol "Ambil Job Berikutnya"
      ↓
[Job Detail Page] — tampilkan plat, slot, foto kendaraan, countdown ETA
      ↓
[Verify Plate Page] — konfirmasi plat cocok atau "Tidak Ditemukan"
      ↓
[Before Photos Page] — ambil 4 foto (depan, belakang, kiri, kanan)
      ↓
[Wash Checklist Page] — SOP checklist langkah demi langkah
      ↓
[Finish Page] — ambil foto "after" + tap "Selesai"
```

---

### 5.2 Functional Requirements

#### FR-05 — Crew Dispatch Queue ✅ Must
- Halaman home menampilkan satu tombol besar: **"Ambil Job Berikutnya"**
- Crew **tidak memilih** booking — sistem assign booking PAID tertua di site yang sama
- Jika tidak ada job → tampilkan pesan **"Tidak ada job saat ini"**
- Setelah claim berhasil → langsung navigasi ke Job Detail

#### FR-06 — Plate Match Confirmation ✅ Must
- Tampilkan foto plat dari customer (yang diupload saat booking)
- Tampilkan teks plat hasil OCR
- Dua tombol: **"Plat Cocok"** dan **"Tidak Ditemukan"**
- Tap "Plat Cocok" → booking transisi ke IN_PROGRESS, SLA timer mulai
- Tap "Tidak Ditemukan" → booking transisi ke NEEDS_HELP, escalation ke supervisor

#### FR-07 — Wash SOP Checklist ✅ Must
- Checklist multi-step mengikuti SOP cuci waterless
- Setiap tap checklist item **langsung disimpan ke server** sebelum UI update
- Jika browser refresh atau app restart → **resume dari langkah terakhir** yang sudah tersimpan (FR-18)
- Tidak bisa skip langkah; harus urut
- Timestamp tercatat per langkah

#### FR-15 — Crew Four-Angle "Before" Photos ✅ Must
- Wajib ambil **4 foto kendaraan** sebelum mulai cuci:
  - Depan
  - Belakang
  - Sisi Kiri
  - Sisi Kanan
- Keempat foto wajib diisi; tidak bisa lanjut ke checklist jika belum lengkap
- Foto tersimpan di booking sebagai bukti kondisi sebelum cuci
- Progress bar per foto saat upload

#### FR-18 — Server-side Persistence of Checklist State ✅ Must
- Setiap interaksi checklist disimpan ke server secara **synchronous sebelum UI update**
- Jika crew login ulang (HP mati, browser refresh, session expired) → sistem otomatis resume ke booking aktif + langkah checklist terakhir
- Tidak ada progres yang hilang

#### FR-22 — Crew Session Auto-Expiry ✅ Must
- Session crew otomatis **expire setelah 12 jam inaktivitas**
- Setelah expired → next request langsung redirect ke login page
- Login ulang memerlukan shift code + PIN baru
- Session juga diinvalidasi ketika shift berakhir atau shift code dirotasi

---

### 5.3 Edge Cases & Error States (Crew)

| Skenario | Perilaku Frontend |
|---|---|
| Tidak ada job tersedia | Tampilkan "Tidak ada job saat ini", polling otomatis |
| Plat tidak cocok | Tap "Tidak Ditemukan" → escalation ke supervisor |
| Upload before-photo gagal | Error per-foto, retry; tidak bisa lanjut sebelum 4 foto lengkap |
| Browser refresh saat checklist | Resume dari langkah terakhir yang tersimpan |
| Session expired | Redirect ke login, minta shift code + PIN baru |
| Kendaraan pergi saat dicuci | Tap "Kendaraan Pergi" → supervisor adjudikasi |

---

## 6. Admin Console

### 6.1 Daftar Halaman & Flow

```
[Login] — SSO Google Workspace
      ↓
[Dashboard / Live Queue] — semua booking di site ini, grouped by status
      ↓
[Escalations Panel] — job bermasalah di bagian atas
      ↓
[Booking Detail] — detail booking + riwayat status
      ↓
[Manual Status Override] — transisi status + input reason code
      ↓
[Refund Modal] — full / partial refund + reason code
      ↓
[Reports Page] — daily KPI summary
```

---

### 6.2 Functional Requirements

#### FR-09 — Supervisor Live Queue & Reassignment ✅ Must
- Live queue menampilkan semua booking di site ini, dikelompokkan per status:
  - PAID (antrian)
  - ASSIGNED
  - IN_PROGRESS
  - READY
  - NEEDS_HELP / STALE (escalation)
- Setiap booking card menampilkan: plat, slot, nama crew (jika ada), elapsed time per stage
- Supervisor dapat **reassign** booking ke crew lain di site yang sama dengan satu aksi

#### FR-10 — Refunds with Reason Code ✅ Must
- Dari booking detail, supervisor dapat trigger **full atau partial refund**
- Wajib pilih **reason code** dari dropdown (tidak bisa kosong)
- Konfirmasi modal sebelum refund diproses
- Riwayat refund ditampilkan di booking detail

#### FR-11 — Daily Site Report ✅ Must
- Halaman Reports menampilkan KPI harian per site:
  - Total bookings
  - Completion rate
  - SLA hit rate (% selesai ≤ 30 menit)
  - Average rating
  - Revenue
- Data dapat di-export atau dikirim via email otomatis

#### FR-17 — Admin Manual Status Override ✅ Must
- Supervisor dapat mengubah status booking secara manual:

  | Transisi | Use Case |
  |---|---|
  | PENDING → PAID | Bank konfirmasi lunas tapi webhook tidak masuk |
  | PENDING → CANCELLED | Pembayaran tidak selesai, pelanggan sudah pergi |
  | PAID → CANCELLED (+ refund) | Mobil tidak bisa dicuci (kendaraan di sekitarnya terlalu rapat) |

- Setiap override **wajib ada reason code** yang diinput supervisor
- Semua override tercatat di **audit log** (tidak bisa dihapus)

#### FR-21 — Stale-Job Timeout Alerts ✅ Must
- Booking PAID yang belum di-claim lebih dari **20 menit** (configurable) muncul di **Escalations Panel** dengan label "STALE"
- Alert menonjol (badge merah / highlight) agar supervisor mudah lihat
- Supervisor dapat: re-prioritize, cancel + refund, atau extend timeout

---

## 7. UI / UX Requirements (Global)

### Prinsip Umum

| Requirement | Detail |
|---|---|
| **Mobile-first** | Customer & Crew app: minimum viewport **360 px**; Android Chrome & iOS Safari |
| **No login (customer)** | Customer tidak pernah membuat akun; booking diidentifikasi via signed link |
| **Single primary action per screen** | Setiap halaman hanya memiliki **satu CTA utama** |
| **Time-to-pay ≤ 90 detik** | Dari landing page sampai redirect ke payment gateway pada koneksi 4G |

### Visual Feedback

| Elemen | Spesifikasi |
|---|---|
| Upload progress | Progress bar **0–100%** per foto; tampil selama upload berlangsung |
| Payment pending | Setelah 30 detik tanpa status flip → tampilkan tombol "Cek Status Pembayaran" |
| Checklist tap | Response visual segera (optimistic UI); rollback jika server gagal simpan |
| Loading states | Semua aksi async memiliki loading indicator |

### Aksesibilitas

- **WCAG 2.1 AA** — contrast ratio, touch target sizes minimum 44×44 px
- Semua gambar memiliki **alt text**
- Navigasi keyboard berfungsi untuk Admin Console

### Lokalisasi

- Copy disimpan sebagai **translation keys** — tidak ada string hardcoded di komponen
- Dua locale: **id-ID** (default) dan **en-US**
- Language switcher di customer app

### Brand & Tone

- Suara brand: **friendly, family-oriented**
- Palet warna: **bright**, konsisten dengan marketing site di `park-shine.vercel.app`
- Tidak ada cross-sell, loyalty pitch, atau screen account selama booking flow

### WhatsApp Support Widget

- Ikon WhatsApp **floating** di setiap halaman Customer App
- Link: `https://wa.me/<nomor>` (click-to-chat only, bukan WhatsApp Business API)
- Tidak membutuhkan backend integration

---

## 8. Non-Functional Requirements (Frontend)

| Area | Requirement | Target |
|---|---|---|
| **Performance** | Time to Interactive (TTI) — mid-range Android, 4G | ≤ 2.5 detik |
| **Accessibility** | WCAG conformance level | 2.1 AA |
| **Internationalization** | Locale yang didukung saat launch | id-ID, en-US |
| **Browser Support** | Android Chrome, iOS Safari | Latest 2 major versions |
| **Viewport** | Minimum width | 360 px |
| **Offline / Connection Loss** | Upload retry otomatis, checklist persist | Exponential backoff |
| **Security** | Tidak ada PAN data diproses di frontend | Payment via hosted gateway page |
| **Error Tracking** | Sentry dipasang di semua surface | Wajib dari day 1 |

---

## 9. API Endpoints yang Dikonsumsi Frontend

| Method | Path | Digunakan oleh |
|---|---|---|
| `POST` | `/v1/bookings` | Customer — create draft booking dari QR scan |
| `POST` | `/v1/bookings/{id}/media` | Customer — upload foto plat/slot; dapat hasil OCR |
| `POST` | `/v1/bookings/{id}/confirm` | Customer — konfirmasi data, buat payment intent |
| `GET` | `/v1/bookings/{id}` | Customer — polling live status (signed token) |
| `POST` | `/v1/payments/webhook` | *Backend only* — tidak dipanggil langsung oleh frontend |
| `POST` | `/v1/crew/sessions` | Crew — login dengan shift code + PIN |
| `POST` | `/v1/crew/jobs/next` | Crew — claim job berikutnya |
| `POST` | `/v1/crew/jobs/{id}/verify` | Crew — konfirmasi plate match atau flag issue |
| `POST` | `/v1/crew/jobs/{id}/complete` | Crew — mark job READY dengan after-photo |
| `GET` | `/v1/admin/sites/{id}/queue` | Admin — live queue view |
| `POST` | `/v1/admin/bookings/{id}/refund` | Admin — issue refund dengan reason code |

> Semua endpoint: JSON over HTTPS, versioned di `/v1`, auth via JWT.  
> Customer endpoints menggunakan signed booking token, bukan user account.  
> Idempotency key wajib pada semua mutating endpoint.

---

## 10. State Machine Booking

Frontend harus menangani semua state berikut dan menampilkan UI yang sesuai:

```
DRAFT → PENDING → PAID → ASSIGNED → IN_PROGRESS → READY → CLOSED
                    ↓         ↓            ↓           ↓
                EXPIRED   CANCELLED    CANCELLED    CANCELLED
                                     NEEDS_HELP
                                       STALE
```

| State | Customer UI | Crew UI | Admin UI |
|---|---|---|---|
| DRAFT | Loading / redirect | — | — |
| PENDING | "Menunggu konfirmasi pembayaran" + retry | — | Queue |
| PAID | "Antrian — Menunggu crew" | Tersedia di dispatch queue | Queue |
| ASSIGNED | "Crew dalam perjalanan" | Job detail aktif | Queue |
| IN_PROGRESS | "Sedang dicuci" + SLA countdown | Checklist aktif | Queue |
| READY | "Mobil Anda sudah bersih! 🎉" + rating prompt | Selesai, kembali ke home | Queue |
| CLOSED | "Terima kasih" | — | Archive |
| EXPIRED | "Booking kadaluarsa" | — | Queue |
| CANCELLED | "Booking dibatalkan — Refund diproses" | — | Queue |
| NEEDS_HELP | "Kami membutuhkan info lebih lanjut" + WhatsApp | Escalated | Escalations panel |
| STALE | — | — | Escalations panel (alert merah) |

---

## 11. Out of Scope (MVP)

Item berikut **tidak** dikerjakan di MVP frontend:

- Native iOS / Android app (React Native, Flutter, dll.)
- Loyalty program, referral codes, gift cards UI
- Subscription / wash bundle flow
- Multiple wash tier selection
- In-app chat antara customer dan crew
- AI dynamic pricing UI
- B2B / fleet invoicing portal
- Multi-city site selector untuk admin
- Promo / discount code input (FR-14 — Could)

---

*End of document — Park & Shine Frontend PRD v1.0*
