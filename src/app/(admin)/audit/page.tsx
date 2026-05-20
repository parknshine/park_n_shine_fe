"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { AuditLogTable } from "@/features/admin/components";
import { BookingDetailDrawer } from "@/features/admin/components";
import { useAuditLog } from "@/features/admin/hooks";
import { useUIStore } from "@/store/ui-store";
import type { AuditEntry } from "@/features/admin/types";

const ACTION_OPTIONS = [
  { value: "all", label: "Semua aksi" },
  { value: "status_override", label: "Override Status" },
  { value: "refund", label: "Refund" },
  { value: "reassign", label: "Reassign" },
];

export default function AuditPage() {
  const activeSiteId = useUIStore((s) => s.activeSiteId);
  const [action, setAction] = useState("all");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const { entries, isLoading } = useAuditLog(activeSiteId ?? "", { action });

  function handleRowClick(entry: AuditEntry) {
    setSelectedBookingId(entry.bookingId);
  }

  if (!activeSiteId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Pilih site dari sidebar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Audit Trail</h1>
        <p className="text-sm text-muted-foreground">
          Semua aksi admin — read-only, tidak dapat dihapus
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label htmlFor="action-filter">Filter aksi</Label>
          <select
            id="action-filter"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Memuat audit log...</p>
      ) : (
        <AuditLogTable entries={entries} onRowClick={handleRowClick} />
      )}

      <BookingDetailDrawer
        bookingId={selectedBookingId}
        siteId={activeSiteId}
        onClose={() => setSelectedBookingId(null)}
        onActionSuccess={() => setSelectedBookingId(null)}
      />
    </div>
  );
}
