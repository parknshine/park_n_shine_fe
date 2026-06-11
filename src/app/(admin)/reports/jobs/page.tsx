"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowRight, Check, Star, Camera, Users, Calendar, Building2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { useAdminReportBookings, useAdminCrew, useSiteSelection } from "@/features/admin/hooks";
import { SiteSelector } from "@/features/admin/components";
import type { ReportBookingRow, ReportPhotoAsset } from "@/features/admin/types";
import type { ReportBookingFilters } from "@/features/admin/hooks/use-admin-report-bookings";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

const BOOKING_STATUSES = [
  "CLOSED", "CANCELLED", "EXPIRED", "STALE",
  "NEEDS_HELP", "IN_PROGRESS", "LOCATED", "ASSIGNED", "PAID",
];

const BEFORE_TYPES = new Set(["BEFORE_FRONT", "BEFORE_BACK", "BEFORE_LEFT", "BEFORE_RIGHT"]);
const AFTER_TYPES = new Set(["AFTER_PHOTO", "AFTER_FRONT", "AFTER_BACK", "AFTER_LEFT", "AFTER_RIGHT"]);

const ZOOM_STEP = 0.5;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 4;

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PhotoLightboxOverlay({
  photos,
  index,
  onClose,
  onNavigate,
}: {
  photos: ReportPhotoAsset[];
  index: number;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);
  const photo = photos[index];
  const src = photo.url ?? photo.storageKey;

  const zoomIn = useCallback(() => setZoom((z) => Math.min(+(z + ZOOM_STEP).toFixed(1), ZOOM_MAX)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(+(z - ZOOM_STEP).toFixed(1), ZOOM_MIN)), []);
  const resetZoom = useCallback(() => setZoom(1), []);

  function navigate(delta: number) {
    setZoom(1);
    onNavigate((index + delta + photos.length) % photos.length);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
      if (e.key === "0") resetZoom();
    }
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [index, onClose, zoomIn, zoomOut, resetZoom]);

  return createPortal(
    <div
      className="fixed inset-0 z-200 flex flex-col"
      style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(6px)" }}
    >
      <div className="flex shrink-0 items-center justify-between px-4 py-3">
        <span className="text-xs font-mono text-white/50">
          {index + 1}/{photos.length} — {photo.type.replaceAll(/_/g, " ")}
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1">
            <button onClick={zoomOut} disabled={zoom <= ZOOM_MIN}
              className="p-0.5 text-white/80 hover:text-white disabled:opacity-30 transition-colors">
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="w-12 text-center text-xs font-mono text-white/80">
              {Math.round(zoom * 100)}%
            </span>
            <button onClick={zoomIn} disabled={zoom >= ZOOM_MAX}
              className="p-0.5 text-white/80 hover:text-white disabled:opacity-30 transition-colors">
              <ZoomIn className="h-4 w-4" />
            </button>
            <button onClick={resetZoom}
              className="ml-1 p-0.5 text-white/60 hover:text-white transition-colors">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
          <button onClick={onClose}
            className="rounded-lg bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden"
        onClick={onClose}
      >
        {photos.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); navigate(-1); }}
            className="absolute left-4 z-10 rounded-full bg-black/40 p-2 text-white/80 hover:bg-black/70 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        <div
          className="overflow-auto"
          style={{ maxWidth: "90vw", maxHeight: "calc(100vh - 130px)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            ref={imgRef}
            key={src}
            src={src}
            alt={photo.type}
            style={{
              width: `${zoom * 100}%`,
              maxWidth: zoom <= 1 ? "100%" : "none",
              display: "block",
              transition: "width 0.15s ease",
            }}
            className="rounded-lg shadow-2xl"
          />
        </div>

        {photos.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); navigate(1); }}
            className="absolute right-4 z-10 rounded-full bg-black/40 p-2 text-white/80 hover:bg-black/70 hover:text-white transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex shrink-0 items-center justify-center gap-1.5 py-3">
          {photos.map((_, i) => (
            <button key={i} onClick={() => { setZoom(1); onNavigate(i); }}
              className={cn("rounded-full transition-all",
                i === index ? "h-2 w-2 bg-white" : "h-1.5 w-1.5 bg-white/30 hover:bg-white/60"
              )}
            />
          ))}
        </div>
      )}

      <p className="shrink-0 pb-2 text-center text-[10px] text-white/25">
        ← → navigate · +/- zoom · 0 reset · Esc close
      </p>
    </div>,
    document.body,
  );
}

