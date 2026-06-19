"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, SlidersHorizontal, Users, ArrowRight, X, Building2, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AuditLogTable, BookingDetailDrawer } from "@/features/admin/components";
import { useAuditLog, useAuditActors, useSiteSelection } from "@/features/admin/hooks";
import type { AuditEntry } from "@/features/admin/types";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

const ACTION_VALUES = ["all", "status_override", "refund", "reassign", "crew.job_rejected"] as const;
type ActionValue = typeof ACTION_VALUES[number];

const ACTION_LABEL_KEYS: Record<ActionValue, string> = {
  all: "audit.actions.all",
  status_override: "audit.actions.status_override",
  refund: "audit.actions.refund",
  reassign: "audit.actions.reassign",
  "crew.job_rejected": "audit.actions.crew.job_rejected",
};

const DEFAULT_PAGE_SIZE = 25;

export default function AuditPage() {
  const { sites } = useSiteSelection();
  const { t } = useTranslation("admin");

  // Pending filter state (not yet applied)
  const [pendingSiteId, setPendingSiteId] = useState("__all__");
  const [pendingAction, setPendingAction] = useState<ActionValue>("all");
  const [pendingActorId, setPendingActorId] = useState("__all__");
  const [pendingFrom, setPendingFrom] = useState("");
  const [pendingTo, setPendingTo] = useState("");
  const [pendingSearch, setPendingSearch] = useState("");

  // Applied filter state (sent to API)
  const [appliedSiteId, setAppliedSiteId] = useState("__all__");
  const [appliedAction, setAppliedAction] = useState("all");
  const [appliedActorId, setAppliedActorId] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const { actors } = useAuditActors(appliedSiteId);
  const { entries, totalCount, isLoading, isFetching } = useAuditLog(appliedSiteId, {
    action: appliedAction,
    actor: appliedActorId || undefined,
    from: appliedFrom || undefined,
    to: appliedTo || undefined,
    search: appliedSearch || undefined,
    page,
    pageSize,
  });

  function handleApply() {
    setAppliedSiteId(pendingSiteId);
    setAppliedAction(pendingAction);
    setAppliedActorId(pendingActorId === "__all__" ? "" : pendingActorId);
    setAppliedFrom(pendingFrom);
    setAppliedTo(pendingTo);
    setAppliedSearch(pendingSearch.trim());
    setPage(1);
  }

  function handleReset() {
    setPendingSiteId("__all__");
    setPendingAction("all");
    setPendingActorId("__all__");
    setPendingFrom("");
    setPendingTo("");
    setPendingSearch("");
    setAppliedSiteId("__all__");
    setAppliedAction("all");
    setAppliedActorId("");
    setAppliedFrom("");
    setAppliedTo("");
    setAppliedSearch("");
    setPage(1);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
  }

  function handlePageSizeChange(newSize: number) {
    setPageSize(newSize);
    setPage(1);
  }

  const appliedSiteName = sites.find((s) => s.id === appliedSiteId)?.name;
  const activeFilterCount = [
    appliedSiteId !== "__all__",
    appliedAction !== "all",
    !!appliedActorId,
    !!appliedFrom || !!appliedTo,
    !!appliedSearch,
  ].filter(Boolean).length;

  const selectedActorName = actors.find((a) => a.actor === appliedActorId)?.label;

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
    <div className='space-y-6'>
      <div>
        <h1 className='text-xl font-bold text-foreground'>{t("audit.title")}</h1>
        <p className='text-sm text-muted-foreground'>{t("audit.subtitle")}</p>
      </div>

      {/* Filter Panel */}
      <div className='rounded-xl border border-border bg-card shadow-sm'>
        <div className='flex items-center justify-between border-b border-border px-4 py-3 bg-muted/40'>
          <div className='flex items-center gap-2'>
            <SlidersHorizontal className='h-4 w-4 text-muted-foreground' />
            <span className='text-sm font-semibold text-foreground'>
              {t("audit.filterLabel")}
            </span>
            {activeFilterCount > 0 && (
              <span className='rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground'>
                {activeFilterCount}
              </span>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={handleReset}
              className='text-xs text-muted-foreground hover:text-foreground'
            >
              {t("audit.resetFilter")}
            </button>
          )}
        </div>

        <div className='grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3'>
          {/* Mall / Site */}
          <div className='space-y-1.5'>
            <div className='flex items-center gap-1.5'>
              <Building2 className='h-3.5 w-3.5 text-muted-foreground' />
              <span className='text-xs font-medium text-muted-foreground'>
                {t("audit.siteLabel")}
              </span>
            </div>
            <Select value={pendingSiteId} onValueChange={setPendingSiteId}>
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t("audit.actions.all")}</SelectItem>
                {sites.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Filter */}
          <div className='space-y-1.5'>
            <div className='flex items-center gap-1.5'>
              <SlidersHorizontal className='h-3.5 w-3.5 text-muted-foreground' />
              <span className='text-xs font-medium text-muted-foreground'>
                {t("audit.filterLabel")}
              </span>
            </div>
            <Select
              value={pendingAction}
              onValueChange={(v) => setPendingAction(v as ActionValue)}
            >
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTION_VALUES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(ACTION_LABEL_KEYS[value] as "audit.actions.all")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actor Filter */}
          <div className='space-y-1.5'>
            <div className='flex items-center gap-1.5'>
              <Users className='h-3.5 w-3.5 text-muted-foreground' />
              <span className='text-xs font-medium text-muted-foreground'>
                {t("audit.actorLabel")}
              </span>
            </div>
            <Select value={pendingActorId} onValueChange={setPendingActorId}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder={t("audit.actions.all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='__all__'>
                  {t("audit.actions.all")}
                </SelectItem>
                {actors.map((a) => (
                  <SelectItem key={a.actor} value={a.actor}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className='space-y-1.5'>
            <div className='flex items-center gap-1.5'>
              <Calendar className='h-3.5 w-3.5 text-muted-foreground' />
              <span className='text-xs font-medium text-muted-foreground'>
                Period
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='date'
                value={pendingFrom}
                max={pendingTo || undefined}
                onChange={(e) => setPendingFrom(e.target.value)}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                  pendingFrom
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background",
                )}
              />
              <ArrowRight className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
              <input
                type='date'
                value={pendingTo}
                min={pendingFrom || undefined}
                onChange={(e) => setPendingTo(e.target.value)}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                  pendingTo
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background",
                )}
              />
            </div>
          </div>

          {/* Booking ID Search */}
          <div className='space-y-1.5'>
            <div className='flex items-center gap-1.5'>
              <Search className='h-3.5 w-3.5 text-muted-foreground' />
              <span className='text-xs font-medium text-muted-foreground'>
                Search
              </span>
            </div>
            <input
              type='text'
              value={pendingSearch}
              onChange={(e) => setPendingSearch(e.target.value)}
              placeholder='Booking ID or plate...'
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                pendingSearch
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background",
              )}
            />
          </div>
        </div>

        <div className='flex justify-end border-t border-border px-4 py-3'>
          <Button onClick={handleApply} disabled={isFetching}>
            {t("audit.applyFilter")}
          </Button>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className='flex flex-wrap gap-2'>
          {appliedSiteId !== "__all__" && (
            <span className='inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary'>
              {appliedSiteName ?? appliedSiteId}
              <button onClick={() => { setPendingSiteId("__all__"); setAppliedSiteId("__all__"); setPage(1); }}>
                <X className='h-3 w-3' />
              </button>
            </span>
          )}
          {appliedAction !== "all" && (
            <span className='inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary'>
              {appliedAction === "crew.job_rejected"
                ? "Job Rejected by Crew"
                : appliedAction.replace("_", " ")}
              <button onClick={() => { setPendingAction("all"); setAppliedAction("all"); setPage(1); }}>
                <X className='h-3 w-3' />
              </button>
            </span>
          )}
          {appliedActorId && (
            <span className='inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary'>
              {selectedActorName ?? appliedActorId}
              <button onClick={() => { setPendingActorId("__all__"); setAppliedActorId(""); setPage(1); }}>
                <X className='h-3 w-3' />
              </button>
            </span>
          )}
          {(appliedFrom || appliedTo) && (
            <span className='inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary'>
              {appliedFrom || "…"} → {appliedTo || "…"}
              <button onClick={() => { setPendingFrom(""); setPendingTo(""); setAppliedFrom(""); setAppliedTo(""); setPage(1); }}>
                <X className='h-3 w-3' />
              </button>
            </span>
          )}
          {appliedSearch && (
            <span className='inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary'>
              &ldquo;{appliedSearch}&rdquo;
              <button onClick={() => { setPendingSearch(""); setAppliedSearch(""); setPage(1); }}>
                <X className='h-3 w-3' />
              </button>
            </span>
          )}
        </div>
      )}

      {isLoading ? (
        <p className='text-sm text-muted-foreground'>{t("audit.loading")}</p>
      ) : (
        <div className='relative'>
          {isFetching && (
            <p className='absolute right-0 top-0 text-xs text-muted-foreground'>
              {t("audit.loading")}
            </p>
          )}
          <AuditLogTable
            entries={entries}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onRowClick={(e: AuditEntry) => setSelectedBookingId(e.bookingId)}
          />
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
