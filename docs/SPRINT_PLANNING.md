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

## Ringkasan

| Sprint | Surface | Nama | Status | Points |
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

**Goal:** Setup arsitektur, tooling, dan shared infrastructure untuk ketiga surface.

### Tickets

| ID | Deskripsi | Points |
|----|-----------|--------|
| INFRA-01 | Next.js App Router setup, route groups `(customer)` `(crew)` `(admin)` | 3 |
| INFRA-02 | Design tokens, Tailwind v4, shadcn/ui primitives (Button, Input, Dialog, dll.) | 3 |
| INFRA-03 | Zustand stores (auth, ui), axios instance, TanStack Query provider | 3 |
| INFRA-04 | `AppShell` layout, `ThemeProvider`, PWA manifest + service worker | 3 |
| INFRA-05 | Query/mutation key factory (`query-keys.ts`), API response/error contracts | 2 |

**Total: 14 points**

---

## Sprint 1 — Customer: Booking Entry Flow ✅ Done

**Goal:** Customer bisa scan QR, buka landing page, foto plat + slot, lanjut ke konfirmasi.

**FR:** FR-01, FR-02, FR-20 (sebagian)

### Tickets

| ID | Deskripsi | FR | Points |
|----|-----------|-----|--------|
| CUST-01 | QR Landing Page `/q/[qrId]` — resolve site, CTA "Book a Wash", cutoff/pause states | FR-01 | 3 |
| CUST-02 | `BookNowButton` — create booking mutation, navigate ke capture dengan `bookingId` + `token` | FR-01 | 2 |
| CUST-03 | Capture Page `/q/[qrId]/capture` — dua upload foto, OCR pre-fill, validasi wajib keduanya | FR-02 | 5 |
| CUST-04 | `PhotoUploadField` component — progress bar, states (idle/uploading/success/error/retrying) | FR-02, FR-20 | 3 |
| CUST-05 | `OcrEditField` component — field editable untuk koreksi hasil OCR | FR-02 | 2 |
| CUST-06 | `usePhotoUpload` hook — upload ke `/v1/bookings/{id}/media`, state machine, OCR hasil | FR-02, FR-20 | 5 |

**Total: 20 points**

---

## Sprint 2 — Customer: Payment & Status Flow ✅ Done

**Goal:** Customer bisa konfirmasi booking, bayar, dan track status real-time.

**FR:** FR-03, FR-04, FR-16, FR-19, FR-23

### Tickets

| ID | Deskripsi | FR | Points |
|----|-----------|-----|--------|
| CUST-07 | Confirm Page `/q/[qrId]/confirm` — review plat/slot/harga/estimasi, confirm mutation | FR-03, FR-19 | 5 |
| CUST-08 | `PayButton` — disabled setelah tap pertama, idempotency key, redirect ke payment gateway | FR-03, FR-19 | 3 |
| CUST-09 | Status Page `/booking/[id]/status` — polling tiap 5s, label per state machine | FR-04 | 5 |
| CUST-10 | `PaymentCheckButton` — timer 30s, call reconciliation endpoint, fallback WhatsApp | FR-23 | 3 |
| CUST-11 | `WhatsAppSupportWidget` — floating widget `wa.me`, tampil di semua halaman customer | FR-16 | 2 |

**Total: 18 points**

---

## Sprint 3 — Customer: Customer Polish 🔲 Pending

**Goal:** Semua halaman customer *production-ready* — kompresi foto, retry otomatis, notifikasi push, rating, i18n.

**FR:** FR-08, FR-12, FR-13, FR-20

### Tickets

---

#### CUST-12 — Rating Page Integration
**FR:** FR-12 | **Points:** 3 | **Priority:** Medium

**Deskripsi:**  
Halaman `/booking/[id]/rate` sudah ada strukturnya. Ticket ini memastikan integrasi penuh dengan API dan behavior sesuai PRD.

