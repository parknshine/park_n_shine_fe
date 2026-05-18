import type { DailySiteReport } from "@/features/admin/types";

interface KpiSummaryProps {
  report: DailySiteReport;
}

export function KpiSummary({ report }: KpiSummaryProps) {
  const metrics = [
    { label: "admin.reports.totalBookings", value: report.totalBookings },
    {
      label: "admin.reports.completionRate",
      value: `${report.completionRate}%`,
    },
    { label: "admin.reports.slaHitRate", value: `${report.slaHitRate}%` },
    { label: "admin.reports.averageRating", value: report.averageRating ?? "-" },
    { label: "admin.reports.revenue", value: report.revenue },
  ];

  return (
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-lg border border-border p-4">
          <dt className="text-xs font-medium text-muted-foreground">
            {metric.label}
          </dt>
          <dd className="mt-2 text-2xl font-semibold text-foreground">
            {metric.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
