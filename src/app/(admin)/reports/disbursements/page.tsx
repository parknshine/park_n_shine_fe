"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import adminApi from "@/lib/axios-admin";
import {
  useAdminTipCrewSummary,
  useAdminDisbursements,
  useCreateDisbursement,
} from "@/features/admin/hooks/use-admin-tips";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

function toCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function formatDate(iso: string): string {
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
    { label: t("reports.tabs.summary"),      href: "/reports" },
    { label: t("reports.tabs.jobs"),          href: "/reports/jobs" },
    { label: t("reports.tabs.tips"),          href: "/reports/tips" },
    { label: t("reports.tabs.disbursements"), href: "/reports/disbursements" },
    { label: "Customers",                     href: "/reports/customers" },
  ];
  return (
    <div className="flex gap-1 border-b border-border overflow-x-auto">
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

function ConfirmDisbursementModal({
  open, period, totalPending, crewCount, isLoading, onConfirm, onCancel,
}: {
  open: boolean;
  period: string;
  totalPending: number;
  crewCount: number;
  isLoading: boolean;
  onConfirm: (notes: string) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation("admin");
  const [notes, setNotes] = useState("");

  function handleConfirm() { onConfirm(notes); setNotes(""); }
  function handleCancel()  { setNotes(""); onCancel(); }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("reports.disbursements.confirmModal.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("reports.disbursements.confirmModal.period")}</span>
              <span className="font-medium font-mono">{period}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("reports.disbursements.confirmModal.crewCount")}</span>
              <span className="font-medium">
                {crewCount} {t("reports.disbursements.confirmModal.crewCountUnit")}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2">
              <span className="text-muted-foreground">{t("reports.disbursements.confirmModal.total")}</span>
              <span className="font-semibold text-foreground">{formatRupiah(totalPending)}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="disburse-notes">{t("reports.disbursements.confirmModal.notes")}</Label>
            <Input
              id="disburse-notes"
              placeholder={t("reports.disbursements.confirmModal.notesPlaceholder")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              {t("reports.disbursements.confirmModal.cancel")}
            </Button>
            <Button onClick={handleConfirm} disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  {t("reports.disbursements.confirmModal.processing")}
                </span>
              ) : (
                t("reports.disbursements.confirmModal.confirm")
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function DisbursementsPage() {
  const { t } = useTranslation("admin");
  const [period, setPeriod] = useState(toCurrentMonth);
  const [showConfirm, setShowConfirm] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);

  const { crewSummary, isLoading: isSummaryLoading } = useAdminTipCrewSummary(period);
  const { disbursements, isLoading: isDisbLoading } = useAdminDisbursements();
  const { mutate: createDisbursement, isPending: isCreating } = useCreateDisbursement();

  const totalPending = crewSummary
    ? crewSummary.crews.reduce((sum, c) => sum + c.pendingDisbursement, 0)
    : 0;
  const pendingCrewCount = crewSummary
    ? crewSummary.crews.filter((c) => c.pendingDisbursement > 0).length
    : 0;
  const hasPending = totalPending > 0;

  async function handleExportCSV(disbursementId: string, disbursementPeriod: string) {
    setExportingId(disbursementId);
    try {
      const res = await adminApi.get<Blob>(
        `/v1/admin/disbursements/${disbursementId}/export`,
        { responseType: "blob" },
      );
      const objectUrl = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `disbursement-${disbursementPeriod}.csv`;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } finally {
      setExportingId(null);
    }
  }

  function handleConfirm(notes: string) {
    createDisbursement(
      { period, notes: notes || undefined },
      { onSuccess: () => setShowConfirm(false) },
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">
          {t("reports.disbursements.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("reports.disbursements.subtitle")}
        </p>
      </div>

      <ReportTabs />

      {/* Period + action */}
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-lg border border-border bg-muted/30 px-4 py-4">
        <div className="space-y-1">
          <Label htmlFor="disb-period">{t("reports.disbursements.period")}</Label>
          <input
            id="disb-period"
            type="month"
            value={period}
            max={toCurrentMonth()}
            onChange={(e) => setPeriod(e.target.value)}
            className={cn(
              "h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring",
            )}
          />
        </div>
        <div className="flex flex-col items-end gap-1">
          <p className="text-xs text-muted-foreground">
            {t("reports.disbursements.totalPending")}{" "}
            <span className="font-semibold text-foreground">
              {isSummaryLoading ? t("reports.disbursements.loading") : formatRupiah(totalPending)}
            </span>
          </p>
          <Button
            disabled={!hasPending || isSummaryLoading}
            onClick={() => setShowConfirm(true)}
          >
            {t("reports.disbursements.createButton")}
          </Button>
        </div>
      </div>

      {/* Disbursement history */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">
          {t("reports.disbursements.history")}
        </h2>
        <div className="overflow-hidden rounded-lg border border-border">
          {isDisbLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <span className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
              {t("reports.loading")}
            </div>
          ) : disbursements.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t("reports.disbursements.noHistory")}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {t("reports.disbursements.columns.period")}
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    {t("reports.disbursements.columns.total")}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {t("reports.disbursements.columns.notes")}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {t("reports.disbursements.columns.createdAt")}
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    {t("reports.disbursements.columns.export")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {disbursements.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{d.period}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      {formatRupiah(d.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {d.notes ?? <span className="text-muted-foreground/50">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(d.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleExportCSV(d.id, d.period)}
                        disabled={exportingId === d.id}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
                      >
                        {exportingId === d.id ? (
                          <span className="h-3.5 w-3.5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                        {t("reports.exportCsv")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ConfirmDisbursementModal
        open={showConfirm}
        period={period}
        totalPending={totalPending}
        crewCount={pendingCrewCount}
        isLoading={isCreating}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
