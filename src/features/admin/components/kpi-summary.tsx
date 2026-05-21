"use client";

import type { DailySiteReport } from "@/features/admin/types";
import { useTranslation } from "@/i18n";

interface KpiSummaryProps {
  report: DailySiteReport;
}

export function KpiSummary({ report }: KpiSummaryProps) {
  const { t } = useTranslation("admin");

  const metrics = [
    { labelKey: "reports.kpi.totalBookings", value: report.totalBookings },
    { labelKey: "reports.kpi.completionRate", value: `${report.completionRate}%` },
    { labelKey: "reports.kpi.slaHitRate", value: `${report.slaHitRate}%` },
    { labelKey: "reports.kpi.averageRating", value: report.averageRating ?? "-" },
    { labelKey: "reports.kpi.revenue", value: report.revenue },
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
