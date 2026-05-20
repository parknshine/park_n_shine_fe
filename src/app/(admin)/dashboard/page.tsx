"use client";

import { useState } from "react";
import { useUIStore } from "@/store/ui-store";
import {
  AdminQueueGroup,
  EscalationsPanel,
  BookingDetailDrawer,
} from "@/features/admin/components";
import { useAdminQueue } from "@/features/admin/hooks";
import type { AdminQueueBooking } from "@/features/admin/types";

export default function DashboardPage() {
  const activeSiteId = useUIStore((s) => s.activeSiteId);
  const [selectedBooking, setSelectedBooking] =
    useState<AdminQueueBooking | null>(null);

  const { queue, isLoading, refresh } = useAdminQueue({
    siteId: activeSiteId ?? "",
    enabled: !!activeSiteId,
  });

  function handleActionSuccess() {
    setSelectedBooking(null);
    void refresh();
  }

  if (!activeSiteId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Pilih site dari sidebar.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Memuat queue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Live queue — diperbarui setiap 10 detik
        </p>
      </div>

      {/* Escalations */}
      {queue && queue.escalations.length > 0 && (
        <EscalationsPanel
          bookings={queue.escalations}
          title={`Eskalasi — ${queue.escalations.length} booking butuh perhatian`}
        />
      )}

      {/* Queue groups */}
      {queue && queue.groups.length > 0 ? (
        <div className="space-y-4">
          {queue.groups.map((group) => (
            <AdminQueueGroup
              key={group.status}
              status={group.status}
              bookings={group.bookings}
              onBookingClick={setSelectedBooking}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground">
            Tidak ada booking saat ini.
          </p>
        </div>
      )}

      {/* Booking detail drawer */}
      <BookingDetailDrawer
        bookingId={selectedBooking?.id ?? null}
        siteId={activeSiteId}
        onClose={() => setSelectedBooking(null)}
        onActionSuccess={handleActionSuccess}
      />
    </div>
  );
}
