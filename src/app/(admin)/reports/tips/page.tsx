"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, X, Calendar, Wallet, Users, TrendingUp } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdminTipList, useAdminTipCrewSummary } from "@/features/admin/hooks/use-admin-tips";
import { useSiteSelection } from "@/features/admin/hooks";
import type { AdminTipRow } from "@/features/admin/types/tip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

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
  const [period, setPeriod] = useState(toCurrentMonth);
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedSiteId, setAppliedSiteId] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { sites } = useSiteSelection();

  const { tipList, isLoading: isTipListLoading } = useAdminTipList(
    period,
    page,
    pageSize,
    appliedSearch,
    appliedSiteId,
  );

  const { crewSummary, isLoading: isCrewSummaryLoading } = useAdminTipCrewSummary(period);

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
    setAppliedSiteId(selectedSiteId);
  }

  function clearSearch() {
    setSearchInput("");
    setAppliedSearch("");
    setSelectedSiteId("");
    setAppliedSiteId("");
    setPage(1);
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") applySearch();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchInput, selectedSiteId],
  );

  const toolbar = (
    <>
      <div className='flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 h-9'>
        <Calendar className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
        <input
          type='month'
          value={period}
          max={toCurrentMonth()}
          onChange={(e) => {
            setPeriod(e.target.value);
            setPage(1);
          }}
          className='bg-transparent text-sm text-foreground focus:outline-none'
        />
      </div>

      <Select
        value={selectedSiteId || "__all__"}
        onValueChange={(v) => setSelectedSiteId(v === "__all__" ? "" : v)}
      >
        <SelectTrigger
          className={cn(
            "h-9 w-44 text-xs",
            selectedSiteId ? "border-primary/50 font-medium" : "",
          )}
        >
          <SelectValue placeholder={t("reports.tips.filter.allMalls")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='__all__'>
            {t("reports.tips.filter.allMalls")}
          </SelectItem>
          {sites.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className='flex gap-1.5'>
        <div className='relative'>
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("reports.tips.filter.searchPlaceholder")}
            prefix={<Search />}
            className={cn("w-56", appliedSearch ? "border-primary/50" : "")}
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
        <button
          type='button'
          onClick={applySearch}
          className='h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90'
        >
          {t("reports.tips.filter.search")}
        </button>
      </div>
    </>
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

      {/* Summary KPI cards */}
      <dl className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
          <dt className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
            <Wallet className="h-3.5 w-3.5" />
            Total Tip Diterima
          </dt>
          <dd className="mt-2 text-2xl font-semibold text-amber-800 dark:text-amber-300">
            {isCrewSummaryLoading ? "—" : formatRupiah(crewSummary?.summary.totalPaid ?? 0)}
          </dd>
          <p className="mt-1 text-xs text-amber-600/70 dark:text-amber-500/60">Terpisah dari revenue car wash</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" />
            Total Sudah Dicairkan
          </dt>
          <dd className="mt-2 text-2xl font-semibold text-foreground">
            {isCrewSummaryLoading ? "—" : formatRupiah(crewSummary?.summary.totalDisbursed ?? 0)}
          </dd>
        </div>
        <div className="rounded-lg border border-border p-4">
          <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            Crew Menerima Tip
          </dt>
          <dd className="mt-2 text-2xl font-semibold text-foreground">
            {isCrewSummaryLoading ? "—" : (crewSummary?.summary.crewCount ?? 0)}
            <span className="ml-1 text-sm font-normal text-muted-foreground">orang</span>
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
          toolbar={toolbar}
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
