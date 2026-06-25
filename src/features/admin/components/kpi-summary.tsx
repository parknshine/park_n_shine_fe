"use client";

import type { AdminReport } from "@/features/admin/types";
import { useTranslation } from "@/i18n";

interface KpiSummaryProps {
  report: AdminReport;
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

export function KpiSummary({ report }: KpiSummaryProps) {
  const { t } = useTranslation("admin");

  const closed = report.bookings.byStatus["CLOSED"] ?? 0;
  const cancelled = (report.bookings.byStatus["CANCELLED"] ?? 0) + (report.bookings.byStatus["EXPIRED"] ?? 0);
  const netPaid = report.revenue.totalPaid - report.revenue.totalRefunded;

  return (
    <div className="space-y-3">
      <dl className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-4">
          <dt className="text-xs font-medium text-muted-foreground">{t("reports.kpi.paid")}</dt>
          <dd className="mt-2 text-2xl font-semibold text-foreground">{formatRupiah(netPaid)}</dd>
          {report.revenue.totalRefunded > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              {formatRupiah(report.revenue.totalPaid)} &minus; <span className="text-red-500">{formatRupiah(report.revenue.totalRefunded)}</span> {t("reports.kpi.refunded").toLowerCase()}
            </p>
          )}
        </div>
        <div className="rounded-lg border border-border p-4">
          <dt className="text-xs font-medium text-muted-foreground">{t("reports.kpi.revenue")}</dt>
          <dd className="mt-2 text-2xl font-semibold text-foreground">{formatRupiah(report.revenue.totalGross)}</dd>
        </div>
        <div className="rounded-lg border border-border p-4">
          <dt className="text-xs font-medium text-muted-foreground">{t("reports.kpi.avgTurnaround")}</dt>
          <dd className="mt-2 text-2xl font-semibold text-foreground">{formatTurnaround(report.avgTurnaroundSeconds)}</dd>
        </div>
      </dl>
      <dl className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-4">
          <dt className="text-xs font-medium text-muted-foreground">{t("reports.kpi.totalBookings")}</dt>
          <dd className="mt-2 text-2xl font-semibold text-foreground">{report.bookings.total}</dd>
        </div>
        <div className="rounded-lg border border-border p-4">
          <dt className="text-xs font-medium text-muted-foreground">{t("reports.kpi.closed")}</dt>
          <dd className="mt-2 text-2xl font-semibold text-foreground">{closed}</dd>
        </div>
        <div className="rounded-lg border border-border p-4">
          <dt className="text-xs font-medium text-muted-foreground">{t("reports.kpi.cancelled")}</dt>
          <dd className="mt-2 text-2xl font-semibold text-foreground">{cancelled}</dd>
        </div>
      </dl>
    </div>
  );
}
