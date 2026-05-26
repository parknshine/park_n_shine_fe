export function formatAuditDetail(action: string, detail: string): string {
  try {
    const p = JSON.parse(detail) as Record<string, unknown>;
    if (action === "reassign") {
      const name = (p.newCrewName as string) ?? (p.newCrewId as string) ?? "—";
      const reason = p.reasonCode ? ` • ${p.reasonCode}` : "";
      return `→ ${name}${reason}`;
    }
    if (action === "status_override") {
      const from = (p.previousStatus as string) ?? "—";
      const to = (p.nextStatus as string) ?? "—";
      const reason = p.reasonCode ? ` • ${p.reasonCode}` : "";
      return `${from} → ${to}${reason}`;
    }
    if (action === "refund") {
      const type = (p.amountType as string) ?? "—";
      const reason = p.reasonCode ? ` • ${p.reasonCode}` : "";
      return `${type}${reason}`;
    }
    return detail;
  } catch {
    return detail;
  }
}
