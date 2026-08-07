"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FileDown, ChevronDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/axios-admin";
import {
  useAdminReportBookings,
  useAdminCrew,
  useSiteSelection,
} from "@/features/admin/hooks";
import type { ReportBookingRow } from "@/features/admin/types";
import type {
  ReportBookingFilters,
  ReportBookingsResponse,
} from "@/features/admin/hooks/use-admin-report-bookings";
import { bookingRevenue } from "@/features/admin/utils/booking-revenue";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";
import { ReportTabs } from "@/features/admin/components";
import { PAGE_SIZE_OPTIONS, formatRupiah } from "@/features/admin/utils/reports/jobs-format";
import { expandLedgerRows, downloadExcel, downloadCSV } from "@/features/admin/utils/reports/jobs-export";
import { buildJobColumns } from "@/features/admin/components/reports/jobs/job-columns";
import { JobFiltersPanel } from "@/features/admin/components/reports/jobs/job-filters-panel";
import { JobFilterChips } from "@/features/admin/components/reports/jobs/job-filter-chips";
import { JobDetailModal } from "@/features/admin/components/reports/jobs/job-detail-modal";

function ReportJobsContent() {
  const { sites: allSites } = useSiteSelection();
  const { t } = useTranslation("admin");
  const setDrawerBookingId = useUIStore((s) => s.setDrawerBookingId);
  const searchParams = useSearchParams();
  const initialNeedsRefund = searchParams.get("paymentStatus") === "needs_refund";
  const initialHasPhone = searchParams.get("hasPhone") === "true";

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");

  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [selectedCrewId, setSelectedCrewId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<
    "" | "true" | "false" | "needs_refund"
  >(initialNeedsRefund ? "needs_refund" : "");
  const [hasRatingFilter, setHasRatingFilter] = useState<"" | "true" | "false">(
    "",
  );
  const [hasPhotosFilter, setHasPhotosFilter] = useState(false);
  const [hasPhoneFilter, setHasPhoneFilter] = useState<"" | "true" | "false">(
    initialHasPhone ? "true" : "",
  );
  const [notificationSentFilter, setNotificationSentFilter] = useState<
    "" | "true" | "false"
  >("");
  const [searchInput, setSearchInput] = useState("");

  const [appliedFilters, setAppliedFilters] = useState<ReportBookingFilters>(() => {
    const initial: ReportBookingFilters = {};
    if (initialNeedsRefund) initial.needsRefund = true;
    if (initialHasPhone) initial.hasPhone = true;
    return initial;
  });
  const [appliedSiteId, setAppliedSiteId] = useState<string | undefined>(
    undefined,
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    if (searchParams.get("paymentStatus") !== "needs_refund") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPaymentStatusFilter("needs_refund");
    setPage(1);
    setAppliedFilters((prev) => ({ ...prev, needsRefund: true }));
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get("hasPhone") !== "true") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasPhoneFilter("true");
    setPage(1);
    setAppliedFilters((prev) => ({ ...prev, hasPhone: true }));
  }, [searchParams]);

  const [detailRow, setDetailRow] = useState<ReportBookingRow | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const effectiveSiteId =
    appliedSiteId === undefined ? undefined : appliedSiteId || undefined;
  const { crew } = useAdminCrew();

  const {
    bookings: jobRows,
    total: jobTotal,
    isLoading,
    refetch,
  } = useAdminReportBookings(
    effectiveSiteId,
    appliedFrom,
    appliedTo,
    appliedFilters,
    page,
    pageSize,
  );

  function handleApply() {
    setPage(1);
    setAppliedFrom(from);
    setAppliedTo(to);
    setAppliedSiteId(
      selectedSiteId === "__all__" ? "" : selectedSiteId || undefined,
    );
    setAppliedFilters({
      crewId: selectedCrewId || undefined,
      statuses: statusFilter ? [statusFilter] : undefined,
      refunded:
        paymentStatusFilter === "true"
          ? true
          : paymentStatusFilter === "false"
            ? false
            : undefined,
      needsRefund: paymentStatusFilter === "needs_refund" ? true : undefined,
      hasRating:
        hasRatingFilter === "true"
          ? true
          : hasRatingFilter === "false"
            ? false
            : undefined,
      hasPhotos: hasPhotosFilter || undefined,
      hasPhone:
        hasPhoneFilter === "true"
          ? true
          : hasPhoneFilter === "false"
            ? false
            : undefined,
      notificationSent:
        notificationSentFilter === "true"
          ? true
          : notificationSentFilter === "false"
            ? false
            : undefined,
      search: searchInput.trim() || undefined,
    });
  }

  function handleExportCurrent(format: "excel" | "csv") {
    if (format === "csv") {
      downloadCSV(jobRows, `park-n-shine-jobs-page${page}`);
      return;
    }
    void downloadExcel(jobRows, `park-n-shine-jobs-page${page}`);
  }

  async function handleExportAll(format: "excel" | "csv") {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (effectiveSiteId) params.set("siteId", effectiveSiteId);
      if (appliedFrom) params.set("from", appliedFrom);
      if (appliedTo) params.set("to", appliedTo);
      if (appliedFilters.crewId) params.set("crewId", appliedFilters.crewId);
      if (appliedFilters.statuses?.length)
        params.set("statuses", appliedFilters.statuses.join(","));
      if (appliedFilters.refunded !== undefined)
        params.set("refunded", String(appliedFilters.refunded));
      if (appliedFilters.needsRefund !== undefined)
        params.set("needsRefund", String(appliedFilters.needsRefund));
      if (appliedFilters.hasRating !== undefined)
        params.set("hasRating", String(appliedFilters.hasRating));
      if (appliedFilters.hasPhotos !== undefined)
        params.set("hasPhotos", String(appliedFilters.hasPhotos));
      if (appliedFilters.hasPhone !== undefined)
        params.set("hasPhone", String(appliedFilters.hasPhone));
      if (appliedFilters.notificationSent !== undefined)
        params.set("notificationSent", String(appliedFilters.notificationSent));
      if (appliedFilters.search) params.set("search", appliedFilters.search);
      params.set("page", "1");
      params.set("limit", String(jobTotal || 10000));
      const res = await api.get<ReportBookingsResponse>(
        `/v1/admin/reports/bookings?${params}`,
      );
      if (format === "csv") {
        downloadCSV(res.data.rows, `park-n-shine-jobs-all`);
      } else {
        await downloadExcel(res.data.rows, `park-n-shine-jobs-all`);
      }
    } finally {
      setIsExporting(false);
    }
  }

  function handleClear() {
    setPage(1);
    setFrom("");
    setTo("");
    setAppliedFrom("");
    setAppliedTo("");
    setSelectedSiteId("");
    setAppliedSiteId(undefined);
    setSelectedCrewId("");
    setStatusFilter("");
    setPaymentStatusFilter("");
    setHasRatingFilter("");
    setHasPhotosFilter(false);
    setHasPhoneFilter("");
    setNotificationSentFilter("");
    setSearchInput("");
    setAppliedFilters({});
  }

  const hasFilter =
    appliedSiteId !== undefined ||
    appliedFrom !== "" ||
    appliedTo !== "" ||
    !!appliedFilters.crewId ||
    !!appliedFilters.statuses?.length ||
    appliedFilters.refunded !== undefined ||
    appliedFilters.needsRefund !== undefined ||
    appliedFilters.hasRating !== undefined ||
    appliedFilters.hasPhotos ||
    appliedFilters.hasPhone !== undefined ||
    appliedFilters.notificationSent !== undefined ||
    !!appliedFilters.search;

  if (allSites.length === 0) {
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

  const activeFilterCount = [
    appliedSiteId !== undefined,
    from || to,
    selectedCrewId,
    statusFilter !== "",
    paymentStatusFilter !== "",
    hasRatingFilter !== "",
    hasPhotosFilter,
    hasPhoneFilter !== "",
    notificationSentFilter !== "",
    searchInput.trim() !== "",
  ].filter(Boolean).length;

  const selectedCrewName = crew.find((c) => c.id === selectedCrewId)?.name;
  const selectedSiteName = appliedSiteId
    ? allSites.find((s) => s.id === appliedSiteId)?.name
    : null;

  // Payment Status filter narrows which half of a refunded booking's ledger
  // split to show: "Refunded" keeps only the money-out (REFUND) row, "Paid"
  // keeps only the money-in (PAID) row — the booking itself still matches
  // either way, so both filters see the same underlying set of bookings.
  const displayRows = expandLedgerRows(jobRows).filter((row) => {
    if (appliedFilters.refunded === true) return row._ledgerType !== "PAID";
    if (appliedFilters.refunded === false) return row._ledgerType !== "REFUND";
    return true;
  });

  const columns = buildJobColumns({
    t,
    onOpenBooking: setDrawerBookingId,
    onOpenDetail: setDetailRow,
  });

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4'>
        <div>
          <h1 className='text-xl font-bold text-foreground'>
            {t("reports.title")}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {t("reports.jobDetail.subtitle")}
          </p>
        </div>
      </div>

      <ReportTabs />

      <JobFiltersPanel
        t={t}
        isLoading={isLoading}
        activeFilterCount={activeFilterCount}
        hasFilter={hasFilter}
        onClear={handleClear}
        onApply={handleApply}
        from={from}
        to={to}
        onFromChange={setFrom}
        onToChange={setTo}
        allSites={allSites}
        selectedSiteId={selectedSiteId}
        onSelectedSiteIdChange={setSelectedSiteId}
        crew={crew}
        selectedCrewId={selectedCrewId}
        onSelectedCrewIdChange={setSelectedCrewId}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        paymentStatusFilter={paymentStatusFilter}
        onPaymentStatusFilterChange={setPaymentStatusFilter}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        appliedSearch={appliedFilters.search}
        hasRatingFilter={hasRatingFilter}
        onHasRatingFilterChange={setHasRatingFilter}
        hasPhotosFilter={hasPhotosFilter}
        onHasPhotosFilterChange={setHasPhotosFilter}
        hasPhoneFilter={hasPhoneFilter}
        onHasPhoneFilterChange={setHasPhoneFilter}
        notificationSentFilter={notificationSentFilter}
        onNotificationSentFilterChange={setNotificationSentFilter}
      />

      {hasFilter && (
        <JobFilterChips
          t={t}
          appliedSiteId={appliedSiteId}
          selectedSiteName={selectedSiteName}
          appliedFrom={appliedFrom}
          appliedTo={appliedTo}
          selectedCrewName={selectedCrewName}
          appliedFilters={appliedFilters}
        />
      )}

      {/* Amount summary */}
      {jobRows.length > 0 &&
        (() => {
          const pageRevenue = jobRows.reduce(
            (sum, r) => sum + bookingRevenue(r),
            0,
          );
          const pageRefunded = jobRows.reduce(
            (sum, r) => sum + r.refundedAmount,
            0,
          );
          const pageNet = pageRevenue - pageRefunded;
          return (
            <div className='flex flex-wrap items-center gap-4 rounded-xl border border-border bg-muted/30 px-4 py-3'>
              <div className='flex items-center gap-3'>
                <span className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground'>
                  Revenue
                </span>
                <span className='font-mono text-sm font-semibold text-foreground'>
                  {formatRupiah(pageRevenue)}
                </span>
              </div>
              <div className='h-4 w-px bg-border' />
              <div className='flex items-center gap-3'>
                <span className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground'>
                  Refunded
                </span>
                <span className='font-mono text-sm font-semibold text-red-600 dark:text-red-400'>
                  {pageRefunded > 0
                    ? `-${formatRupiah(pageRefunded)}`
                    : formatRupiah(0)}
                </span>
              </div>
              <div className='h-4 w-px bg-border' />
              <div className='flex items-center gap-3'>
                <span className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground'>
                  Net
                </span>
                <span className='font-mono text-sm font-bold text-foreground'>
                  {formatRupiah(pageNet)}
                </span>
              </div>
              <span className='ml-auto text-[10px] text-muted-foreground/60'>
                halaman ini
              </span>
            </div>
          );
        })()}

      {/* Export toolbar */}
      <div className='flex items-center justify-between gap-3'>
        <span className='text-sm text-muted-foreground'>
          <span className='font-semibold text-foreground'>{jobTotal}</span>{" "}
          results
        </span>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            disabled={isLoading}
            onClick={() => void refetch()}
            className='gap-1.5 text-xs'
            title='Refresh table'
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", isLoading && "animate-spin")}
            />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                disabled={isLoading || jobRows.length === 0}
                className='gap-1.5 text-xs'
              >
                <FileDown className='h-3.5 w-3.5' />
                Export Current View
                <ChevronDown className='h-3 w-3' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => handleExportCurrent("excel")}>
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportCurrent("csv")}>
                CSV (.csv)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                disabled={isLoading || jobTotal === 0 || isExporting}
                className='gap-1.5 text-xs'
              >
                {isExporting ? (
                  <span className='h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground' />
                ) : (
                  <FileDown className='h-3.5 w-3.5' />
                )}
                Export All ({jobTotal})
                <ChevronDown className='h-3 w-3' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => handleExportAll("excel")}>
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportAll("csv")}>
                CSV (.csv)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Data table */}
      <DataTable
        columns={columns}
        data={displayRows}
        rowClassName={(row) => {
          if (row._ledgerType === "PAID")
            return "bg-emerald-50/60 dark:bg-emerald-950/20";
          if (row._ledgerType === "REFUND")
            return "bg-red-50/60 dark:bg-red-950/20";
          return undefined;
        }}
        isLoading={isLoading}
        emptyMessage={t("reports.jobDetail.noData")}
        totalCount={jobTotal}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onPageSizeChange={(v) => {
          setPageSize(v);
          setPage(1);
        }}
        resultsLabel={(start, end, total) => (
          <>
            Showing{" "}
            <span className='font-semibold text-foreground'>
              {start}–{end}
            </span>{" "}
            of <span className='font-semibold text-foreground'>{total}</span>{" "}
            results
          </>
        )}
      />

      {/* Detail modal */}
      <JobDetailModal
        open={detailRow !== null}
        onClose={() => setDetailRow(null)}
        row={detailRow}
        t={t}
      />
    </div>
  );
}

export default function ReportJobsPage() {
  return (
    <Suspense>
      <ReportJobsContent />
    </Suspense>
  );
}
