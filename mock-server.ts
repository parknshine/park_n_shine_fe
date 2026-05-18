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
console.log(`\nOpen: http://localhost:3000/q/TEST123\n`);
