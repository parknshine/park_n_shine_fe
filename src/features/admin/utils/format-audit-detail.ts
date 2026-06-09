export function formatAuditAction(action: string): string {
  if (action === "crew.job_rejected") return "Crew Rejected Job";
  if (action === "crew.requested_help") return "Crew Requested Help";
  return action.replaceAll("_", " ");
}

export function formatAuditDetail(action: string, detail: string): string {
  try {
    const p = JSON.parse(detail) as Record<string, unknown>;
    if (action === "crew.job_rejected") {
      const reason = (p.reason as string) ?? "—";
      const crew = (p.crewName as string) ?? (p.crewId as string) ?? "—";
      const labels: Record<string, string> = {
        VEHICLE_TOO_DIRTY: "Vehicle too dirty",
        PARKING_TOO_TIGHT: "Parking too tight",
        SPECIAL_CARE_NEEDED: "Special care needed",
        CREW_UNAVAILABLE: "Crew unavailable",
      };
      return `${crew} — ${labels[reason] ?? reason}`;
    }
    if (action === "crew.requested_help") {
      const labels: Record<string, string> = {
        VEHICLE_INACCESSIBLE: "Vehicle inaccessible",
        MECHANICAL_ISSUE: "Mechanical issue",
        CUSTOMER_DISPUTE: "Customer dispute",
        HAZARD: "Hazard situation",
        OTHER: "Other",
      };
      const crew = (p.crewName as string) ?? (p.crewId as string) ?? "—";
      const reason = labels[p.reason as string] ?? (p.reason as string) ?? "—";
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
      const type = (p.amountType as string) ?? "—";
      const reason = p.reasonCode ? ` • ${p.reasonCode as string}` : "";
      return `${type}${reason}`;
    }
    return detail;
  } catch {
    return detail;
  }
}
