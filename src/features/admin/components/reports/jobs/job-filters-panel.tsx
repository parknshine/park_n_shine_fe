"use client";

import {
  SlidersHorizontal,
  Calendar,
  ArrowRight,
  Building2,
  Users,
  Search,
  X,
  Check,
  Camera,
  Phone,
  Send,
  Star,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReportBookingFilters } from "@/features/admin/hooks/use-admin-report-bookings";
import { cn } from "@/lib/utils";
import { toISODate } from "@/features/admin/utils/reports/jobs-format";

type Site = { id: string; name: string };
type Crew = { id: string; name: string };

export function JobFiltersPanel({
  t,
  isLoading,
  activeFilterCount,
  hasFilter,
  onClear,
  onApply,
  from,
  to,
  onFromChange,
  onToChange,
  allSites,
  selectedSiteId,
  onSelectedSiteIdChange,
  crew,
  selectedCrewId,
  onSelectedCrewIdChange,
  statusFilter,
  onStatusFilterChange,
  paymentStatusFilter,
  onPaymentStatusFilterChange,
  searchInput,
  onSearchInputChange,
  appliedSearch,
  hasRatingFilter,
  onHasRatingFilterChange,
  hasPhotosFilter,
  onHasPhotosFilterChange,
  hasPhoneFilter,
  onHasPhoneFilterChange,
  notificationSentFilter,
  onNotificationSentFilterChange,
}: {
  t: (key: string) => string;
  isLoading: boolean;
  activeFilterCount: number;
  hasFilter: boolean;
  onClear: () => void;
  onApply: () => void;
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  allSites: Site[];
  selectedSiteId: string;
  onSelectedSiteIdChange: (v: string) => void;
  crew: Crew[];
  selectedCrewId: string;
  onSelectedCrewIdChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  paymentStatusFilter: "" | "true" | "false" | "needs_refund";
  onPaymentStatusFilterChange: (v: "" | "true" | "false" | "needs_refund") => void;
  searchInput: string;
  onSearchInputChange: (v: string) => void;
  appliedSearch: ReportBookingFilters["search"];
  hasRatingFilter: "" | "true" | "false";
  onHasRatingFilterChange: (v: "" | "true" | "false") => void;
  hasPhotosFilter: boolean;
  onHasPhotosFilterChange: (v: boolean) => void;
  hasPhoneFilter: "" | "true" | "false";
  onHasPhoneFilterChange: (v: "" | "true" | "false") => void;
  notificationSentFilter: "" | "true" | "false";
  onNotificationSentFilterChange: (v: "" | "true" | "false") => void;
}) {
  return (
    <div className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
      <div className='flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3'>
        <div className='flex items-center gap-2'>
          <SlidersHorizontal className='h-3.5 w-3.5 text-primary' />
          <span className='text-xs font-semibold uppercase tracking-widest text-foreground'>
            Filters
          </span>
          {activeFilterCount > 0 && (
            <span className='flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white'>
              {activeFilterCount}
            </span>
          )}
        </div>
        {hasFilter && (
          <button
            onClick={onClear}
            className='flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive'
          >
            <X className='h-3 w-3' /> Reset all
          </button>
        )}
      </div>

      <div className='divide-y divide-border'>
        <div className='grid grid-cols-1 divide-y sm:grid-cols-2 lg:grid-cols-5 sm:divide-x sm:divide-y-0 divide-border'>
          <div className='space-y-2 px-4 py-3'>
            <div className='flex items-center gap-1.5'>
              <Calendar className='h-3 w-3 text-muted-foreground' />
              <span className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground'>
                {t("reports.fromLabel")} — {t("reports.toLabel")}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='date'
                value={from}
                max={to || toISODate(new Date())}
                onChange={(e) => onFromChange(e.target.value)}
                className={cn(
                  "h-8 min-w-0 flex-1 rounded-lg border px-2.5 text-xs bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
                  from
                    ? "border-primary/40 text-foreground"
                    : "border-border text-muted-foreground",
                )}
              />
              <ArrowRight className='h-3 w-3 shrink-0 text-muted-foreground' />
              <input
                type='date'
                value={to}
                min={from}
                max={toISODate(new Date())}
                onChange={(e) => onToChange(e.target.value)}
                className={cn(
                  "h-8 min-w-0 flex-1 rounded-lg border px-2.5 text-xs bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
                  to
                    ? "border-primary/40 text-foreground"
                    : "border-border text-muted-foreground",
                )}
              />
            </div>
          </div>

          <div className='space-y-2 px-4 py-3'>
            <div className='flex items-center gap-1.5'>
              <Building2 className='h-3 w-3 text-muted-foreground' />
              <span className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground'>
                {t("reports.jobDetail.filterMall")}
              </span>
            </div>
            <Select
              value={selectedSiteId || "__all__"}
              onValueChange={(v) =>
                onSelectedSiteIdChange(v === "__all__" ? "" : v)
              }
            >
              <SelectTrigger
                className={cn(
                  "h-8 w-full text-xs",
                  selectedSiteId ? "border-primary/40 font-medium" : "",
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='__all__'>
                  {t("reports.jobDetail.filterMallAll")}
                </SelectItem>
                {allSites.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2 px-4 py-3'>
            <div className='flex items-center gap-1.5'>
              <Users className='h-3 w-3 text-muted-foreground' />
              <span className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground'>
                {t("reports.jobDetail.filterCrew")}
              </span>
            </div>
            <Select
              value={selectedCrewId || "__all__"}
              onValueChange={(v) =>
                onSelectedCrewIdChange(v === "__all__" ? "" : v)
              }
            >
              <SelectTrigger
                className={cn(
                  "h-8 w-full text-xs",
                  selectedCrewId ? "border-primary/40 font-medium" : "",
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='__all__'>
                  {t("reports.jobDetail.filterCrewAll")}
                </SelectItem>
                {crew.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2 px-4 py-3'>
            <div className='flex items-center gap-1.5'>
              <SlidersHorizontal className='h-3 w-3 text-muted-foreground' />
              <span className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground'>
                Status
              </span>
            </div>
            <Select
              value={statusFilter || "__all__"}
              onValueChange={(v) => onStatusFilterChange(v === "__all__" ? "" : v)}
            >
              <SelectTrigger
                className={cn(
                  "h-8 w-full text-xs",
                  statusFilter ? "border-primary/40 font-medium" : "",
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='__all__'>All Status</SelectItem>
                <SelectItem value='CLOSED'>Closed</SelectItem>
                <SelectItem value='CANCELLED'>Canceled</SelectItem>
                <SelectItem value='EXPIRED'>Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2 px-4 py-3'>
            <div className='flex items-center gap-1.5'>
              <Banknote className='h-3 w-3 text-muted-foreground' />
              <span className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground'>
                Payment Status
              </span>
            </div>
            <Select
              value={paymentStatusFilter || "__all__"}
              onValueChange={(v) =>
                onPaymentStatusFilterChange(
                  v === "__all__"
                    ? ""
                    : (v as "true" | "false" | "needs_refund"),
                )
              }
            >
              <SelectTrigger
                className={cn(
                  "h-8 w-full text-xs",
                  paymentStatusFilter ? "border-primary/40 font-medium" : "",
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='__all__'>All Payment Status</SelectItem>
                <SelectItem value='false'>Paid</SelectItem>
                <SelectItem value='needs_refund'>Perlu Refund</SelectItem>
                <SelectItem value='true'>Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='px-4 py-3'>
          <div className='flex items-center gap-1.5'>
            <Search className='h-3 w-3 text-muted-foreground' />
            <span className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground'>
              Booking ID
            </span>
          </div>
          <div className='mt-2 relative'>
            <Input
              value={searchInput}
              onChange={(e) => onSearchInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onApply();
              }}
              placeholder='Cari Booking ID...'
              prefix={<Search />}
              className={cn(
                "w-full sm:w-72",
                appliedSearch ? "border-primary/50" : "",
              )}
            />
            {searchInput && (
              <button
                type='button'
                onClick={() => onSearchInputChange("")}
                className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
              >
                <X className='h-3.5 w-3.5' />
              </button>
            )}
          </div>
        </div>

        <div className='flex flex-wrap items-center justify-between gap-3 px-4 py-3'>
          <div className='flex flex-wrap items-center gap-2'>
            <div className='flex overflow-hidden rounded-lg border border-border text-xs'>
              {(["", "true", "false"] as const).map((val) => {
                const labels: Record<string, string> = {
                  "": t("reports.jobDetail.filterRatingAll"),
                  true: t("reports.jobDetail.filterRatingYes"),
                  false: t("reports.jobDetail.filterRatingNo"),
                };
                return (
                  <button
                    key={val}
                    type='button'
                    onClick={() => onHasRatingFilterChange(val)}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1.5 font-medium transition-colors",
                      hasRatingFilter === val
                        ? "bg-primary text-white"
                        : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                      val !== "" && "border-l border-border",
                    )}
                  >
                    {val === "true" && <Star className='h-2.5 w-2.5' />}
                    {labels[val]}
                  </button>
                );
              })}
            </div>

            <button
              type='button'
              onClick={() => onHasPhotosFilterChange(!hasPhotosFilter)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all",
                hasPhotosFilter
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Camera className='h-3 w-3' />
              {t("reports.jobDetail.filterHasPhotos")}
            </button>

            <div className='flex overflow-hidden rounded-lg border border-border text-xs'>
              {(["", "true", "false"] as const).map((val) => {
                const labels: Record<string, string> = {
                  "": t("reports.jobDetail.filterHasPhoneAll"),
                  true: t("reports.jobDetail.filterHasPhoneYes"),
                  false: t("reports.jobDetail.filterHasPhoneNo"),
                };
                return (
                  <button
                    key={val}
                    type='button'
                    onClick={() => onHasPhoneFilterChange(val)}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1.5 font-medium transition-colors",
                      hasPhoneFilter === val
                        ? "bg-primary text-white"
                        : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                      val !== "" && "border-l border-border",
                    )}
                  >
                    {val === "true" && <Phone className='h-2.5 w-2.5' />}
                    {labels[val]}
                  </button>
                );
              })}
            </div>

            <div className='flex overflow-hidden rounded-lg border border-border text-xs'>
              {(["", "true", "false"] as const).map((val) => {
                const labels: Record<string, string> = {
                  "": t("reports.jobDetail.filterNotificationSentAll"),
                  true: t("reports.jobDetail.filterNotificationSentDone"),
                  false: t("reports.jobDetail.filterNotificationSentPending"),
                };
                return (
                  <button
                    key={val}
                    type='button'
                    onClick={() => onNotificationSentFilterChange(val)}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1.5 font-medium transition-colors",
                      notificationSentFilter === val
                        ? "bg-primary text-white"
                        : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                      val !== "" && "border-l border-border",
                    )}
                  >
                    {val === "true" && <Send className='h-2.5 w-2.5' />}
                    {labels[val]}
                  </button>
                );
              })}
            </div>
          </div>

          <Button onClick={onApply} disabled={isLoading} className='gap-2 px-5'>
            {isLoading ? (
              <span className='flex items-center gap-2'>
                <span className='h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white' />
                {t("reports.loading")}
              </span>
            ) : (
              <>
                {t("reports.apply")}
                {activeFilterCount > 0 && (
                  <span className='flex h-4 min-w-4 items-center justify-center rounded-full bg-white/20 px-1 text-[10px] font-bold'>
                    {activeFilterCount}
                  </span>
                )}
                <Check className='h-3.5 w-3.5' />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