**Acceptance Criteria:**
- [ ] `StarRating` component bisa dipilih 1–5 bintang
- [ ] Jika rating ≤ 2, muncul free-text field "Apa yang kurang?"
- [ ] Tombol "Kirim" memanggil `POST /v1/bookings/{id}/rate`
- [ ] Ada tombol "Lewati" yang bisa di-tap kapan saja tanpa submit rating
- [ ] Setelah submit / skip → redirect ke halaman terima kasih atau `/q/{qrId}`
- [ ] Tombol submit di-disable setelah tap pertama (prevent double submit)

---

#### CUST-13 — Client-side Image Compression
**FR:** FR-20 | **Points:** 3 | **Priority:** High 🔴

**Deskripsi:**  
Foto yang diupload user saat ini tidak dikompresi. PRD mewajibkan setiap foto < 500 KB sebelum dikirim ke server. Gunakan Canvas API browser untuk resize + compress.

**Acceptance Criteria:**
- [ ] Setiap file gambar dikompresi ke < 500 KB sebelum dikirim
- [ ] Kualitas JPEG output minimum 0.7 (dapat dikonfigurasi)
- [ ] Dimensi maksimum 1280px pada sisi terpanjang
- [ ] File yang sudah < 500 KB tidak dikompresi ulang
- [ ] Kompresi terjadi sebelum progress bar muncul (transparan ke user)
- [ ] Tidak menggunakan library eksternal — gunakan Canvas API native

**Catatan implementasi:**  
Buat utility `src/lib/compress-image.ts` → `compressImage(file: File): Promise<File>`. Panggil di `usePhotoUpload` sebelum upload dimulai.

---

#### CUST-14 — Auto-Retry dengan Exponential Backoff
**FR:** FR-20 | **Points:** 3 | **Priority:** High 🔴

**Deskripsi:**  
Jika koneksi putus saat upload foto, client harus otomatis retry. Saat ini jika upload gagal user harus tap retry manual.

**Acceptance Criteria:**
- [ ] Maksimal 3x retry otomatis setelah upload gagal karena network error
- [ ] Jeda antar retry: 1s → 2s → 4s (exponential backoff)
- [ ] Status `"retrying"` tampil di `PhotoUploadField` selama proses retry
- [ ] Setelah 3x retry gagal → status `"error"`, tombol retry manual muncul
- [ ] Error non-network (4xx dari server) tidak di-retry otomatis
- [ ] Retry tidak terpicu jika user sudah tap retry manual

**Catatan implementasi:**  
Tambahkan logika retry di `usePhotoUpload` hook. Bedakan `NetworkError` vs `ApiContractError` sebelum memutuskan retry.

---

#### CUST-15 — Web Push Notification saat Booking READY
**FR:** FR-08 | **Points:** 5 | **Priority:** Medium

**Deskripsi:**  
Saat customer menunggu di Status Page, minta izin Web Push. Ketika status berubah ke `READY`, kirim push notification meskipun browser di-background.

**Acceptance Criteria:**
- [ ] Prompt izin Web Push muncul di Status Page setelah 5 detik pada status `PAID`
- [ ] Jika user tolak → tidak muncul prompt lagi (respek `denied` state)
- [ ] Subscribe push endpoint → simpan ke backend (`POST /v1/bookings/{id}/push-subscription`)
- [ ] Saat polling mendeteksi `READY` → kirim notifikasi via service worker
- [ ] Notifikasi berisi: judul "Mobil Anda sudah bersih! 🎉", body nama site
- [ ] Tap notifikasi → buka Status Page booking yang bersangkutan
- [ ] Fallback: jika push tidak didukung → polling on-page tetap berjalan (sudah ada)

**Catatan implementasi:**  
Push subscription logic di `status/page.tsx`. Tambahkan handler `push` event di `public/sw.js`.

---

#### CUST-16 — Internationalization (id-ID / en-US)
**FR:** FR-13 | **Points:** 8 | **Priority:** Low (kerjakan terakhir)

**Deskripsi:**  
Semua copy customer saat ini hardcoded Bahasa Indonesia. PRD mewajibkan dua locale: **id-ID** (default) dan **en-US**, dengan language switcher di setiap halaman.

