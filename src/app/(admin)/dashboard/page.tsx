"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AdminQueueGroup,
  EscalationsPanel,
  BookingDetailDrawer,
} from "@/features/admin/components";
import { useAdminAllSitesQueue } from "@/features/admin/hooks";
import type { AdminQueueBooking, AdminSiteQueue } from "@/features/admin/types";
import { useTranslation } from "@/i18n";
import { bookingRef } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";

const PREVIEW_LIMIT = 3;

function formatElapsedShort(
  seconds: number,
  t: ReturnType<typeof useTranslation<"admin">>["t"],
): string {
  if (seconds < 60) return t("queueGroup.seconds", { n: seconds });
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t("queueGroup.minutes", { n: minutes });
  return t("queueGroup.hours", {
    h: Math.floor(minutes / 60),
    m: minutes % 60,
  });
}

interface DashboardSiteCardProps {
  site: AdminSiteQueue;
  onBookingClick: (booking: AdminQueueBooking) => void;
}

function DashboardSiteCard({
  site,
  onBookingClick,
}: Readonly<DashboardSiteCardProps>) {
  const { t } = useTranslation("admin");
  const router = useRouter();

  const escalationIds = new Set(site.escalations.map((e) => e.id));
  const allBookings: AdminQueueBooking[] = [
    ...site.escalations,
    ...site.groups.flatMap((g) => g.bookings),
  ];
  const preview = allBookings.slice(0, PREVIEW_LIMIT);
  const remaining = allBookings.length - preview.length;
  const totalCount = allBookings.length;

  return (
    <div className='rounded-xl border border-border bg-card shadow-sm flex flex-col'>
      {/* Card header */}
      <div className='flex items-center justify-between gap-3 p-4 border-b border-border'>
        <div className='flex items-center gap-2 min-w-0'>
          <div className='rounded-full bg-[#3D8FE4] w-6 h-6 flex items-center justify-center shrink-0'>
            <Building2 className='h-3.5 w-3.5 text-white' />
          </div>
          <h2 className='text-sm font-semibold text-foreground truncate'>
            {site.siteName}
          </h2>
        </div>
        <Button
          variant={totalCount > 0 ? "default" : "outline"}
          size='sm'
          className='shrink-0'
          onClick={() => router.push(`/dashboard?siteId=${site.siteId}`)}
        >
          {t("dashboard.seeAll")}
          {totalCount > 0 && (
            <span className='ml-1.5 rounded-full bg-primary-foreground/20 px-1.5 py-0.5 text-xs font-semibold'>
              {totalCount}
            </span>
          )}
        </Button>
      </div>

      {/* Card body */}
      <div className='flex-1 p-2'>
        {allBookings.length === 0 ? (
          <div className='flex h-24 items-center justify-center'>
            <p className='text-sm text-muted-foreground'>
              {t("dashboard.emptyQueue")}
            </p>
          </div>
        ) : (
          <div className='divide-y divide-border'>
            {preview.map((booking, i) => {
              const isEscalated = escalationIds.has(booking.id);
              return (
                <button
                  key={booking.id}
                  type='button'
                  onClick={() => onBookingClick(booking)}
                  className='grid w-full grid-cols-[1.5rem_1fr_auto_auto] items-center gap-2 px-2 py-2 text-left text-sm hover:bg-muted/50 transition-colors rounded'
                >
                  <span className='text-xs text-muted-foreground font-mono'>
                    {i + 1}
                  </span>
                  <div className='min-w-0 flex items-center gap-1.5'>
                    {isEscalated && (
                      <AlertTriangle className='h-3 w-3 shrink-0 text-red-500' />
                    )}
                    <div className='min-w-0'>
                      <p className='font-semibold text-foreground truncate'>
                        {booking.plateText ?? bookingRef(booking.reference, booking.id)}
                      </p>
                      <p className='text-xs text-muted-foreground truncate'>
                        {booking.slotText}
                      </p>
                    </div>
                  </div>
                  <p className='text-xs text-muted-foreground shrink-0'>
                    {booking.crewName ?? t("queueGroup.unassigned")}
                  </p>
                  <p className='text-xs font-mono text-muted-foreground shrink-0'>
                    {formatElapsedShort(booking.elapsedSeconds, t)}
                  </p>
                </button>
              );
            })}
            {remaining > 0 && (
              <p className='px-2 py-1.5 text-xs text-muted-foreground text-center'>
                {t("dashboard.moreBookings", { count: remaining })}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface DashboardGridViewProps {
  sites: AdminSiteQueue[];
  onBookingClick: (booking: AdminQueueBooking) => void;
}

function DashboardGridView({ sites, onBookingClick }: DashboardGridViewProps) {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      {sites.map((site) => (
        <DashboardSiteCard
          key={site.siteId}
          site={site}
          onBookingClick={onBookingClick}
        />
      ))}
    </div>
  );
}

interface DashboardSiteViewProps {
  site: AdminSiteQueue;
  selectedBooking: AdminQueueBooking | null;
  onBookingClick: (booking: AdminQueueBooking) => void;
  onClose: () => void;
  onActionSuccess: () => void;
}

function DashboardSiteView({
  site,
  selectedBooking,
  onBookingClick,
  onClose,
  onActionSuccess,
}: DashboardSiteViewProps) {
  const { t } = useTranslation("admin");
  const router = useRouter();

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-3'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <div>
          <h1 className='text-xl font-bold text-foreground'>{site.siteName}</h1>
          <p className='text-sm text-muted-foreground'>
            {t("dashboard.subtitle")}
          </p>
        </div>
      </div>

      {site.escalations.length > 0 && (
        <EscalationsPanel
          bookings={site.escalations}
          title={t(
            site.escalations.length === 1
              ? "dashboard.escalationsTitle"
              : "dashboard.escalationsTitlePlural",
            { count: site.escalations.length },
          )}
          onBookingClick={onBookingClick}
        />
      )}

      {site.groups.length > 0 ? (
        site.groups.map((group) => (
          <AdminQueueGroup
            key={group.status}
            status={group.status}
            bookings={group.bookings}
            onBookingClick={onBookingClick}
          />
        ))
      ) : (
        <div className='flex h-28 items-center justify-center rounded-lg border border-dashed border-border'>
          <p className='text-sm text-muted-foreground'>
            {t("dashboard.emptyQueue")}
          </p>
        </div>
      )}

      <BookingDetailDrawer
        bookingId={selectedBooking?.id ?? null}
        onClose={onClose}
        onActionSuccess={onActionSuccess}
      />
    </div>
  );
}

function DashboardContent() {
  const sites = useUIStore((s) => s.sites);
  const [clickedBooking, setClickedBooking] =
    useState<AdminQueueBooking | null>(null);
  const { t } = useTranslation("admin");
  const searchParams = useSearchParams();
  const router = useRouter();

  const { sites: queueSites, isLoading, refresh } = useAdminAllSitesQueue();

  const selectedSiteId = searchParams.get("siteId");
  const urlBookingId = searchParams.get("bookingId");

  const allQueueBookings = queueSites.flatMap((s) => [
    ...s.escalations,
    ...s.groups.flatMap((g) => g.bookings),
  ]);
  const urlBooking = urlBookingId
    ? (allQueueBookings.find((b) => b.id === urlBookingId) ?? null)
    : null;

  useEffect(() => {
    if (!urlBookingId) return;
    const found = allQueueBookings.find((b) => b.id === urlBookingId);
    if (found) {
      const base = selectedSiteId
        ? `/dashboard?siteId=${selectedSiteId}`
        : "/dashboard";
      router.replace(base);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlBookingId, selectedSiteId]);

  const selectedBooking = urlBooking ?? clickedBooking;

  function handleActionSuccess() {
    void refresh();
  }

  if (sites.length === 0) {
    return (
      <div className='flex h-full flex-col items-center justify-center gap-2'>
        <p className='text-muted-foreground'>{t("common.noSites")}</p>
        <Link
          href='/sites'
          className='text-sm font-medium text-primary hover:underline'
        >
          {t("common.noSitesLink")}
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <p className='text-muted-foreground'>{t("dashboard.loading")}</p>
      </div>
    );
  }

  // Single-site queue view
  if (selectedSiteId) {
    const site = queueSites.find((s) => s.siteId === selectedSiteId);
    if (site) {
      return (
        <DashboardSiteView
          site={site}
          selectedBooking={selectedBooking}
          onBookingClick={setClickedBooking}
          onClose={() => setClickedBooking(null)}
          onActionSuccess={handleActionSuccess}
        />
      );
    }
    // Unknown siteId — fall through to grid
  }

  // Card grid overview
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-xl font-bold text-foreground'>
          {t("dashboard.title")}
        </h1>
        <p className='text-sm text-muted-foreground'>
          {t("dashboard.subtitle")}
        </p>
      </div>
      <DashboardGridView
        sites={queueSites}
        onBookingClick={(booking) => {
          const site = queueSites.find((s) =>
            [...s.escalations, ...s.groups.flatMap((g) => g.bookings)].some(
              (b) => b.id === booking.id,
            ),
          );
          if (site) {
            router.push(`/dashboard?siteId=${site.siteId}`);
          }
        }}
      />
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
