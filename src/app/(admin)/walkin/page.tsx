"use client";

import { useState } from "react";
import { PersonStanding } from "lucide-react";
import {
  AdminQueueGroup,
  EscalationsPanel,
  BookingDetailDrawer,
} from "@/features/admin/components";
import { useWalkInQueue } from "@/features/admin/hooks";
import type { AdminQueueBooking } from "@/features/admin/types";
import { useTranslation } from "@/i18n";

export default function WalkInQueuePage() {
  const [selectedBooking, setSelectedBooking] =
    useState<AdminQueueBooking | null>(null);
  const { t } = useTranslation("admin");

  const { queue, isLoading, refresh } = useWalkInQueue();

  function handleActionSuccess() {
    setSelectedBooking(null);
    void refresh();
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">{t("walkin.loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <PersonStanding className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-bold text-foreground">{t("walkin.title")}</h1>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{t("walkin.subtitle")}</p>
      </div>

      {/* Escalations */}
      {queue && queue.escalations?.length > 0 && (
        <EscalationsPanel
          bookings={queue.escalations}
          title={t(
            queue.escalations.length === 1
              ? "dashboard.escalationsTitle"
              : "dashboard.escalationsTitlePlural",
            { count: queue.escalations.length }
          )}
          onBookingClick={setSelectedBooking}
        />
      )}

      {/* Queue groups */}
      {queue && queue.groups?.length > 0 ? (
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
          <p className="text-sm text-muted-foreground">{t("walkin.emptyQueue")}</p>
        </div>
      )}

      {/* Booking detail drawer — siteId not applicable for walk-ins */}
      <BookingDetailDrawer
        bookingId={selectedBooking?.id ?? null}
        siteId=""
        onClose={() => setSelectedBooking(null)}
        onActionSuccess={handleActionSuccess}
      />
    </div>
  );
}