function PhotoGridModal({
  open,
  onClose,
  photos,
  t,
}: {
  open: boolean;
  onClose: () => void;
  photos: ReportPhotoAsset[];
  t: (key: string) => string;
}) {
  const before = photos.filter((p) => BEFORE_TYPES.has(p.type));
  const after = photos.filter((p) => AFTER_TYPES.has(p.type));
  const other = photos.filter((p) => !BEFORE_TYPES.has(p.type) && !AFTER_TYPES.has(p.type));
  const viewable = [...before, ...after, ...other];
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("reports.jobDetail.photos")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto max-h-[60vh]">
            {before.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("reports.jobDetail.beforePhotos")}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {before.map((p) => (
                    <button key={p.storageKey} type="button"
                      onClick={() => setLightboxIndex(viewable.indexOf(p))}
                      className="block w-full cursor-zoom-in overflow-hidden rounded-lg border border-border hover:border-primary/60 transition-colors">
                      <img src={p.url ?? p.storageKey} alt={p.type}
                        className="aspect-square w-full object-cover hover:opacity-80 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {after.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("reports.jobDetail.afterPhotos")}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {after.map((p) => (
                    <button key={p.storageKey} type="button"
                      onClick={() => setLightboxIndex(viewable.indexOf(p))}
                      className="block w-full cursor-zoom-in overflow-hidden rounded-lg border border-border hover:border-primary/60 transition-colors">
                      <img src={p.url ?? p.storageKey} alt={p.type}
                        className="aspect-square w-full object-cover hover:opacity-80 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {other.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("reports.jobDetail.otherPhotos")}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {other.map((p) => (
                    <button key={p.storageKey} type="button"
                      onClick={() => setLightboxIndex(viewable.indexOf(p))}
                      className="block w-full cursor-zoom-in overflow-hidden rounded-lg border border-border hover:border-primary/60 transition-colors">
                      <img src={p.url ?? p.storageKey} alt={p.type}
                        className="aspect-square w-full object-cover hover:opacity-80 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {before.length === 0 && after.length === 0 && other.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">—</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {lightboxIndex !== null && (
        <PhotoLightboxOverlay
          photos={viewable}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}

function PhotosCell({ photos, t }: { photos: ReportPhotoAsset[]; t: (key: string) => string }) {
  const [showPhotos, setShowPhotos] = useState(false);
  const photoCount = photos.length;

  if (photoCount === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setShowPhotos(true); }}
        className="text-xs text-primary underline underline-offset-2 hover:no-underline"
      >
        {t("reports.jobDetail.photosCount").replace("{{count}}", photoCount.toString())}
      </button>
      <PhotoGridModal
        open={showPhotos}
        onClose={() => setShowPhotos(false)}
        photos={photos}
        t={t}
      />
    </>
  );
}

function ReportTabs() {
  const pathname = usePathname();
  const { t } = useTranslation("admin");
  const tabs = [
    { label: t("reports.tabs.summary"), href: "/reports" },
    { label: t("reports.tabs.jobs"), href: "/reports/jobs" },
    { label: "Tips", href: "/reports/tips" },
  ];
  return (
    <div className="flex gap-1 border-b border-border">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors",
            pathname === tab.href
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

export default function ReportJobsPage() {
  const { sites: allSites, siteId, setSiteId } = useSiteSelection();
  const { t } = useTranslation("admin");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");

  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [selectedCrewId, setSelectedCrewId] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [hasRatingFilter, setHasRatingFilter] = useState<"" | "true" | "false">("");
  const [hasPhotosFilter, setHasPhotosFilter] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState<ReportBookingFilters>({});
  const [appliedSiteId, setAppliedSiteId] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const effectiveSiteId = appliedSiteId === undefined ? undefined : appliedSiteId || undefined;

  const { crew } = useAdminCrew();

  const { bookings: jobRows, total: jobTotal, isLoading } = useAdminReportBookings(
    effectiveSiteId,
    appliedFrom,
    appliedTo,
    appliedFilters,
    page,
    pageSize,
  );

  function handleApply() {
    setPage(1);
    setAppliedFrom(from);
    setAppliedTo(to);
    setAppliedSiteId(selectedSiteId === "__all__" ? "" : selectedSiteId || undefined);
    setAppliedFilters({
      crewId: selectedCrewId || undefined,
      statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      hasRating: hasRatingFilter === "true" ? true : hasRatingFilter === "false" ? false : undefined,
      hasPhotos: hasPhotosFilter || undefined,
    });
  }

  function handleClear() {
    setPage(1);
    setFrom("");
    setTo("");
    setAppliedFrom("");
    setAppliedTo("");
    setSelectedSiteId("");
    setAppliedSiteId(undefined);
    setSelectedCrewId("");
    setSelectedStatuses([]);
    setHasRatingFilter("");
    setHasPhotosFilter(false);
    setAppliedFilters({});
  }

  function toggleStatus(status: string) {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  }

  const hasFilter =
    appliedSiteId !== undefined ||
    appliedFrom !== "" ||
    appliedTo !== "" ||
    !!appliedFilters.crewId ||
    (appliedFilters.statuses?.length ?? 0) > 0 ||
    appliedFilters.hasRating !== undefined ||
    appliedFilters.hasPhotos;

  if (allSites.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">{t("common.noSites")}</p>
        <Link href="/sites" className="text-sm font-medium text-primary hover:underline">
          {t("common.noSitesLink")}
        </Link>
      </div>
    );
  }

  const activeFilterCount = [
    appliedSiteId !== undefined,
    from || to,
    selectedCrewId,
    hasRatingFilter !== "",
    hasPhotosFilter,
    selectedStatuses.length > 0,
  ].filter(Boolean).length;

  const selectedCrewName = crew.find((c) => c.id === selectedCrewId)?.name;
  const selectedSiteName = appliedSiteId ? allSites.find((s) => s.id === appliedSiteId)?.name : null;

  const columns: ColumnDef<ReportBookingRow>[] = [
    {
      accessorKey: "createdAt",
      header: t("reports.jobDetail.date"),
      cell: ({ row }) => (
        <span className="text-xs whitespace-nowrap">{formatDate(row.original.createdAt)}</span>
      ),
    },
    {
      accessorKey: "siteName",
      header: t("reports.jobDetail.mall"),
      cell: ({ row }) => (
        <span className="text-xs">
          {row.original.siteName ?? <span className="text-muted-foreground">{t("reports.jobDetail.noMall")}</span>}
        </span>
      ),
    },
    {
      accessorKey: "slot",
      header: t("reports.jobDetail.slot"),
      cell: ({ row }) => (
        <span className="text-xs font-mono">
          {row.original.slot ?? <span className="text-muted-foreground">{t("reports.jobDetail.noSlot")}</span>}
        </span>
      ),
    },
    {
      accessorKey: "crewName",
      header: t("reports.jobDetail.crew"),
      cell: ({ row }) => (
        <span className="text-xs">{row.original.crewName ?? "—"}</span>
      ),
    },
    {
      accessorKey: "status",
      header: t("reports.jobDetail.status"),
      cell: ({ row }) => (
        <span className="font-mono text-xs uppercase">{row.original.status}</span>
      ),
    },
    {
      accessorKey: "price",
      header: t("reports.jobDetail.price"),
      meta: { align: "right" },
      cell: ({ row }) => (
        <span className="text-xs font-mono">{formatRupiah(row.original.price)}</span>
      ),
    },
    {
      id: "locateTime",
      header: t("reports.jobDetail.locateTime"),
      meta: { align: "right" },
      cell: ({ row }) => (
        <span className="text-xs font-mono text-muted-foreground">
          {formatTurnaround(row.original.duration.locateSeconds)}
        </span>
      ),
    },
    {
      id: "washTime",
      header: t("reports.jobDetail.washTime"),
      meta: { align: "right" },
      cell: ({ row }) => (
        <span className="text-xs font-mono text-muted-foreground">
          {formatTurnaround(row.original.duration.washSeconds)}
        </span>
      ),
    },
    {
      id: "totalTime",
      header: t("reports.jobDetail.totalTime"),
      meta: { align: "right" },
      cell: ({ row }) => (
        <span className="text-xs font-mono">
          {formatTurnaround(row.original.duration.totalJobSeconds)}
        </span>
      ),
    },
    {
      accessorKey: "rating",
      header: t("reports.jobDetail.rating"),
      meta: { align: "right" },
      cell: ({ row }) => (
        <span className="text-xs">
          {row.original.rating != null ? (
            <span className="font-mono inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /> {row.original.rating}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </span>
      ),
    },
    {
      accessorKey: "ratingNote",
      header: t("reports.jobDetail.review"),
      cell: ({ row }) => (
        <span className="text-xs max-w-[160px] inline-block truncate align-middle" title={row.original.ratingNote ?? ""}>
          {row.original.ratingNote ? (
            <span className="italic text-muted-foreground">&ldquo;{row.original.ratingNote}&rdquo;</span>
          ) : (
            <span className="text-muted-foreground">{t("reports.jobDetail.noReview")}</span>
          )}
        </span>
      ),
    },
    {
      id: "photos",
      header: t("reports.jobDetail.photos"),
      meta: { align: "right" },
      cell: ({ row }) => <PhotosCell photos={row.original.photos} t={t} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t("reports.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("reports.jobDetail.subtitle")}</p>
        </div>
        {/* <SiteSelector sites={allSites} value={siteId} onChange={setSiteId} /> */}
      </div>

      <ReportTabs />

      {/* Filter panel */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/40">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-foreground">
              Filters
            </span>
            {activeFilterCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </div>
          {hasFilter && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="h-3 w-3" />
              Reset all
            </button>
          )}
        </div>

        <div className="divide-y divide-border">
          <div className="grid grid-cols-1 gap-0 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {t("reports.fromLabel")} — {t("reports.toLabel")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={from}
                  max={to || toISODate(new Date())}
                  onChange={(e) => setFrom(e.target.value)}
                  className={cn(
                    "h-8 flex-1 min-w-0 rounded-lg border px-2.5 text-xs bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
                    from ? "border-primary/40 text-foreground" : "border-border text-muted-foreground"
                  )}
                />
                <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                <input
                  type="date"
                  value={to}
                  min={from}
                  max={toISODate(new Date())}
                  onChange={(e) => setTo(e.target.value)}
                  className={cn(
                    "h-8 flex-1 min-w-0 rounded-lg border px-2.5 text-xs bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
                    to ? "border-primary/40 text-foreground" : "border-border text-muted-foreground"
                  )}
                />
              </div>
            </div>

            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <Building2 className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {t("reports.jobDetail.filterMall")}
                </span>
              </div>
              <Select
                value={selectedSiteId || "__all__"}
                onValueChange={(v) => setSelectedSiteId(v === "__all__" ? "" : v)}
              >
                <SelectTrigger className={cn(
                  "h-8 w-full text-xs",
                  selectedSiteId ? "border-primary/40 font-medium" : ""
                )}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">
                    {t("reports.jobDetail.filterMallAll")}
                  </SelectItem>
                  {allSites.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {t("reports.jobDetail.filterCrew")}
                </span>
              </div>
              <Select
                value={selectedCrewId || "__all__"}
                onValueChange={(v) => setSelectedCrewId(v === "__all__" ? "" : v)}
              >
                <SelectTrigger className={cn(
                  "h-8 w-full text-xs",
                  selectedCrewId ? "border-primary/40 font-medium" : ""
                )}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">{t("reports.jobDetail.filterCrewAll")}</SelectItem>
                  {crew.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="px-4 py-3 space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t("reports.jobDetail.filterStatus")}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {BOOKING_STATUSES.map((status) => {
                const isActive = selectedStatuses.includes(status);
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => toggleStatus(status)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-all select-none",
                      isActive
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground hover:border-primary/30"
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", isActive ? "bg-primary-foreground/60" : "bg-muted-foreground/40")} />
                    {status.replaceAll("_", "\u200B_")}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-lg border border-border overflow-hidden text-xs">
                {(["", "true", "false"] as const).map((val) => {
                  const labels: Record<string, string> = {
                    "": t("reports.jobDetail.filterRatingAll"),
                    "true": t("reports.jobDetail.filterRatingYes"),
                    "false": t("reports.jobDetail.filterRatingNo"),
                  };
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setHasRatingFilter(val)}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1.5 transition-colors font-medium",
                        hasRatingFilter === val
                          ? "bg-primary text-white"
                          : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                        val !== "" && "border-l border-border"
                      )}
                    >
                      {val === "true" && <Star className="h-2.5 w-2.5" />}
                      {labels[val]}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setHasPhotosFilter((v) => !v)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all",
                  hasPhotosFilter
                    ? "bg-primary border-primary text-white"
                    : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Camera className="h-3 w-3" />
                {t("reports.jobDetail.filterHasPhotos")}
              </button>
            </div>

            <Button
              onClick={handleApply}
              disabled={isLoading}
              className="gap-2 px-5"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  {t("reports.loading")}
                </span>
              ) : (
                <>
                  {t("reports.apply")}
                  {activeFilterCount > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white/20 px-1 text-[10px] font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                  <Check className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilter && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Applied:</span>
          {appliedSiteId && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary">
              <Building2 className="h-2.5 w-2.5" />
              {selectedSiteName ?? appliedSiteId}
            </span>
          )}
          {(appliedFrom || appliedTo) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary">
              <Calendar className="h-2.5 w-2.5" />
              {appliedFrom || "…"} → {appliedTo || "…"}
            </span>
          )}
          {appliedFilters.crewId && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary">
              <Users className="h-2.5 w-2.5" />
              {selectedCrewName ?? appliedFilters.crewId}
            </span>
          )}
          {(appliedFilters.statuses ?? []).map((s) => (
            <span key={s} className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary">
              {s}
            </span>
          ))}
          {appliedFilters.hasRating === true && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary">
              <Star className="h-2.5 w-2.5" />
              {t("reports.jobDetail.filterRatingYes")}
            </span>
          )}
          {appliedFilters.hasRating === false && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary">
              {t("reports.jobDetail.filterRatingNo")}
            </span>
          )}
          {appliedFilters.hasPhotos && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary">
              <Camera className="h-2.5 w-2.5" />
              {t("reports.jobDetail.filterHasPhotos")}
            </span>
          )}
        </div>
      )}

      {/* Data table */}
      <DataTable
        columns={columns}
        data={jobRows}
        isLoading={isLoading}
        emptyMessage={t("reports.jobDetail.noData")}
        totalCount={jobTotal}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onPageSizeChange={(v) => { setPageSize(v); setPage(1); }}
        resultsLabel={(start, end, total) => (
          <>
            Showing{" "}
            <span className="font-semibold text-foreground">{start}–{end}</span>
            {" "}of{" "}
            <span className="font-semibold text-foreground">{total}</span>
            {" "}results
          </>
        )}
      />
    </div>
  );
}
