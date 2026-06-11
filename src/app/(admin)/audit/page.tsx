"use client";

import { useState } from "react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuditLogTable, BookingDetailDrawer, SiteSelector } from "@/features/admin/components";
import { useAuditLog, useSiteSelection } from "@/features/admin/hooks";
import type { AuditEntry } from "@/features/admin/types";
import { useTranslation } from "@/i18n";

const ACTION_VALUES = ["all", "status_override", "refund", "reassign"] as const;

export default function AuditPage() {
  const { sites, siteId, setSiteId } = useSiteSelection();
  const [action, setAction] = useState("all");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const { t } = useTranslation("admin");

  const { entries, isLoading, isFetching } = useAuditLog(siteId ?? "", { action });

  function handleRowClick(entry: AuditEntry) {
    setSelectedBookingId(entry.bookingId);
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t("audit.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("audit.subtitle")}</p>
        </div>
        <SiteSelector sites={sites} value={siteId} onChange={setSiteId} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label htmlFor="action-filter">{t("audit.filterLabel")}</Label>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger id="action-filter" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTION_VALUES.map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`audit.actions.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("audit.loading")}</p>
      ) : (
        <div className="relative">
          {isFetching && (
            <p className="absolute right-0 top-0 text-xs text-muted-foreground">
              {t("audit.loading")}
            </p>
          )}
          <AuditLogTable entries={entries} onRowClick={handleRowClick} />
        </div>
      )}

      <BookingDetailDrawer
        bookingId={selectedBookingId}
        onClose={() => setSelectedBookingId(null)}
        onActionSuccess={() => setSelectedBookingId(null)}
      />
    </div>
  );
}
