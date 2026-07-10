import { Calendar, Building2, Users, Star, Banknote, Search, Camera } from "lucide-react";
import type { ReportBookingFilters } from "@/features/admin/hooks/use-admin-report-bookings";

export function JobFilterChips({
  t,
  appliedSiteId,
  selectedSiteName,
  appliedFrom,
  appliedTo,
  selectedCrewName,
  appliedFilters,
}: {
  t: (key: string) => string;
  appliedSiteId: string | undefined;
  selectedSiteName: string | null | undefined;
  appliedFrom: string;
  appliedTo: string;
  selectedCrewName: string | undefined;
  appliedFilters: ReportBookingFilters;
}) {
  const chipClass =
    "inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary";

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <span className='text-xs font-medium text-muted-foreground'>
        Applied:
      </span>
      {appliedSiteId && (
        <span className={chipClass}>
          <Building2 className='h-2.5 w-2.5' />
          {selectedSiteName ?? appliedSiteId}
        </span>
      )}
      {(appliedFrom || appliedTo) && (
        <span className={chipClass}>
          <Calendar className='h-2.5 w-2.5' />
          {appliedFrom || "…"} → {appliedTo || "…"}
        </span>
      )}
      {appliedFilters.crewId && (
        <span className={chipClass}>
          <Users className='h-2.5 w-2.5' />
          {selectedCrewName ?? appliedFilters.crewId}
        </span>
      )}
      {appliedFilters.refunded === true && (
        <span className={chipClass}>
          <Banknote className='h-2.5 w-2.5' />
          Refunded
        </span>
      )}
      {appliedFilters.refunded === false && (
        <span className={chipClass}>
          <Banknote className='h-2.5 w-2.5' />
          Paid
        </span>
      )}
      {appliedFilters.needsRefund === true && (
        <span className={chipClass}>
          <Banknote className='h-2.5 w-2.5' />
          Perlu Refund
        </span>
      )}
      {appliedFilters.hasRating === true && (
        <span className={chipClass}>
          <Star className='h-2.5 w-2.5' />
          {t("reports.jobDetail.filterRatingYes")}
        </span>
      )}
      {appliedFilters.hasRating === false && (
        <span className={chipClass}>{t("reports.jobDetail.filterRatingNo")}</span>
      )}
      {appliedFilters.hasPhotos && (
        <span className={chipClass}>
          <Camera className='h-2.5 w-2.5' />
          {t("reports.jobDetail.filterHasPhotos")}
        </span>
      )}
      {appliedFilters.search && (
        <span className={chipClass}>
          <Search className='h-2.5 w-2.5' />
          &ldquo;{appliedFilters.search}&rdquo;
        </span>
      )}
    </div>
  );
}
