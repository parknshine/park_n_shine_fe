"use client";

import { useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KpiSummary } from "@/features/admin/components";
import { useAdminReport } from "@/features/admin/hooks";
import { useUIStore } from "@/store/ui-store";
import type { AdminReport } from "@/features/admin/types";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
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

function exportToCSV(report: AdminReport, from: string, to: string) {
  const lines: string[] = [
    `Park & Shine Report,${from},${to}`,
    "",
    "Summary",
    `Total Bookings,${report.bookings.total}`,
    `Closed,${report.bookings.byStatus["CLOSED"] ?? 0}`,
    `Revenue,${report.revenue.totalGross}`,
    `Avg Turnaround (s),${report.avgTurnaroundSeconds ?? ""}`,
    "",
    "Bookings by Status",
    "Status,Count",
    ...Object.entries(report.bookings.byStatus).map(([s, c]) => `${s},${c}`),
    "",
    "Crew Performance",
    "Name,Jobs,Stale,Needs Help,Reliability (%),Avg Turnaround (s),Avg Rating,Est. Revenue (IDR)",
    ...report.crew.map((c) =>
      `${c.crewName},${c.jobsCompleted},${c.staleCount},${c.needsHelpCount},${c.reliabilityScore ?? ""},${c.avgTurnaroundSeconds ?? ""},${c.avgRating ?? ""},${c.estimatedRevenue}`
    ),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `park-n-shine-report-${from}-${to}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const activeSiteId = useUIStore((s) => s.activeSiteId);
  const { t } = useTranslation("admin");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");

  const { report, isLoading } = useAdminReport(
    activeSiteId ?? "",
    appliedFrom,
    appliedTo
  );

  const hasFilter = appliedFrom !== "" || appliedTo !== "";

  function handleApply() {
    setAppliedFrom(from);
    setAppliedTo(to);
  }

  function handleClear() {
    setFrom("");
    setTo("");
    setAppliedFrom("");
    setAppliedTo("");
  }

  if (!activeSiteId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">{t("common.selectSite")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">{t("reports.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("reports.subtitle")}</p>
      </div>

      {/* Date controls */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label htmlFor="from-date">{t("reports.fromLabel")}</Label>
          <Input
            id="from-date"
            type="date"
            value={from}
            max={to}
            onChange={(e) => setFrom(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="to-date">{t("reports.toLabel")}</Label>
          <Input
            id="to-date"
            type="date"
            value={to}
            min={from}
            max={toISODate(new Date())}
            onChange={(e) => setTo(e.target.value)}
            className="w-40"
          />
        </div>
        <Button onClick={handleApply} disabled={isLoading}>
          {isLoading ? t("reports.loading") : t("reports.apply")}
        </Button>
        {hasFilter && (
          <Button variant="ghost" onClick={handleClear} disabled={isLoading}>
            <X className="mr-1.5 h-3.5 w-3.5" />
            {t("reports.clearFilter")}
          </Button>
        )}
        <Button
          variant="outline"
          disabled={!report || isLoading}
          onClick={() => report && exportToCSV(report, appliedFrom, appliedTo)}
        >
          <Download className="mr-2 h-4 w-4" />
          {t("reports.exportCsv")}
        </Button>
      </div>

      {/* KPI cards */}
      {report && <KpiSummary report={report} />}

      {report && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Bookings by status */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground">
              {t("reports.statusBreakdown")}
            </h2>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      {t("reports.columns.status")}
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      {t("reports.columns.count")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {Object.entries(report.bookings.byStatus).length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-6 text-center text-muted-foreground">
                        {t("reports.noData")}
                      </td>
                    </tr>
                  ) : (
                    Object.entries(report.bookings.byStatus).map(([status, count]) => (
                      <tr key={status} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-mono text-xs uppercase">{status}</td>
                        <td className="px-4 py-3 text-right">{count}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="border-t border-border bg-muted/50 font-semibold">
                  <tr>
                    <td className="px-4 py-3">{t("reports.totalRow")}</td>
                    <td className="px-4 py-3 text-right">{report.bookings.total}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Crew performance */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground">
              {t("reports.crewPerformance")}
            </h2>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      {t("reports.crew.name")}
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      {t("reports.crew.jobs")}
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      {t("reports.crew.stale")}
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      {t("reports.crew.needsHelp")}
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      {t("reports.crew.reliability")}
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      {t("reports.crew.avgTurnaround")}
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      {t("reports.crew.avgRating")}
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      {t("reports.crew.revenue")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {report.crew.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">
                        {t("reports.noData")}
                      </td>
                    </tr>
                  ) : (
                    report.crew.map((member) => (
                      <tr key={member.crewId} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{member.crewName}</td>
                        <td className="px-4 py-3 text-right">{member.jobsCompleted}</td>
                        <td className={cn(
                          "px-4 py-3 text-right font-mono text-xs",
                          member.staleCount > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
                        )}>
                          {member.staleCount}
                        </td>
                        <td className={cn(
                          "px-4 py-3 text-right font-mono text-xs",
                          member.needsHelpCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                        )}>
                          {member.needsHelpCount}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {member.reliabilityScore == null ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                                <div
                                  className={cn(
                                    "h-full rounded-full",
                                    member.reliabilityScore >= 80
                                      ? "bg-green-500"
                                      : member.reliabilityScore >= 60
                                        ? "bg-amber-500"
                                        : "bg-red-500"
                                  )}
                                  style={{ width: `${member.reliabilityScore}%` }}
                                />
                              </div>
                              <span className={cn(
                                "font-mono text-xs",
                                member.reliabilityScore >= 80
                                  ? "text-green-600 dark:text-green-400"
                                  : member.reliabilityScore >= 60
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-red-600 dark:text-red-400"
                              )}>
                                {member.reliabilityScore.toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs">
                          {formatTurnaround(member.avgTurnaroundSeconds)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {member.avgRating == null ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <span className="font-mono text-xs">
                              ★ {member.avgRating.toFixed(1)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatRupiah(member.estimatedRevenue)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!report && !isLoading && (
        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground">{t("reports.noData")}</p>
        </div>
      )}
    </div>
  );
}
