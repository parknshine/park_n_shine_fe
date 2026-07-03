"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, X, Calendar, Building2, SlidersHorizontal, RefreshCw } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdminTipList, useAdminTipCrewSummary } from "@/features/admin/hooks/use-admin-tips";
import { useSiteSelection } from "@/features/admin/hooks";
import type { AdminTipRow } from "@/features/admin/types/tip";
import { SiteSelector } from "@/features/admin/components";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const ALL_PERIODS = "all";

function toCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ReportTabs() {
  const pathname = usePathname();
  const { t } = useTranslation("admin");
  const tabs = [
    { label: t("reports.tabs.summary"), href: "/reports" },
    { label: t("reports.tabs.jobs"), href: "/reports/jobs" },
    { label: t("reports.tabs.tips"), href: "/reports/tips" },
    { label: t("reports.tabs.disbursements"), href: "/reports/disbursements" },
    { label: "Customers", href: "/reports/customers" },
  ];
  return (
    <div className='flex gap-1 border-b border-border overflow-x-auto'>
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors",
            pathname === tab.href
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

export default function TipsReportPage() {
  const { t } = useTranslation("admin");
  const [period, setPeriod] = useState(ALL_PERIODS);
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { sites } = useSiteSelection();
  const isAllPeriods = period === ALL_PERIODS;

  const { tipList, isLoading: isTipListLoading, refetch: refetchTipList } = useAdminTipList(
    period,
    page,
    pageSize,
    appliedSearch,
    selectedSiteId,
  );

  const { crewSummary, isLoading: isCrewSummaryLoading, refetch: refetchCrewSummary } = useAdminTipCrewSummary(period, selectedSiteId);

  const STATUS_STYLES: Record<AdminTipRow["status"], string> = {
    PAID: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    DISBURSED:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  };

  const tipColumns: ColumnDef<AdminTipRow>[] = [
    {
      accessorKey: "bookingId",
      header: t("reports.tips.columns.bookingId"),
      cell: ({ row }) => (
        <span className='font-mono text-xs'>{row.original.bookingId}</span>
      ),
    },
    {
      accessorKey: "siteName",
      header: t("reports.tips.columns.mall"),
      cell: ({ row }) => (
        <span className='text-xs'>
          {row.original.siteName ?? (
            <span className='text-muted-foreground'>—</span>
          )}
        </span>
      ),
    },
    {
      accessorKey: "crewName",
      header: t("reports.tips.columns.crew"),
      cell: ({ row }) => (
        <span className='text-xs'>
          {row.original.crewName ?? (
            <span className='text-muted-foreground'>—</span>
          )}
        </span>
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: t("reports.tips.columns.method"),
      cell: ({ row }) => (
        <span className='text-xs uppercase text-muted-foreground'>
          {row.original.paymentMethod ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: t("reports.tips.columns.amount"),
      meta: { align: "right" },
      cell: ({ row }) => (
        <span className='font-mono text-xs font-semibold'>
          {formatRupiah(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: t("reports.tips.columns.status"),
      meta: { align: "center" },
      cell: ({ row }) => (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            STATUS_STYLES[row.original.status],
          )}
        >
          {t(
            `reports.tips.status.${row.original.status.toLowerCase() as "paid" | "disbursed"}`,
          )}
        </span>
      ),
    },
    {
      accessorKey: "paidAt",
      header: t("reports.tips.columns.paidAt"),
      cell: ({ row }) => (
        <span className='whitespace-nowrap text-xs text-muted-foreground'>
          {formatDate(row.original.paidAt)}
        </span>
      ),
    },
  ];

  function applySearch() {
    setPage(1);
    setAppliedSearch(searchInput.trim());
  }

  function clearSearch() {
    setSearchInput("");
    setAppliedSearch("");
    setPage(1);
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") applySearch();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchInput],
  );


  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-xl font-bold text-foreground'>
          {t("reports.tips.title")}
        </h1>
        <p className='text-sm text-muted-foreground'>
          {t("reports.tips.subtitle")}
        </p>
      </div>

      <ReportTabs />

      {/* Filter panel */}
      {(() => {
        const activeFilterCount = (selectedSiteId ? 1 : 0) + (appliedSearch ? 1 : 0);
        const hasFilter = activeFilterCount > 0 || !!searchInput;
        return (
          <div className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
            <div className='flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3'>
              <div className='flex items-center gap-2'>
                <SlidersHorizontal className='h-3.5 w-3.5 text-primary' />
                <span className='text-xs font-semibold uppercase tracking-widest text-foreground'>
                  Filters
                </span>
                {activeFilterCount > 0 && (
                  <span className='flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white'>
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {hasFilter && (
                <button
                  type='button'
                  onClick={() => {
                    setSelectedSiteId("");
                    setSearchInput("");
                    setAppliedSearch("");
                    setPage(1);
                  }}
                  className='flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive'
                >
                  <X className='h-3 w-3' /> Reset all
                </button>
              )}
            </div>

            <div className='divide-y divide-border'>
              <div className='grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0'>
                <div className='space-y-2 px-4 py-3'>
                  <div className='flex items-center gap-1.5'>
                    <Calendar className='h-3 w-3 text-muted-foreground' />
                    <span className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground'>
                      Periode
                    </span>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <input
                      type='month'
                      value={isAllPeriods ? toCurrentMonth() : period}
                      max={toCurrentMonth()}
                      disabled={isAllPeriods}
                      onChange={(e) => { setPeriod(e.target.value); setPage(1); }}
                      className='h-8 min-w-0 flex-1 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50'
                    />
                    <button
                      type='button'
                      onClick={() => { setPeriod(isAllPeriods ? toCurrentMonth() : ALL_PERIODS); setPage(1); }}
                      className={cn(
                        "h-8 shrink-0 rounded-lg border px-2.5 text-xs font-medium transition-colors",
                        isAllPeriods
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {t("reports.tips.filter.allPeriods")}
                    </button>
                  </div>
                </div>

                <div className='space-y-2 px-4 py-3'>
                  <div className='flex items-center gap-1.5'>
                    <Building2 className='h-3 w-3 text-muted-foreground' />
                    <span className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground'>
                      Lokasi
                    </span>
                  </div>
                  <SiteSelector
                    sites={sites}
                    value={selectedSiteId}
                    onChange={(v) => { setSelectedSiteId(v); setPage(1); }}
                    allowAll
                    className={cn("h-8 w-full text-xs", selectedSiteId ? "border-primary/40 font-medium" : "")}
                  />
                </div>

                <div className='space-y-2 px-4 py-3'>
                  <div className='flex items-center gap-1.5'>
                    <Search className='h-3 w-3 text-muted-foreground' />
                    <span className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground'>
                      Cari
                    </span>
                  </div>
                  <div className='relative'>
                    <Input
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t("reports.tips.filter.searchPlaceholder")}
                      prefix={<Search />}
                      className={cn("h-8 w-full text-xs", appliedSearch ? "border-primary/50" : "")}
                    />
                    {searchInput && (
                      <button
                        type='button'
                        onClick={clearSearch}
                        className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                      >
                        <X className='h-3.5 w-3.5' />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className='flex items-center justify-end gap-2 px-4 py-3'>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={isTipListLoading || isCrewSummaryLoading}
                  onClick={() => { refetchTipList(); refetchCrewSummary(); }}
                  title='Refresh'
                  className='gap-1.5 text-xs'
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", (isTipListLoading || isCrewSummaryLoading) && "animate-spin")} />
                </Button>
                <button
                  type='button'
                  onClick={applySearch}
                  className='h-8 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90'
                >
                  {t("reports.tips.filter.search")}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Summary KPI cards */}
      <dl className='grid gap-3 sm:grid-cols-3'>
        <div className='rounded-lg border border-border p-4'>
          <dt className='text-xs font-medium text-muted-foreground'>Total Tip Diterima</dt>
          <dd className='mt-2 text-2xl font-semibold text-foreground'>
            {isCrewSummaryLoading ? "—" : formatRupiah(crewSummary?.summary.totalPaid ?? 0)}
          </dd>
        </div>
        <div className='rounded-lg border border-border p-4'>
          <dt className='text-xs font-medium text-muted-foreground'>Total Sudah Dicairkan</dt>
          <dd className='mt-2 text-2xl font-semibold text-foreground'>
            {isCrewSummaryLoading ? "—" : formatRupiah(crewSummary?.summary.totalDisbursed ?? 0)}
          </dd>
        </div>
        <div className='rounded-lg border border-border p-4'>
          <dt className='text-xs font-medium text-muted-foreground'>Crew Menerima Tip</dt>
          <dd className='mt-2 text-2xl font-semibold text-foreground'>
            {isCrewSummaryLoading ? "—" : (crewSummary?.summary.crewCount ?? 0)}
            <span className='ml-1 text-sm font-normal text-muted-foreground'>orang</span>
          </dd>
        </div>
      </dl>

      {/* Per-crew tip breakdown */}
      {crewSummary && crewSummary.crews.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Rincian Tip per Staff</h2>
          <div className="rounded-lg border border-border divide-y divide-border">
            {crewSummary.crews.map((crew) => (
              <div key={crew.crewId} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{crew.crewName}</p>
                  <p className="text-xs text-muted-foreground">{crew.tipCount} transaksi tip</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                    + {formatRupiah(crew.totalPaid)}
                  </p>
                  {crew.pendingDisbursement > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Belum dicairkan: {formatRupiah(crew.pendingDisbursement)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className='space-y-3'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <h2 className='text-sm font-semibold text-foreground'>
            {t("reports.tips.transactions")}
          </h2>
          <Button className='text-white'>
            <Link href='/reports/disbursements'>
              {t("reports.tips.createDisbursement")}
            </Link>
          </Button>
        </div>
        <DataTable
          columns={tipColumns}
          data={tipList?.tips ?? []}
          isLoading={isTipListLoading}
          emptyMessage={
            appliedSearch
              ? t("reports.tips.noDataSearch").replace(
                  "{{search}}",
                  appliedSearch,
                )
              : t("reports.tips.noData")
          }
          totalCount={tipList?.total ?? 0}
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
      </div>
    </div>
  );
}
