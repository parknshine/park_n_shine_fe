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

  const metrics = [
    { labelKey: "reports.kpi.totalBookings", value: report.bookings.total },
    { labelKey: "reports.kpi.closed", value: closed },
    { labelKey: "reports.kpi.revenue", value: formatRupiah(report.revenue.totalGross) },
    { labelKey: "reports.kpi.avgTurnaround", value: formatTurnaround(report.avgTurnaroundSeconds) },
    { labelKey: "reports.kpi.cancelled", value: cancelled },
  ];

  return (
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {metrics.map((metric) => (
        <div key={metric.labelKey} className="rounded-lg border border-border p-4">
          <dt className="text-xs font-medium text-muted-foreground">
            {t(metric.labelKey)}
          </dt>
          <dd className="mt-2 text-2xl font-semibold text-foreground">
            {metric.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
