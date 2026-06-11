"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AdminQueueGroup,
  EscalationsPanel,
  BookingDetailDrawer,
} from "@/features/admin/components";
import { useAdminAllSitesQueue } from "@/features/admin/hooks";
import type { AdminQueueBooking } from "@/features/admin/types";
import { useTranslation } from "@/i18n";
import { useUIStore } from "@/store/ui-store";

function DashboardContent() {
  const sites = useUIStore((s) => s.sites);
  const [clickedBooking, setClickedBooking] =
    useState<AdminQueueBooking | null>(null);
  const { t } = useTranslation("admin");
  const searchParams = useSearchParams();
  const router = useRouter();

  const { sites: queueSites, isLoading, refresh } = useAdminAllSitesQueue();

  const urlBookingId = searchParams.get("bookingId");

  const urlBooking = useMemo(() => {
    if (!urlBookingId || !queueSites.length) return null;
    const allBookings = queueSites.flatMap((s) => [
      ...s.escalations,
      ...s.groups.flatMap((g) => g.bookings),
    ]);
    return allBookings.find((b) => b.id === urlBookingId) ?? null;
  }, [urlBookingId, queueSites]);

  useEffect(() => {
    if (urlBooking) {
      router.replace("/dashboard");
    }
  }, [urlBooking, router]);

  const selectedBooking = urlBooking ?? clickedBooking;

  function handleActionSuccess() {
    void refresh();
  }

  if (sites.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">{t("common.noSites")}</p>
        <Link href="/sites" className="text-sm font-medium text-primary hover:underline">
          {t("common.noSitesLink")}
        </Link>
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

      {queueSites.map((site) => (
        <div key={site.siteId} className="space-y-4">
          <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">
            {site.siteName}
          </h2>

          {site.escalations.length > 0 && (
            <EscalationsPanel
              bookings={site.escalations}
              title={t(
                site.escalations.length === 1
                  ? "dashboard.escalationsTitle"
                  : "dashboard.escalationsTitlePlural",
                { count: site.escalations.length }
              )}
              onBookingClick={setClickedBooking}
            />
          )}

          {site.groups.length > 0 ? (
            site.groups.map((group) => (
              <AdminQueueGroup
                key={group.status}
                status={group.status}
                bookings={group.bookings}
                onBookingClick={setClickedBooking}
              />
            ))
          ) : (
            <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-border">
              <p className="text-sm text-muted-foreground">{t("dashboard.emptyQueue")}</p>
            </div>
          )}
        </div>
      ))}

      <BookingDetailDrawer
        bookingId={selectedBooking?.id ?? null}
        onClose={() => setClickedBooking(null)}
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
