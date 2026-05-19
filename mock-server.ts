/**
 * Park & Shine — Mock API Server
 * Run: bun mock-server.ts
 * Port: 4000
 *
 * Endpoints:
 *   GET  /v1/qr/:qrId                  — resolve QR code
 *   POST /v1/bookings                  — create booking
 *   GET  /v1/bookings/:id              — get booking status
 *   POST /v1/bookings/:id/media        — upload photo (simulates OCR)
 *   POST /v1/bookings/:id/confirm      — confirm booking & get payment URL
 *   POST /v1/bookings/:id/rate         — submit rating
 *
 *   POST /v1/mock/advance/:id          — manually advance booking status
 *   GET  /v1/mock/bookings             — list all in-memory bookings
 *
 *   POST /v1/crew/sessions             — crew login (shiftCode + pin)
 *   POST /v1/crew/jobs/next            — claim next PAID job
 *   GET  /v1/crew/jobs/:jobId          — get job detail
 *   POST /v1/crew/jobs/:jobId/verify   — verify plate (matched | not_found)
 *   POST /v1/crew/jobs/:jobId/media    — upload before-photo (front/back/left/right)
 */

const PORT = 4000;
const BASE_URL = `http://localhost:3000`;

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingStatus =
  | "DRAFT"
  | "PENDING"
  | "PAID"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "NEEDS_HELP"
  | "READY"
  | "CLOSED";

interface MockBooking {
  id: string;
  signedToken: string;
  status: BookingStatus;
  siteName: string;
  plateText: string | null;
  slotText: string | null;
  priceAmount: number;
  currency: "IDR";
  estimatedReadyAt: string;
  media: Array<{
    id: string;
    kind: "plate" | "slot" | "before" | "after";
    url: string;
    ocrText: string | null;
  }>;
  statusHistory: Array<{
    status: BookingStatus;
    changedAt: string;
    labelKey: string;
  }>;
}

// ─── In-memory store ──────────────────────────────────────────────────────────

const bookings = new Map<string, MockBooking>();

// ─── Crew types ───────────────────────────────────────────────────────────────

interface MockCrewJob {
  id: string;
  bookingId: string;
  status: BookingStatus;
  plateText: string;
  slotText: string;
  assignedAt: string;
  etaEndsAt: string;
  supervisorPhone: string;
  media: MockBooking["media"];
  checklist: Array<{
    id: string;
    labelKey: string;
    order: number;
    completedAt: null;
  }>;
}

const crewJobs = new Map<string, MockCrewJob>();

const MOCK_SOP_STEPS = [
  { id: "step_1", labelKey: "crew.checklist.rinse", order: 1 },
  { id: "step_2", labelKey: "crew.checklist.apply_foam", order: 2 },
  { id: "step_3", labelKey: "crew.checklist.wipe_body", order: 3 },
  { id: "step_4", labelKey: "crew.checklist.clean_rims", order: 4 },
  { id: "step_5", labelKey: "crew.checklist.dry_finish", order: 5 },
];

const STATUS_FLOW: BookingStatus[] = [
  "DRAFT",
  "PENDING",
  "PAID",
  "ASSIGNED",
  "IN_PROGRESS",
  "READY",
  "CLOSED",
];

const STATUS_LABELS: Record<BookingStatus, string> = {
  DRAFT: "Draft",
  PENDING: "Menunggu Pembayaran",
  PAID: "Pembayaran Diterima",
  ASSIGNED: "Menunggu Tim",
  IN_PROGRESS: "Sedang Dicuci",
  NEEDS_HELP: "Butuh Bantuan",
  READY: "Mobil Siap!",
  CLOSED: "Selesai",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function now(): string {
  return new Date().toISOString();
}

function addHistory(booking: MockBooking, status: BookingStatus) {
  booking.statusHistory.push({
    status,
    changedAt: now(),
    labelKey: STATUS_LABELS[status],
  });
}

function advanceStatus(booking: MockBooking): boolean {
  const idx = STATUS_FLOW.indexOf(booking.status);
  if (idx === -1 || idx >= STATUS_FLOW.length - 1) return false;
  booking.status = STATUS_FLOW[idx + 1];
  addHistory(booking, booking.status);
  return true;
}

// ─── OCR simulation ───────────────────────────────────────────────────────────

const MOCK_PLATES = ["B 1234 SKJ", "D 5678 ABC", "F 9012 XYZ", "B 3141 PNS"];
const MOCK_SLOTS  = ["P1-A01", "P2-B12", "P3-C05", "G1-D08"];

function simulateOcr(kind: string): string | null {
  if (kind === "plate") return MOCK_PLATES[Math.floor(Math.random() * MOCK_PLATES.length)];
  if (kind === "slot")  return MOCK_SLOTS[Math.floor(Math.random() * MOCK_SLOTS.length)];
  return null;
}

// ─── CORS helper ──────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Booking-Token, Idempotency-Key",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function notFound(message = "Not found"): Response {
  return json({ success: false, code: "NOT_FOUND", message }, 404);
}