**Acceptance Criteria:**
- [ ] Setup `next-intl` dengan locale `id-ID` dan `en-US`
- [ ] Semua string customer-facing dipindah ke `messages/id.json` dan `messages/en.json`
- [ ] Language switcher (toggle ID/EN) di header semua halaman customer
- [ ] Pilihan bahasa disimpan ke `localStorage`, persist antar session
- [ ] Locale default `id-ID` jika tidak ada preferensi tersimpan
- [ ] URL tidak berubah saat ganti bahasa (bukan `/en/q/...`)
- [ ] Tidak ada string hardcoded tersisa di komponen customer

**Scope translation:** Landing, Capture, Confirm, Status, Rating, semua error state & toast.

---

### Dependency & Urutan Eksekusi Sprint 3

```
CUST-13 (kompresi)
   └─→ CUST-14 (retry) — lanjut di hook yang sama

CUST-12 (rating)    — paralel, independen
CUST-15 (push)      — setelah CUST-09 stabil
CUST-16 (i18n)      — terakhir, setelah semua copy final
```

**Total: 22 points**

---

## Sprint 4 — Crew: Auth & Queue 🔲 Pending

**Goal:** Crew bisa login dengan shift code + PIN dan claim job berikutnya.

**FR:** FR-05, FR-22

### Tickets

| ID | Deskripsi | FR | Points |
|----|-----------|-----|--------|
| CREW-01 | Crew login page — form shift code (6-digit) + PIN | FR-22 | 3 |
| CREW-02 | `POST /v1/crew/sessions` integration, token storage, 12h session expiry + auto-redirect ke login | FR-22 | 3 |
| CREW-03 | Crew `(crew)` route group layout + `AppShell` surface | — | 2 |
| CREW-04 | Home/Queue page — tombol besar "Ambil Job Berikutnya", empty state, polling otomatis | FR-05 | 3 |
| CREW-05 | Claim job mutation `POST /v1/crew/jobs/next`, navigate ke Job Detail | FR-05 | 2 |
| CREW-06 | Job Detail page — tampilkan plat, slot, foto customer, countdown ETA | FR-05 | 5 |

**Total: 18 points**

---

## Sprint 5 — Crew: Plate Verify & Before Photos 🔲 Pending

**Goal:** Crew bisa konfirmasi plat kendaraan dan upload 4 foto kondisi awal.

**FR:** FR-06, FR-15

### Tickets

| ID | Deskripsi | FR | Points |
|----|-----------|-----|--------|
| CREW-07 | Verify Plate page — tampilkan foto + teks OCR, tombol "Plat Cocok" / "Tidak Ditemukan" | FR-06 | 3 |
| CREW-08 | "Tidak Ditemukan" → NEEDS_HELP transition, pesan eskalasi + link WhatsApp supervisor | FR-06 | 2 |
| CREW-09 | Before Photos page — 4 field upload (depan, belakang, kiri, kanan) | FR-15 | 5 |
| CREW-10 | Reuse `PhotoUploadField` dengan crew kind enum; blokir lanjut sampai 4 foto lengkap | FR-15 | 2 |

**Total: 12 points**

---

## Sprint 6 — Crew: Wash Checklist & Finish 🔲 Pending

**Goal:** Crew bisa menjalani SOP checklist step-by-step, resume setelah refresh, dan tandai job selesai.

**FR:** FR-07, FR-18

### Tickets

| ID | Deskripsi | FR | Points |
|----|-----------|-----|--------|
| CREW-11 | Wash SOP Checklist page — langkah berurutan, tidak bisa skip, timestamp per langkah | FR-07 | 5 |
| CREW-12 | Setiap tap checklist `POST` ke server **sebelum** UI update; rollback jika server gagal | FR-07, FR-18 | 5 |
| CREW-13 | Resume checklist saat refresh/re-login — fetch active job + last completed step on mount | FR-18 | 3 |
| CREW-14 | Finish page — upload foto after, tombol "Selesai" → mark job READY | FR-07 | 3 |
| CREW-15 | Tombol "Laporkan Kendala" di Job Detail — pilihan alasan (terlalu rapat, kondisi kendaraan, dll.), `POST /v1/crew/jobs/{id}/report`, transisi status → NEEDS_HELP, notifikasi ke Admin Console | FR-06 | 5 |

