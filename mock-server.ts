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
  | "STALE"
  | "CLOSED";

interface MockBooking {
  id: string;
  signedToken: string;
  status: BookingStatus;
  siteName: string;
  plateText: string | null;
  slotText: string | null;
  phone: string | null;
  locationLat: number | null;
  locationLng: number | null;
  locationName: string | null;
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

// ─── Admin seed data ──────────────────────────────────────────────────────────

interface MockAdminAuditEntry {
  id: string;
  bookingId: string;
  plateText: string | null;
  action: "refund" | "status_override" | "reassign";
  detail: string;
  adminEmail: string;
  createdAt: string;
}

interface MockAdminSettings {
  siteId: string;
  staleJobTimeoutMinutes: number;
}

interface MockCrewMember {
  id: string;
  name: string;
  siteId: string;
}

const MOCK_SITES = [
  { id: "site-1", name: "Site Thamrin" },
  { id: "site-2", name: "Site Sudirman" },
];

const MOCK_CREW_MEMBERS: MockCrewMember[] = [
  { id: "crew-1", name: "Budi Santoso", siteId: "site-1" },
  { id: "crew-2", name: "Agus Wijaya", siteId: "site-1" },
  { id: "crew-3", name: "Rudi Hartono", siteId: "site-2" },
];

const adminAuditLog: MockAdminAuditEntry[] = [
  {
    id: "audit-1",
    bookingId: "bk-seed-1",
    plateText: "B 1234 XY",
    action: "status_override",
    detail: "PENDING → PAID",
    adminEmail: "admin@park-shine.com",
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: "audit-2",
    bookingId: "bk-seed-2",
    plateText: "D 5678 AB",
    action: "refund",
    detail: "Full refund — Rp 45.000",
    adminEmail: "admin@park-shine.com",
    createdAt: new Date(Date.now() - 7200_000).toISOString(),
  },
  {
    id: "audit-3",
    bookingId: "bk-seed-3",
    plateText: "B 9999 ZZ",
    action: "reassign",
    detail: "Reassigned to Agus Wijaya",
    adminEmail: "admin@park-shine.com",
    createdAt: new Date(Date.now() - 1800_000).toISOString(),
  },
  {
    id: "audit-4",
    bookingId: "bk-seed-4",
    plateText: "F 1111 CC",
    action: "status_override",
    detail: "PAID → CANCELLED",
    adminEmail: "admin@park-shine.com",
    createdAt: new Date(Date.now() - 5400_000).toISOString(),
  },
  {
    id: "audit-5",
    bookingId: "bk-seed-5",
    plateText: "B 2222 DD",
    action: "reassign",
    detail: "Reassigned to Budi Santoso",
    adminEmail: "supervisor@park-shine.com",
    createdAt: new Date(Date.now() - 900_000).toISOString(),
  },
  {
    id: "audit-6",
    bookingId: "bk-seed-8",
    plateText: "B 5555 GG",
    action: "status_override",
    detail: "PENDING → PAID",
    adminEmail: "admin@park-shine.com",
    createdAt: new Date(Date.now() - 10800_000).toISOString(),
  },
  {
    id: "audit-7",
    bookingId: "bk-seed-6",
    plateText: "D 3333 EE",
    action: "refund",
    detail: "Partial refund — Rp 20.000",
    adminEmail: "supervisor@park-shine.com",
    createdAt: new Date(Date.now() - 300_000).toISOString(),
  },
  {
    id: "audit-8",
    bookingId: "bk-seed-9",
    plateText: "D 6666 HH",
    action: "reassign",
    detail: "Reassigned to Rudi Hartono",
    adminEmail: "admin@park-shine.com",
    createdAt: new Date(Date.now() - 2700_000).toISOString(),
  },
  {
    id: "audit-9",
    bookingId: "bk-seed-7",
    plateText: "B 4444 FF",
    action: "status_override",
    detail: "PAID → CANCELLED",
    adminEmail: "admin@park-shine.com",
    createdAt: new Date(Date.now() - 14400_000).toISOString(),
  },
  {
    id: "audit-10",
    bookingId: "bk-seed-10",
    plateText: "B 7777 II",
    action: "reassign",
    detail: "Reassigned to Budi Santoso",
    adminEmail: "supervisor@park-shine.com",
    createdAt: new Date(Date.now() - 600_000).toISOString(),
  },
];

const adminSettings = new Map<string, MockAdminSettings>([
  ["site-1", { siteId: "site-1", staleJobTimeoutMinutes: 20 }],
  ["site-2", { siteId: "site-2", staleJobTimeoutMinutes: 20 }],
]);

// Build a realistic statusHistory chain up to `currentStatus`
function buildStatusHistory(currentStatus: BookingStatus, baseOffsetMs: number) {
  const chain: BookingStatus[] = ["DRAFT", "PENDING", "PAID", "ASSIGNED", "IN_PROGRESS", "READY", "CLOSED"];
  const escalations: BookingStatus[] = ["NEEDS_HELP", "STALE"];

  let steps: BookingStatus[];
  if (escalations.includes(currentStatus)) {
    // escalation branches off after PAID
    steps = ["DRAFT", "PENDING", "PAID", currentStatus];
  } else {
    const idx = chain.indexOf(currentStatus);
    steps = idx >= 0 ? chain.slice(0, idx + 1) : ["DRAFT", currentStatus];
  }

  return steps.map((s, i) => ({
    status: s,
    changedAt: new Date(Date.now() - baseOffsetMs + i * Math.floor(baseOffsetMs / steps.length)).toISOString(),
    labelKey: `booking.status.${s.toLowerCase()}`,
  }));
}

function seedAdminBookings() {
  const entries: Array<{
    status: BookingStatus;
    plate: string;
    slot: string;
    siteId: string;
    priceAmount: number;
    baseOffsetMs: number;
  }> = [
    { status: "PAID",        plate: "B 1234 XY", slot: "A1", siteId: "site-1", priceAmount: 45000, baseOffsetMs: 1200_000 },
    { status: "PAID",        plate: "D 5678 AB", slot: "A2", siteId: "site-1", priceAmount: 45000, baseOffsetMs: 900_000 },
    { status: "ASSIGNED",    plate: "B 9999 ZZ", slot: "B1", siteId: "site-1", priceAmount: 45000, baseOffsetMs: 2400_000 },
    { status: "ASSIGNED",    plate: "F 1111 CC", slot: "B2", siteId: "site-1", priceAmount: 60000, baseOffsetMs: 1800_000 },
    { status: "IN_PROGRESS", plate: "B 2222 DD", slot: "C1", siteId: "site-1", priceAmount: 45000, baseOffsetMs: 3600_000 },
    { status: "IN_PROGRESS", plate: "D 3333 EE", slot: "C2", siteId: "site-1", priceAmount: 45000, baseOffsetMs: 2700_000 },
    { status: "READY",       plate: "B 4444 FF", slot: "D1", siteId: "site-1", priceAmount: 60000, baseOffsetMs: 5400_000 },
    { status: "NEEDS_HELP",  plate: "B 5555 GG", slot: "D2", siteId: "site-1", priceAmount: 45000, baseOffsetMs: 4500_000 },
    { status: "STALE",       plate: "D 6666 HH", slot: "E1", siteId: "site-2", priceAmount: 45000, baseOffsetMs: 7200_000 },
    { status: "PAID",        plate: "B 7777 II", slot: "E2", siteId: "site-2", priceAmount: 60000, baseOffsetMs: 600_000  },
    { status: "IN_PROGRESS", plate: "B 8888 JJ", slot: "F1", siteId: "site-2", priceAmount: 45000, baseOffsetMs: 3000_000 },
    { status: "NEEDS_HELP",  plate: "D 9999 KK", slot: "F2", siteId: "site-2", priceAmount: 45000, baseOffsetMs: 5000_000 },
  ];

  entries.forEach(({ status, plate, slot, siteId, priceAmount, baseOffsetMs }, i) => {
    const id = `bk-seed-${i + 1}`;
    bookings.set(id, {
      id,
      signedToken: `mock-signed-token-${id}`,
      status,
      siteName: siteId === "site-1" ? "Site Thamrin" : "Site Sudirman",
      plateText: plate,
      slotText: slot,
      phone: null,
      locationLat: null,
      locationLng: null,
      locationName: null,
      priceAmount,
      currency: "IDR",
      estimatedReadyAt: new Date(Date.now() + 1800_000).toISOString(),
      media: [
        {
          id: `media-${id}-plate`,
          kind: "plate",
          url: "https://placehold.co/400x300/png",
          ocrText: plate,
        },
        {
          id: `media-${id}-slot`,
          kind: "slot",
          url: "https://placehold.co/400x300/png",
          ocrText: slot,
        },
      ],
      statusHistory: buildStatusHistory(status, baseOffsetMs),
    });
  });
}

seedAdminBookings();

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
  DRAFT: "booking.status.draft",
  PENDING: "booking.status.pending",
  PAID: "booking.status.paid",
  ASSIGNED: "booking.status.assigned",
  IN_PROGRESS: "booking.status.in_progress",
  NEEDS_HELP: "booking.status.needs_help",
  READY: "booking.status.ready",
  STALE: "booking.status.stale",
  CLOSED: "booking.status.closed",
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
      siteName: body.qrId ? "Senayan City — P2" : "Walk-in Booking",
      plateText: null,
      slotText: null,
      phone: null,
      locationLat: null,
      locationLng: null,
      locationName: null,
      priceAmount: 35_000,
      currency: "IDR",
      estimatedReadyAt: ready,
      media: [],
      statusHistory: [],
    };
    addHistory(booking, "PENDING");
    bookings.set(id, booking);

    const flowType = body.qrId ? `QR flow (qrId=${body.qrId})` : "walk-in flow (no qrId)";
    console.log(`[mock] Created booking ${id} — ${flowType}`);

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
      phone?: string;
      locationLat?: number;
      locationLng?: number;
      locationName?: string;
    };

    booking.plateText    = body.plateText    ?? booking.plateText;
    booking.slotText     = body.slotText     ?? booking.slotText;
    booking.phone        = body.phone        ?? booking.phone;
    booking.locationLat  = body.locationLat  ?? booking.locationLat;
    booking.locationLng  = body.locationLng  ?? booking.locationLng;
    booking.locationName = body.locationName ?? booking.locationName;

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
    const locationInfo = booking.locationName ? ` | loc="${booking.locationName}"` : "";
    const phoneInfo    = booking.phone        ? ` | phone=${booking.phone}`        : "";
    console.log(`[mock] Confirmed booking ${id} → ${booking.status}${phoneInfo}${locationInfo}, redirect: ${redirectUrl}`);

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
    const list = [...bookings.values()].map(({ id, status, plateText, slotText, phone, locationName, siteName }) => ({
      id,
      status,
      siteName,
      plateText,
      slotText,
      phone,
      locationName,
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

  // ─── Admin: Login ─────────────────────────────────────────────────────────────
  if (method === "POST" && path === "/v1/admin/sessions") {
    return json({
      success: true,
      token: "mock-admin-token-xyz",
      email: "admin@park-shine.com",
      sites: MOCK_SITES,
    });
  }

  // ─── Admin: Get Queue ────────────────────────────────────────────────────────
  if (method === "GET" && path.startsWith("/v1/admin/sites/") && path.endsWith("/queue")) {
    const siteId = path.split("/")[4];
    const siteName = siteId === "site-1" ? "Site Thamrin" : "Site Sudirman";
    const siteBookings = [...bookings.values()].filter(
      (b) => b.siteName === siteName
    );

    const statusOrder = ["PAID", "ASSIGNED", "IN_PROGRESS", "READY", "NEEDS_HELP", "STALE"];
    const escalationStatuses = new Set(["NEEDS_HELP", "STALE"]);

    const groups = statusOrder
      .map((status) => ({
        status,
        bookings: siteBookings
          .filter((b) => b.status === status)
          .map((b) => ({
            ...b,
            crewName: MOCK_CREW_MEMBERS.find((c) => c.siteId === siteId)?.name ?? null,
            elapsedSeconds: Math.floor(Math.random() * 3600),
          })),
      }))
      .filter((g) => g.bookings.length > 0);

    const escalations = siteBookings
      .filter((b) => escalationStatuses.has(b.status))
      .map((b) => ({
        ...b,
        crewName: null,
        elapsedSeconds: 1500,
      }));

    return json({
      siteId,
      fetchedAt: new Date().toISOString(),
      groups,
      escalations,
    });
  }

  // ─── Admin: Get Booking Detail ───────────────────────────────────────────────
  if (method === "GET" && path.match(/^\/v1\/admin\/bookings\/[^/]+$/)) {
    const bookingId = path.split("/")[4];
    const booking = bookings.get(bookingId);
    if (!booking) {
      return json({ success: false, code: "BOOKING_NOT_FOUND" }, 404);
    }
    const auditEntries = adminAuditLog.filter((a) => a.bookingId === bookingId);
    return json({
      ...booking,
      crewName: MOCK_CREW_MEMBERS[0].name,
      elapsedSeconds: 900,
      auditEntries,
    });
  }

  // ─── Admin: Reassign ─────────────────────────────────────────────────────────
  if (method === "POST" && path.match(/^\/v1\/admin\/bookings\/[^/]+\/reassign$/)) {
    const bookingId = path.split("/")[4];
    const booking = bookings.get(bookingId);
    if (!booking) {
      return json({ success: false, code: "BOOKING_NOT_FOUND" }, 404);
    }
    const body = await req.json() as { crewId: string };
    const crew = MOCK_CREW_MEMBERS.find((c) => c.id === body.crewId);
    adminAuditLog.push({
      id: crypto.randomUUID(),
      bookingId,
      plateText: booking.plateText,
      action: "reassign",
      detail: `Reassigned to ${crew?.name ?? body.crewId}`,
      adminEmail: "admin@park-shine.com",
      createdAt: new Date().toISOString(),
    });
    return json({ success: true });
  }

  // ─── Admin: Status Override ───────────────────────────────────────────────────
  if (method === "POST" && path.match(/^\/v1\/admin\/bookings\/[^/]+\/status-override$/)) {
    const bookingId = path.split("/")[4];
    const booking = bookings.get(bookingId);
    if (!booking) {
      return json({ success: false, code: "BOOKING_NOT_FOUND" }, 404);
    }
    const body = await req.json() as { nextStatus: BookingStatus; reasonCode: string };
    const prevStatus = booking.status;
    booking.status = body.nextStatus;
    booking.statusHistory.push({
      status: body.nextStatus,
      changedAt: new Date().toISOString(),
      labelKey: `booking.status.${body.nextStatus.toLowerCase()}`,
    });
    adminAuditLog.push({
      id: crypto.randomUUID(),
      bookingId,
      plateText: booking.plateText,
      action: "status_override",
      detail: `${prevStatus} → ${body.nextStatus} — ${body.reasonCode}`,
      adminEmail: "admin@park-shine.com",
      createdAt: new Date().toISOString(),
    });
    return json({ success: true });
  }

  // ─── Admin: Refund ────────────────────────────────────────────────────────────
  if (method === "POST" && path.match(/^\/v1\/admin\/bookings\/[^/]+\/refund$/)) {
    const bookingId = path.split("/")[4];
    const booking = bookings.get(bookingId);
    if (!booking) {
      return json({ success: false, code: "BOOKING_NOT_FOUND" }, 404);
    }
    const body = await req.json() as { amountType: string; amount?: number; reasonCode: string };
    const amount = body.amountType === "full" ? booking.priceAmount : (body.amount ?? 0);
    adminAuditLog.push({
      id: crypto.randomUUID(),
      bookingId,
      plateText: booking.plateText,
      action: "refund",
      detail: `${body.amountType === "full" ? "Full" : "Partial"} refund — Rp ${amount.toLocaleString("id-ID")}`,
      adminEmail: "admin@park-shine.com",
      createdAt: new Date().toISOString(),
    });
    return json({ success: true });
  }

  // ─── Admin: Report ────────────────────────────────────────────────────────────
  if (method === "GET" && path.startsWith("/v1/admin/sites/") && path.includes("/report")) {
    const siteId = path.split("/")[4];
    const from = url.searchParams.get("from") ?? new Date(Date.now() - 7 * 86400_000).toISOString().slice(0, 10);
    const to = url.searchParams.get("to") ?? new Date().toISOString().slice(0, 10);

    const fromDate = new Date(from);
    const toDate = new Date(to);
    const days: string[] = [];
    const current = new Date(fromDate);
    while (current <= toDate) {
      days.push(current.toISOString().slice(0, 10));
      current.setDate(current.getDate() + 1);
    }

    const breakdown = days.map((date) => ({
      date,
      totalBookings: Math.floor(Math.random() * 20) + 5,
      completed: Math.floor(Math.random() * 15) + 3,
      slaHitRate: Math.floor(Math.random() * 30) + 70,
      averageRating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
      revenue: (Math.floor(Math.random() * 20) + 5) * 45000,
    }));

    const summary = {
      siteId,
      date: from,
      totalBookings: breakdown.reduce((s, d) => s + d.totalBookings, 0),
      completionRate: Math.round(breakdown.reduce((s, d) => s + d.slaHitRate, 0) / breakdown.length),
      slaHitRate: Math.round(breakdown.reduce((s, d) => s + d.slaHitRate, 0) / breakdown.length),
      averageRating: parseFloat((breakdown.reduce((s, d) => s + (d.averageRating ?? 0), 0) / breakdown.length).toFixed(1)),
      revenue: breakdown.reduce((s, d) => s + d.revenue, 0),
    };

    return json({ siteId, from, to, summary, breakdown });
  }

  // ─── Admin: Audit Log ────────────────────────────────────────────────────────
  if (method === "GET" && path.startsWith("/v1/admin/sites/") && path.includes("/audit-log")) {
    const action = url.searchParams.get("action");
    let entries = [...adminAuditLog];
    if (action && action !== "all") {
      entries = entries.filter((e) => e.action === action);
    }
    entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return json(entries);
  }

  // ─── Admin: Get Settings ─────────────────────────────────────────────────────
  if (method === "GET" && path.startsWith("/v1/admin/sites/") && path.endsWith("/settings")) {
    const siteId = path.split("/")[4];
    const settings = adminSettings.get(siteId) ?? { siteId, staleJobTimeoutMinutes: 20 };
    return json(settings);
  }

  // ─── Admin: Save Settings ────────────────────────────────────────────────────
  if (method === "POST" && path.startsWith("/v1/admin/sites/") && path.endsWith("/settings")) {
    const siteId = path.split("/")[4];
    const body = await req.json() as { staleJobTimeoutMinutes: number };
    adminSettings.set(siteId, { siteId, staleJobTimeoutMinutes: body.staleJobTimeoutMinutes });
    return json(adminSettings.get(siteId));
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
console.log(`\nAdmin endpoints:`);
console.log(`  POST /v1/admin/sessions`);
console.log(`  GET  /v1/admin/sites/:siteId/queue`);
console.log(`  GET  /v1/admin/bookings/:bookingId`);
console.log(`  POST /v1/admin/bookings/:bookingId/reassign`);
console.log(`  POST /v1/admin/bookings/:bookingId/status-override`);
console.log(`  POST /v1/admin/bookings/:bookingId/refund`);
console.log(`  GET  /v1/admin/sites/:siteId/report`);
console.log(`  GET  /v1/admin/sites/:siteId/audit-log`);
console.log(`  GET  /v1/admin/sites/:siteId/settings`);
console.log(`  POST /v1/admin/sites/:siteId/settings`);
console.log(`\nTest flows:`);
console.log(`  QR flow     → http://localhost:3000/q/TEST123`);
console.log(`  Walk-in     → http://localhost:3000/book/location\n`);