// ─── Router ───────────────────────────────────────────────────────────────────

async function handleRequest(req: Request): Promise<Response> {
  const url    = new URL(req.url);
  const path   = url.pathname;
  const method = req.method;

  // Preflight
  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // ── GET /v1/qr/:qrId ─────────────────────────────────────────────────────
  const qrMatch = path.match(/^\/v1\/qr\/([^/]+)$/);
  if (method === "GET" && qrMatch) {
    const qrId = qrMatch[1];
    const cutoff = new Date();
    cutoff.setHours(22, 0, 0, 0);
    return json({
      qrId,
      siteName: "Senayan City — P2",
      intakePaused: false,
      cutoffTime: "22:00",
      rotatedAt: now(),
    });
  }

  // ── POST /v1/bookings ─────────────────────────────────────────────────────
  if (method === "POST" && path === "/v1/bookings") {
    const body = await req.json().catch(() => ({})) as { qrId?: string };
    const id    = randomId();
    const token = `tok_${randomId()}${randomId()}`;
    const ready = new Date(Date.now() + 20 * 60 * 1000).toISOString();

    const booking: MockBooking = {
      id,
      signedToken: token,
      status: "PENDING",
      siteName: "Senayan City — P2",
      plateText: null,
      slotText: null,
      priceAmount: 35_000,
      currency: "IDR",
      estimatedReadyAt: ready,
      media: [],
      statusHistory: [],
    };
    addHistory(booking, "PENDING");
    bookings.set(id, booking);

    console.log(`[mock] Created booking ${id} for qrId=${body.qrId ?? "?"}`);

    return json({ id, signedToken: token });
  }

  // ── POST /v1/bookings/:id/media ───────────────────────────────────────────
  const mediaMatch = path.match(/^\/v1\/bookings\/([^/]+)\/media$/);
  if (method === "POST" && mediaMatch) {
    const id      = mediaMatch[1];
    const booking = bookings.get(id);
    if (!booking) return notFound("Booking tidak ditemukan");

    // Accept multipart or JSON
    const contentType = req.headers.get("content-type") ?? "";
    let kind: string = "plate";
    if (contentType.includes("multipart")) {
      const form = await req.formData().catch(() => null);
      kind = (form?.get("kind") as string) ?? "plate";
    } else {
      const body = await req.json().catch(() => ({})) as { kind?: string };
      kind = body.kind ?? "plate";
    }

    const mediaId  = randomId();
    const ocrText  = simulateOcr(kind);
    const mediaUrl = `https://placehold.co/400x300/0d9488/ffffff?text=${encodeURIComponent(kind.toUpperCase())}`;

    const media = {
      id: mediaId,
      kind: kind as "plate" | "slot",
      url: mediaUrl,
      ocrText,
    };
    booking.media.push(media);

    // Simulate 600 ms processing delay
    await new Promise((r) => setTimeout(r, 600));

    console.log(`[mock] Media uploaded for booking ${id}: kind=${kind} ocr="${ocrText}"`);
    return json(media);
  }

  // ── GET /v1/bookings/:id ──────────────────────────────────────────────────
  const bookingMatch = path.match(/^\/v1\/bookings\/([^/]+)$/);
  if (method === "GET" && bookingMatch) {
    const id      = bookingMatch[1];
    const booking = bookings.get(id);
    if (!booking) return notFound("Booking tidak ditemukan");
    return json(booking);
  }

  // ── POST /v1/bookings/:id/confirm ─────────────────────────────────────────
  const confirmMatch = path.match(/^\/v1\/bookings\/([^/]+)\/confirm$/);
  if (method === "POST" && confirmMatch) {
    const id      = confirmMatch[1];
    const booking = bookings.get(id);
    if (!booking) return notFound("Booking tidak ditemukan");

    const body = await req.json().catch(() => ({})) as {
      plateText?: string;
      slotText?: string;
    };

    booking.plateText = body.plateText ?? booking.plateText;
    booking.slotText  = body.slotText  ?? booking.slotText;

    // Simulate payment: advance to PAID immediately (mock payment gateway)
    if (booking.status === "PENDING") {
      booking.status = "PAID";
      addHistory(booking, "PAID");

      // Auto-advance to ASSIGNED after 3s, IN_PROGRESS after 8s, READY after 15s
      setTimeout(() => {
        if (booking.status === "PAID") {
          booking.status = "ASSIGNED";
          addHistory(booking, "ASSIGNED");
          console.log(`[mock] Auto-advanced ${id} → ASSIGNED`);
        }
      }, 3_000);
      setTimeout(() => {
        if (booking.status === "ASSIGNED") {
          booking.status = "IN_PROGRESS";
          addHistory(booking, "IN_PROGRESS");
          console.log(`[mock] Auto-advanced ${id} → IN_PROGRESS`);
        }
      }, 8_000);
      setTimeout(() => {
        if (booking.status === "IN_PROGRESS") {
          booking.status = "READY";
          addHistory(booking, "READY");
          console.log(`[mock] Auto-advanced ${id} → READY`);
        }
      }, 15_000);
    }

    const redirectUrl = `${BASE_URL}/booking/${id}/status?token=${booking.signedToken}`;
    console.log(`[mock] Confirmed booking ${id} → ${booking.status}, redirect: ${redirectUrl}`);

    return json({
      bookingId: id,
      redirectUrl,
      idempotencyKey: id,
    });
  }

  // ── POST /v1/bookings/:id/rate ────────────────────────────────────────────
  const rateMatch = path.match(/^\/v1\/bookings\/([^/]+)\/rate$/);
  if (method === "POST" && rateMatch) {
    const id      = rateMatch[1];
    const booking = bookings.get(id);
    if (!booking) return notFound("Booking tidak ditemukan");

    const body = await req.json().catch(() => ({})) as { score?: number; reason?: string };
    console.log(`[mock] Rating for booking ${id}: score=${body.score} reason="${body.reason ?? ""}"`);

    if (booking.status === "READY") {
      booking.status = "CLOSED";
      addHistory(booking, "CLOSED");
    }

    return json({ success: true, message: "Rating diterima" });
  }

  // ── POST /v1/mock/advance/:id — manually advance status ──────────────────
  const advanceMatch = path.match(/^\/v1\/mock\/advance\/([^/]+)$/);
  if (method === "POST" && advanceMatch) {
    const id      = advanceMatch[1];
    const booking = bookings.get(id);
    if (!booking) return notFound("Booking tidak ditemukan");
    const prev = booking.status;
    const ok   = advanceStatus(booking);
    if (!ok) return json({ error: "Already at final status" }, 400);
    console.log(`[mock] Manual advance ${id}: ${prev} → ${booking.status}`);
    return json({ id, prev, status: booking.status });
  }

  // ── GET /v1/mock/bookings — debug list ────────────────────────────────────
  if (method === "GET" && path === "/v1/mock/bookings") {
    const list = [...bookings.values()].map(({ id, status, plateText, slotText }) => ({
      id,
      status,
      plateText,
      slotText,
    }));
    return json(list);
  }

  // ── POST /v1/crew/sessions ────────────────────────────────────────────────
  if (method === "POST" && path === "/v1/crew/sessions") {
    const body = await req.json().catch(() => ({})) as {
      shiftCode?: string;
      pin?: string;
    };

    if (!body.shiftCode || body.shiftCode.length !== 6) {
      return json(
        { success: false, code: "INVALID_SHIFT_CODE", message: "Kode shift harus 6 digit" },
        400
      );
    }

    const session = {
      id: `sess_${randomId()}`,
      crewId: "crew_001",
      crewName: "Budi Santoso",
      siteId: "site_001",
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      token: `mock_crew_jwt_${randomId()}`,
    };

    console.log(`[mock] Crew login: shiftCode=${body.shiftCode} → session ${session.id}`);
    return json(session);
  }

  // ── POST /v1/crew/jobs/next ───────────────────────────────────────────────
  if (method === "POST" && path === "/v1/crew/jobs/next") {
    const paidBooking = [...bookings.values()].find((b) => b.status === "PAID");

    if (!paidBooking) {
      console.log("[mock] No PAID bookings available for crew claim");
      return json(null);
    }

    paidBooking.status = "ASSIGNED";
    addHistory(paidBooking, "ASSIGNED");

    const jobId = `job_${randomId()}`;
    const etaEndsAt = new Date(Date.now() + 20 * 60 * 1000).toISOString();

    const job: MockCrewJob = {
      id: jobId,
      bookingId: paidBooking.id,
      status: "ASSIGNED",
      plateText: paidBooking.plateText ?? "B 0000 PNS",
      slotText: paidBooking.slotText ?? "P1-A01",
      assignedAt: now(),
      etaEndsAt,
      supervisorPhone: "628123456789",
      media: paidBooking.media,
      checklist: MOCK_SOP_STEPS.map((s) => ({ ...s, completedAt: null })),
    };

    crewJobs.set(jobId, job);
    console.log(`[mock] Crew claimed job ${jobId} for booking ${paidBooking.id}`);
    return json(job);
  }

  // ── GET /v1/crew/jobs/:jobId ──────────────────────────────────────────────
  const crewJobMatch = path.match(/^\/v1\/crew\/jobs\/([^/]+)$/);
  if (method === "GET" && crewJobMatch) {
    const jobId = crewJobMatch[1];
    const job = crewJobs.get(jobId);
    if (!job) return notFound("Job tidak ditemukan");
    return json(job);
  }

  // ── POST /v1/crew/jobs/:jobId/verify ─────────────────────────────────────
  const crewVerifyMatch = path.match(/^\/v1\/crew\/jobs\/([^/]+)\/verify$/);
  if (method === "POST" && crewVerifyMatch) {
    const jobId = crewVerifyMatch[1];
    const job = crewJobs.get(jobId);
    if (!job) return notFound("Job tidak ditemukan");

    const body = await req.json().catch(() => ({})) as {
      result?: "matched" | "not_found";
      reason?: string;
    };

    const booking = bookings.get(job.bookingId);
    if (booking) {
      if (body.result === "matched") {
        booking.status = "IN_PROGRESS";
        addHistory(booking, "IN_PROGRESS");
        job.status = "IN_PROGRESS";
      } else if (body.result === "not_found") {
        booking.status = "NEEDS_HELP";
        addHistory(booking, "NEEDS_HELP");
        job.status = "NEEDS_HELP";
      }
    }

    console.log(`[mock] Crew verify job ${jobId}: result=${body.result ?? "?"}`);
    return json({ success: true });
  }

  // ── POST /v1/crew/jobs/:jobId/media ──────────────────────────────────────
  const crewMediaMatch = path.match(/^\/v1\/crew\/jobs\/([^/]+)\/media$/);
  if (method === "POST" && crewMediaMatch) {
    const jobId = crewMediaMatch[1];
    const job = crewJobs.get(jobId);
    if (!job) return notFound("Job tidak ditemukan");

    const contentType = req.headers.get("content-type") ?? "";
    let kind = "front";
    if (contentType.includes("multipart")) {
      const form = await req.formData().catch(() => null);
      kind = (form?.get("kind") as string) ?? "front";
    } else {
      const body = await req.json().catch(() => ({})) as { kind?: string };
      kind = body.kind ?? "front";
    }

    const mediaId = randomId();
    const mediaUrl = `https://placehold.co/400x300/0d9488/ffffff?text=${encodeURIComponent(kind.toUpperCase())}`;
    const media = { id: mediaId, kind: kind as "front" | "back" | "left" | "right", url: mediaUrl, ocrText: null };

    job.media.push(media);

    // Simulate 600ms processing delay
    await new Promise((r) => setTimeout(r, 600));

    console.log(`[mock] Crew media uploaded for job ${jobId}: kind=${kind}`);
    return json(media);
  }

  return notFound(`No route: ${method} ${path}`);
}

// ─── Start ────────────────────────────────────────────────────────────────────

Bun.serve({
  port: PORT,
  fetch: handleRequest,
});

console.log(`\n🚿 Park & Shine Mock Server running on http://localhost:${PORT}`);
console.log(`\nEndpoints:`);
console.log(`  GET  /v1/qr/:qrId`);
console.log(`  POST /v1/bookings`);
console.log(`  GET  /v1/bookings/:id`);
console.log(`  POST /v1/bookings/:id/media`);
console.log(`  POST /v1/bookings/:id/confirm`);
console.log(`  POST /v1/bookings/:id/rate`);
console.log(`\nTest helpers:`);
console.log(`  POST /v1/mock/advance/:id   — manually advance booking status`);
console.log(`  GET  /v1/mock/bookings      — list all active bookings`);
console.log(`  POST /v1/crew/sessions`);
console.log(`  POST /v1/crew/jobs/next`);
console.log(`  GET  /v1/crew/jobs/:jobId`);
console.log(`\nOpen: http://localhost:3000/q/TEST123\n`);
