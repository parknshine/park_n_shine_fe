"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUIStore } from "@/store/ui-store";
import {
  AdminQueueGroup,
  EscalationsPanel,
  BookingDetailDrawer,
} from "@/features/admin/components";
import { useAdminQueue } from "@/features/admin/hooks";
import type { AdminQueueBooking } from "@/features/admin/types";
import { useTranslation } from "@/i18n";

function DashboardContent() {
  const activeSiteId = useUIStore((s) => s.activeSiteId);
  const [selectedBooking, setSelectedBooking] =
    useState<AdminQueueBooking | null>(null);
  const { t } = useTranslation("admin");
  const searchParams = useSearchParams();
  const router = useRouter();

  const { queue, isLoading, refresh } = useAdminQueue({
    siteId: activeSiteId ?? "",
    enabled: !!activeSiteId,
  });

  // Auto-open drawer when bookingId is in the URL (e.g. from notification click)
  useEffect(() => {
    const bookingId = searchParams.get("bookingId");
    if (!bookingId || !queue) return;

    const allBookings = [
      ...(queue.escalations ?? []),
      ...(queue.groups ?? []).flatMap((g) => g.bookings),
    ];
    const found = allBookings.find((b) => b.id === bookingId);
    if (found) {
      setSelectedBooking(found);
      router.replace("/dashboard");
    }
  }, [searchParams, queue, router]);

  function handleActionSuccess() {
    setSelectedBooking(null);
    void refresh();
  }

  if (!activeSiteId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">{t("common.selectSite")}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">{t("dashboard.loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">{t("dashboard.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
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
          <p className="text-sm text-muted-foreground">{t("dashboard.emptyQueue")}</p>
        </div>
      )}

      {/* Booking detail drawer */}
      <BookingDetailDrawer
        bookingId={selectedBooking?.id ?? null}
        onClose={() => setSelectedBooking(null)}
        onActionSuccess={handleActionSuccess}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
