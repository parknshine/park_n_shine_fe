"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { X, ArrowRight, Star, Wallet, SlidersHorizontal, Calendar, Building2, Check, RefreshCw } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KpiSummary } from "@/features/admin/components";
import { useAdminReport, useSiteSelection } from "@/features/admin/hooks";
import { useAdminTipCrewSummary } from "@/features/admin/hooks/use-admin-tips";
import type { AdminReport, ReportCrewPerformance } from "@/features/admin/types";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function deriveTipPeriod(appliedFrom: string): string {
  return appliedFrom ? appliedFrom.slice(0, 7) : currentMonth();
}

function formatPeriodLabel(period: string): string {
  const [year, month] = period.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function formatTurnaround(seconds: number | null): string {
  if (seconds === null) return "—";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function reliabilityColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

function reliabilityTextColor(score: number): string {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}


function ReportTabs() {
  const pathname = usePathname();
  const { t } = useTranslation("admin");
  const tabs = [
    { label: t("reports.tabs.summary"), href: "/reports" },
    { label: t("reports.tabs.jobs"), href: "/reports/jobs" },
    { label: t("reports.tabs.tips"), href: "/reports/tips" },
    { label: t("reports.tabs.disbursements"), href: "/reports/disbursements" },
    { label: t("reports.tabs.customers"), href: "/reports/customers" },
  ];
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-border">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors",
            pathname === tab.href
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const { sites } = useSiteSelection();
  const { t } = useTranslation("admin");

  const [siteId, setSiteId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [appliedSiteId, setAppliedSiteId] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");

  const tipPeriod = deriveTipPeriod(appliedFrom);

  const { report, isLoading, refetch } = useAdminReport(appliedSiteId || undefined, appliedFrom, appliedTo);
  const { crewSummary } = useAdminTipCrewSummary(tipPeriod, appliedSiteId);

  const activeFilterCount = [appliedSiteId, appliedFrom, appliedTo].filter(Boolean).length;
  const hasFilter = activeFilterCount > 0;

  const statusEntries = useMemo(() => Object.entries(report?.bookings.byStatus ?? {}), [report?.bookings.byStatus]);

  const statusColumns = useMemo<ColumnDef<[string, number]>[]>(
    () => [
      {
        accessorFn: ([status]) => status,
        id: "status",
        header: t("reports.columns.status"),
        cell: ({ row }) => (
          <span className="font-mono text-xs uppercase">{row.original[0]}</span>
        ),
      },
      {
        accessorFn: ([, count]) => count,
        id: "count",
        header: t("reports.columns.count"),
        meta: { align: "right" },
        cell: ({ row }) => row.original[1],
      },
    ],
    [t]
  );

  const crewColumns = useMemo<ColumnDef<ReportCrewPerformance>[]>(
    () => [
      {
        accessorKey: "crewName",
        header: t("reports.crew.name"),
        cell: ({ row }) => <span className="font-medium">{row.original.crewName}</span>,
      },
      {
        accessorKey: "jobsCompleted",
        header: t("reports.crew.jobs"),
        meta: { align: "right" },
      },
      {
        accessorKey: "staleCount",
        header: t("reports.crew.stale"),
        meta: { align: "right" },
        cell: ({ row }) => (
          <span
            className={cn(
              "font-mono text-xs",
              row.original.staleCount > 0
                ? "text-red-600 dark:text-red-400"
                : "text-muted-foreground"
            )}
          >
            {row.original.staleCount}
          </span>
        ),
      },
      {
        accessorKey: "needsHelpCount",
        header: t("reports.crew.needsHelp"),
        meta: { align: "right" },
        cell: ({ row }) => (
          <span
            className={cn(
              "font-mono text-xs",
              row.original.needsHelpCount > 0
                ? "text-amber-600 dark:text-amber-400"
                : "text-muted-foreground"
            )}
          >
            {row.original.needsHelpCount}
          </span>
        ),
      },
      {
        accessorKey: "rejectedCount",
        header: t("reports.crew.rejected"),
        meta: { align: "right" },
        cell: ({ row }) => (
          <span
            className={cn(
              "font-mono text-xs",
              row.original.rejectedCount > 0
                ? "text-orange-600 dark:text-orange-400"
                : "text-muted-foreground"
            )}
          >
            {row.original.rejectedCount}
          </span>
        ),
      },
      {
        accessorKey: "timeExtensionCount",
        header: t("reports.crew.timeExt"),
        meta: { align: "right" },
        cell: ({ row }) => (
          <span
            className={cn(
              "font-mono text-xs",
              row.original.timeExtensionCount > 0
                ? "text-blue-600 dark:text-blue-400"
                : "text-muted-foreground"
            )}
          >
            {row.original.timeExtensionCount}
          </span>
        ),
      },
      {
        accessorKey: "reliabilityScore",
        header: t("reports.crew.reliability"),
        meta: { align: "right" },
        cell: ({ row }) => {
          const score = row.original.reliabilityScore;
          if (score == null) return <span className="text-muted-foreground">—</span>;
          return (
            <div className="flex items-center justify-end gap-2">
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", reliabilityColor(score))}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className={cn("font-mono text-xs", reliabilityTextColor(score))}>
                {score.toFixed(1)}%
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "avgTurnaroundSeconds",
        header: t("reports.crew.avgTurnaround"),
        meta: { align: "right" },
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {formatTurnaround(row.original.avgTurnaroundSeconds)}
          </span>
        ),
      },
      {
        accessorKey: "avgRating",
        header: t("reports.crew.avgRating"),
        meta: { align: "right" },
        cell: ({ row }) => {
          const rating = row.original.avgRating;
          if (rating == null) return <span className="text-muted-foreground">—</span>;
          return (
            <span className="inline-flex items-center gap-1 font-mono text-xs">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              {rating.toFixed(1)}
            </span>
          );
        },
      },
      {
        accessorKey: "estimatedRevenue",
        header: t("reports.crew.revenue"),
        meta: { align: "right" },
        cell: ({ row }) => formatRupiah(row.original.estimatedRevenue),
      },
    ],
    [t]
  );

  function handleApply() {
    setAppliedSiteId(siteId);
    setAppliedFrom(from);
    setAppliedTo(to);
  }

  function handleClear() {
    setSiteId("");
    setFrom("");
    setTo("");
    setAppliedSiteId("");
    setAppliedFrom("");
    setAppliedTo("");
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">{t("reports.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("reports.subtitle")}</p>
      </div>

      <ReportTabs />

      {/* Filter panel */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-foreground">
              Filters
            </span>
            {activeFilterCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </div>
          {hasFilter && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
            >
              <X className="h-3 w-3" /> Reset all
            </button>
          )}
        </div>

        <div className="divide-y divide-border">
          <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {/* Date range */}
            <div className="space-y-2 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {t("reports.fromLabel")} — {t("reports.toLabel")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={from}
                  max={to || toISODate(new Date())}
                  onChange={(e) => setFrom(e.target.value)}
                  className={cn(
                    "h-8 min-w-0 flex-1 rounded-lg border px-2.5 text-xs bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
                    from ? "border-primary/40 text-foreground" : "border-border text-muted-foreground",
                  )}
                />
                <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                <input
                  type="date"
                  value={to}
                  min={from}
                  max={toISODate(new Date())}
                  onChange={(e) => setTo(e.target.value)}
                  className={cn(
                    "h-8 min-w-0 flex-1 rounded-lg border px-2.5 text-xs bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
                    to ? "border-primary/40 text-foreground" : "border-border text-muted-foreground",
                  )}
                />
              </div>
            </div>

            {/* Mall */}
            <div className="space-y-2 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <Building2 className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Mall
                </span>
              </div>
              <Select
                value={siteId || "__all__"}
                onValueChange={(v) => setSiteId(v === "__all__" ? "" : v)}
              >
                <SelectTrigger className={cn("h-8 w-full text-xs", siteId ? "border-primary/40 font-medium" : "")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Semua Mall</SelectItem>
                  {sites.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Apply */}
          <div className="flex flex-wrap items-center justify-end gap-3 px-4 py-3">
            <Button variant="outline" size="sm" disabled={isLoading} onClick={() => refetch()} title="Refresh" className="gap-1.5 text-xs">
              <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            </Button>
            <Button onClick={handleApply} disabled={isLoading} className="gap-2 px-5">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {t("reports.loading")}
                </span>
              ) : (
                <>
                  {t("reports.apply")}
                  {activeFilterCount > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white/20 px-1 text-[10px] font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                  <Check className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilter && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Aktif:</span>
          {appliedSiteId && (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              <Building2 className="h-2.5 w-2.5" />
              {sites.find((s) => s.id === appliedSiteId)?.name ?? appliedSiteId}
            </span>
          )}
          {(appliedFrom || appliedTo) && (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              <Calendar className="h-2.5 w-2.5" />
              {appliedFrom || "…"} → {appliedTo || "…"}
            </span>
          )}
        </div>
      )}

      {/* Car wash KPI cards */}
      {report && <KpiSummary report={report} />}

      {/* Total Tip card — separate from car wash revenue */}
      {crewSummary && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="flex flex-wrap items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
              <Wallet className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                {t("reports.tipCard.title")}
                <span className="ml-1.5 font-normal text-amber-600/70 dark:text-amber-500/60">
                  ({formatPeriodLabel(tipPeriod)})
                </span>
              </p>
              <p className="mt-0.5 text-2xl font-bold text-amber-800 dark:text-amber-300">
                {formatRupiah(crewSummary.summary.totalPaid)}
              </p>
            </div>
            <div className="flex gap-6 text-right">
              <div>
                <p className="text-xs text-amber-600/70 dark:text-amber-500/60">{t("reports.tipCard.disbursed")}</p>
                <p className="mt-0.5 text-sm font-semibold text-amber-800 dark:text-amber-300">
                  {formatRupiah(crewSummary.summary.totalDisbursed)}
                </p>
              </div>
              <div>
                <p className="text-xs text-amber-600/70 dark:text-amber-500/60">{t("reports.tipCard.crewCount")}</p>
                <p className="mt-0.5 text-sm font-semibold text-amber-800 dark:text-amber-300">
                  {crewSummary.summary.crewCount} {t("reports.tipCard.crewCountUnit")}
                </p>
              </div>
            </div>
            <div className="hidden sm:block h-8 w-px bg-amber-200 dark:bg-amber-800/50" />
            <p className="hidden sm:block text-xs text-amber-600/60 dark:text-amber-500/50 italic">
              {t("reports.tipCard.notIncluded")}
            </p>
            <Link
              href="/reports/tips"
              className="flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200"
            >
              {t("reports.tipCard.detail")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {report && (
        <div className="space-y-6">
          {/* Bookings by status */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground">{t("reports.statusBreakdown")}</h2>
            <DataTable
              columns={statusColumns}
              data={statusEntries}
              emptyMessage={t("reports.noData")}
            />
            {statusEntries.length > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm font-semibold">
                <span>{t("reports.totalRow")}</span>
                <span>{report.bookings.total}</span>
              </div>
            )}
          </div>

          {/* Crew performance */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground">
              {t("reports.crewPerformance")}
            </h2>
            <DataTable
              columns={crewColumns}
              data={report.crew}
              emptyMessage={t("reports.noData")}
            />
          </div>
        </div>
      )}

      {/* Link to job details */}
      <div className="flex items-center justify-end">
        <Link
          href="/reports/jobs"
          className="flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          {t("reports.jobDetail.viewJobs")}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {!report && !isLoading && (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border">
          <p className="text-sm text-muted-foreground">{t("reports.noData")}</p>
        </div>
      )}
    </div>
  );
}
