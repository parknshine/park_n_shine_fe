"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KpiSummary } from "@/features/admin/components";
import { useAdminReport } from "@/features/admin/hooks";
import { useUIStore } from "@/store/ui-store";
import type { DailyBreakdown } from "@/features/admin/types";
import { useTranslation } from "@/i18n";

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function exportToCSV(breakdown: DailyBreakdown[], from: string, to: string) {
  const header = "Tanggal,Bookings,Completed,SLA%,Avg Rating,Revenue";
  const rows = breakdown.map((d) =>
    [
      d.date,
      d.totalBookings,
      d.completed,
      `${d.slaHitRate}%`,
      d.averageRating ?? "-",
      d.revenue,
    ].join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
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

  const [from, setFrom] = useState(() => toISODate(new Date(Date.now() - 7 * 86400_000)));
  const [to, setTo] = useState(() => toISODate(new Date()));
  const [appliedFrom, setAppliedFrom] = useState(() => toISODate(new Date(Date.now() - 7 * 86400_000)));
  const [appliedTo, setAppliedTo] = useState(() => toISODate(new Date()));

  const { report, isLoading } = useAdminReport(
    activeSiteId ?? "",
    appliedFrom,
    appliedTo
  );

  function handleApply() {
    setAppliedFrom(from);
    setAppliedTo(to);
  }

  if (!activeSiteId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">{t("common.selectSite")}</p>
      </div>
    );
  }

  const columns = [
    t("reports.columns.date"),
    t("reports.columns.bookings"),
    t("reports.columns.completed"),
    t("reports.columns.sla"),
    t("reports.columns.avgRating"),
    t("reports.columns.revenue"),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">{t("reports.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("reports.subtitle")}</p>
      </div>

      {/* Controls */}
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
        <Button
          variant="outline"
          disabled={!report || isLoading}
          onClick={() =>
            report && exportToCSV(report.breakdown, appliedFrom, appliedTo)
          }
        >
          <Download className="mr-2 h-4 w-4" />
          {t("reports.exportCsv")}
        </Button>
      </div>

      {/* KPI summary */}
      {report && <KpiSummary report={report.summary} />}

      {/* Daily breakdown table */}
      {report && report.breakdown.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left font-medium text-muted-foreground"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {report.breakdown.map((row) => (
                <tr key={row.date} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{row.date}</td>
                  <td className="px-4 py-3">{row.totalBookings}</td>
                  <td className="px-4 py-3">{row.completed}</td>
                  <td className="px-4 py-3">{row.slaHitRate}%</td>
                  <td className="px-4 py-3">{row.averageRating ?? "—"}</td>
                  <td className="px-4 py-3">{formatRupiah(row.revenue)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-border bg-muted/50 font-semibold">
              <tr>
                <td className="px-4 py-3">{t("reports.totalRow")}</td>
                <td className="px-4 py-3">
                  {report.breakdown.reduce((s, d) => s + d.totalBookings, 0)}
                </td>
                <td className="px-4 py-3">
                  {report.breakdown.reduce((s, d) => s + d.completed, 0)}
                </td>
                <td className="px-4 py-3">
                  {Math.round(
                    report.breakdown.reduce((s, d) => s + d.slaHitRate, 0) /
                      report.breakdown.length
                  )}
                  %
                </td>
                <td className="px-4 py-3">
                  {(() => {
                    const ratedDays = report.breakdown.filter((d) => d.averageRating != null);
                    if (ratedDays.length === 0) return "—";
                    return parseFloat(
                      (ratedDays.reduce((s, d) => s + (d.averageRating ?? 0), 0) / ratedDays.length).toFixed(1)
                    );
                  })()}
                </td>
                <td className="px-4 py-3">
                  {formatRupiah(
                    report.breakdown.reduce((s, d) => s + d.revenue, 0)
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {report && report.breakdown.length === 0 && (
        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground">{t("reports.noData")}</p>
        </div>
      )}
    </div>
  );
}
