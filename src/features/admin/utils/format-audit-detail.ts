const JOB_REJECTION_LABELS: Record<string, string> = {
  VEHICLE_TOO_DIRTY: "Vehicle too dirty",
  PARKING_TOO_TIGHT: "Parking too tight",
  SPECIAL_CARE_NEEDED: "Special care needed",
  CREW_UNAVAILABLE: "Crew unavailable",
};

const HELP_REASON_LABELS: Record<string, string> = {
  VEHICLE_INACCESSIBLE: "Vehicle inaccessible",
  MECHANICAL_ISSUE: "Mechanical issue",
  CUSTOMER_DISPUTE: "Customer dispute",
  HAZARD: "Hazard situation",
  OTHER: "Other",
};

function formatApproveTimeExtension(p: Record<string, unknown>): string {
  const minutes = p.minutes as number | undefined;
  if (minutes == null) return "Approved";
  const eta = p.newEtaEndsAt
    ? new Date(p.newEtaEndsAt as string).toLocaleTimeString()
    : null;
  const etaSuffix = eta ? ` → ETA ${eta}` : "";
  return `+${minutes} min${etaSuffix}`;
}

function formatExtendTime(p: Record<string, unknown>): string {
  const minutes = p.minutes as number | undefined;
  const status = p.newStatus ? ` → ${p.newStatus as string}` : "";
  const eta = p.newEtaEndsAt
    ? ` · ETA ${new Date(p.newEtaEndsAt as string).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`
    : "";
  return minutes != null ? `+${minutes} min${status}${eta}` : "Extended";
}

function parseDetail(action: string, p: Record<string, unknown>, raw: string): string {
  if (action === "crew.job_rejected") {
    const reason = (p.reason as string) ?? "—";
    const crew = (p.crewName as string) ?? (p.crewId as string) ?? "—";
    return `${crew} — ${JOB_REJECTION_LABELS[reason] ?? reason}`;
  }
  if (action === "crew.requested_help") {
    const crew = (p.crewName as string) ?? (p.crewId as string) ?? "—";
    const reason = HELP_REASON_LABELS[p.reason as string] ?? (p.reason as string) ?? "—";
    const note = p.note ? ` — "${p.note as string}"` : "";
    return `${crew} — ${reason}${note}`;
  }
  if (action === "reassign") {
    const name = (p.newCrewName as string) ?? (p.newCrewId as string) ?? "—";
    const reason = p.reasonCode ? ` • ${p.reasonCode as string}` : "";
    return `→ ${name}${reason}`;
  }
  if (action === "status_override") {
    const from = (p.previousStatus as string) ?? "—";
    const to = (p.nextStatus as string) ?? "—";
    const reason = p.reasonCode ? ` • ${p.reasonCode as string}` : "";
    return `${from} → ${to}${reason}`;
  }
  if (action === "refund") {
    const reason = (p.reasonCode as string) ?? "—";
    return reason;
  }
  if (action === "extend_time") return formatExtendTime(p);
  if (action === "approve_time_extension") return formatApproveTimeExtension(p);
  if (action === "reject_time_extension") return "Request rejected";
  if (action === "crew.requested_wait") {
    const minutes = p.minutes as number | undefined;
    return minutes != null ? `+${minutes} min` : "—";
  }
  if (action === "crew.request_time_extension") return "Time extension requested";
  if (action === "booking.status_changed") {
    const from = (p.from as string) ?? "—";
    const to = (p.to as string) ?? "—";
    return `${from} → ${to}`;
  }
  if (action === "booking.created") {
    const qrCodeId = p.qrCodeId as string | undefined;
    return qrCodeId ? `QR ${qrCodeId}` : "—";
  }
  return raw;
}

export function formatAuditAction(action: string): string {
  if (action === "crew.job_rejected") return "Crew Rejected Job";
  if (action === "crew.requested_help") return "Crew Requested Help";
  if (action === "crew.requested_wait") return "Crew Requested Wait";
  if (action === "crew.request_time_extension") return "Crew Requested Time Extension";
  if (action === "booking.status_changed") return "Status Changed";
  if (action === "booking.created") return "Booking Created";
  if (action === "extend_time") return "Extend Time";
  if (action === "approve_time_extension") return "Approve Time Extension";
  if (action === "reject_time_extension") return "Reject Time Extension";
  return action.replaceAll("_", " ");
}

export function formatAuditDetail(action: string, detail: string): string {
  try {
    return parseDetail(action, JSON.parse(detail) as Record<string, unknown>, detail);
  } catch {
    return detail;
  }
}