**Total: 21 points**

---

## Sprint 7 — Admin: Queue & Booking Management 🔲 Pending

**Goal:** Supervisor bisa monitor live queue, lihat detail booking, override status, dan proses refund.

**FR:** FR-09, FR-10, FR-17

### Tickets

| ID | Deskripsi | FR | Points |
|----|-----------|-----|--------|
| ADMIN-01 | SSO Google Workspace login, JWT handling, admin `(admin)` route group + layout | — | 5 |
| ADMIN-02 | Dashboard / Live Queue — booking dikelompokkan per status, card: plat, slot, crew, elapsed time | FR-09 | 8 |
| ADMIN-03 | Booking Detail page — riwayat status lengkap, thumbnail media, timeline | FR-09 | 5 |
| ADMIN-04 | Reassign booking ke crew lain — dropdown crew + konfirmasi | FR-09 | 3 |
| ADMIN-05 | Manual Status Override modal — dropdown transisi, reason code wajib, audit log | FR-17 | 5 |
| ADMIN-06 | Refund modal — pilihan full/partial, reason code dropdown, konfirmasi sebelum proses | FR-10 | 5 |

**Total: 31 points**

---

## Sprint 8 — Admin: Escalations & Reports 🔲 Pending

**Goal:** Supervisor punya visibilitas terhadap job bermasalah dan laporan KPI harian.

**FR:** FR-11, FR-21

### Tickets

| ID | Deskripsi | FR | Points |
|----|-----------|-----|--------|
| ADMIN-07 | Escalations Panel — job STALE/NEEDS_HELP di bagian atas queue, badge merah jika > 20 menit | FR-21 | 5 |
| ADMIN-08 | Konfigurasi timeout stale-job (default 20 menit), aksi: re-prioritize / cancel+refund / extend | FR-21 | 3 |
| ADMIN-09 | Reports page — KPI harian: total bookings, completion rate, SLA%, avg rating, revenue | FR-11 | 8 |
| ADMIN-10 | Export laporan CSV + jadwal kirim email otomatis | FR-11 | 3 |

**Total: 19 points**

---

## Sprint 9 — NFR & Launch Readiness 🔲 Pending

**Goal:** Semua surface siap production — observability, aksesibilitas, performa, dan cutover ke staging API.

| ID | Deskripsi | Target |
|----|-----------|--------|
| NFR-01 | Sentry integration di semua 3 surface, error boundaries per route group | Day 1 |
| NFR-02 | WCAG 2.1 AA audit — contrast ratio, touch target min 44×44px, alt text sweep | 2.1 AA |
| NFR-03 | Lighthouse CI — TTI ≤ 2.5s mid-range Android 4G | ≤ 2.5s |
| NFR-04 | Offline/resume test — upload retry, checklist persist saat reconnect | — |
| NFR-05 | Mock server → staging API cutover, audit semua env var | — |
| NFR-06 | Terjemahan en-US lengkap (setelah semua string id-ID final dari CUST-16) | — |

---

## Definition of Done (Global)

Berlaku untuk semua tiket kecuali disebutkan lain:

- [ ] Acceptance criteria semua terpenuhi
- [ ] `bun run build` sukses tanpa error TypeScript
- [ ] `bun run lint` bersih tanpa warning
- [ ] Tested manual di Chrome Android (emulator atau device nyata)
- [ ] Tested manual di Safari iOS (untuk surface Customer & Crew)
- [ ] Tidak ada string hardcoded di komponen (berlaku mulai Sprint 3 CUST-16)
- [ ] Tidak ada `console.log` tersisa di production code

---

*End of document — Park & Shine Sprint Planning v1.0*
