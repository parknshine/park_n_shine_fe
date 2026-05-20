"use client";

import type { AuditEntry } from "@/features/admin/types";

const ACTION_LABELS: Record<AuditEntry["action"], string> = {
  refund: "Refund",
  status_override: "Override Status",
  reassign: "Reassign",
};

interface AuditLogTableProps {
  entries: AuditEntry[];
  onRowClick?: (entry: AuditEntry) => void;
}

export function AuditLogTable({ entries, onRowClick }: AuditLogTableProps) {
  if (entries.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border">
        <p className="text-sm text-muted-foreground">Tidak ada audit entry.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/50">
          <tr>
            {["Timestamp", "Booking ID", "Plate", "Action", "Detail", "Admin"].map(
              (col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left font-medium text-muted-foreground"
                >
                  {col}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {entries.map((entry) => (
            <tr
              key={entry.id}
              onClick={() => onRowClick?.(entry)}
              className={`hover:bg-muted/30 ${onRowClick ? "cursor-pointer" : ""}`}
            >
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                {new Date(entry.createdAt).toLocaleString("id-ID")}
              </td>
              <td className="px-4 py-3 font-mono text-xs">{entry.bookingId}</td>
              <td className="px-4 py-3 font-semibold">
                {entry.plateText ?? "—"}
              </td>
              <td className="px-4 py-3">{ACTION_LABELS[entry.action]}</td>
              <td className="px-4 py-3 text-muted-foreground">{entry.detail}</td>
              <td className="px-4 py-3 text-muted-foreground">{entry.adminEmail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
