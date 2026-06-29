"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios-admin";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowRight,
  Check,
  Star,
  Camera,
  Users,
  Calendar,
  Building2,
  Clock,
  Eye,
  Hash,
  Search,
  Undo2,
  FileDown,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  useAdminReportBookings,
  useAdminCrew,
  useSiteSelection,
} from "@/features/admin/hooks";
import type {
  ReportBookingRow,
  ReportPhotoAsset,
} from "@/features/admin/types";
import type { ReportBookingFilters, ReportBookingsResponse } from "@/features/admin/hooks/use-admin-report-bookings";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";

const BEFORE_TYPES = new Set([
  "BEFORE_FRONT",
  "BEFORE_BACK",
  "BEFORE_LEFT",
  "BEFORE_RIGHT",
]);
const AFTER_TYPES = new Set([
  "AFTER_PHOTO",
  "AFTER_FRONT",
  "AFTER_BACK",
  "AFTER_LEFT",
  "AFTER_RIGHT",
]);

const ZOOM_STEP = 0.5;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 4;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const STATUS_STYLES: Record<string, string> = {
  CLOSED:
    "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400",
  REFUNDED: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400",
  EXPIRED:
    "bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
  STALE:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-500",
  NEEDS_HELP: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  IN_PROGRESS:
    "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  LOCATED:
    "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  ASSIGNED:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400",
  PAID: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
};

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

function rowsToSheetData(rows: import("@/features/admin/types").ReportBookingRow[]) {
  return rows.map((r) => ({
    "Booking ID": r.id,
    "Date": formatDate(r.createdAt),
    "Site": r.siteName ?? "—",
    "Slot": r.slot ?? "—",
    "Crew": r.crewName ?? "—",
    "Status": r.status,
    "Price (IDR)": r.price,
    "Payment Method": r.paymentMethod ?? "—",
    "Paid At": r.paidAt ? formatDate(r.paidAt) : "—",
    "Refunded (IDR)": r.refundedAmount,
    "Rating": r.rating ?? "—",
    "Rating Note": r.ratingNote ?? "—",
  }));
}

function computeTotals(rows: import("@/features/admin/types").ReportBookingRow[]) {
  return {
    totalPrice: rows.reduce((sum, r) => sum + (r.refundedAmount > 0 || r.status === "CANCELLED" || r.status === "EXPIRED" ? 0 : r.price), 0),
    totalRefunded: rows.reduce((sum, r) => sum + r.refundedAmount, 0),
  };
}

function downloadExcel(rows: import("@/features/admin/types").ReportBookingRow[], filename: string) {
  const data = rowsToSheetData(rows);
  const { totalPrice, totalRefunded } = computeTotals(rows);
  data.push({
    "Booking ID": "TOTAL",
    "Date": "",
    "Site": "",
    "Slot": "",
    "Crew": "",
    "Status": "",
    "Price (IDR)": totalPrice,
    "Payment Method": "",
    "Paid At": "",
    "Refunded (IDR)": totalRefunded,
    "Rating": "",
    "Rating Note": "",
  });
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Jobs");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

function downloadCSV(rows: import("@/features/admin/types").ReportBookingRow[], filename: string) {
  function csvField(val: string | number | null | undefined): string {
    if (val === null || val === undefined || val === "—") return "";
    return `"${String(val).replace(/"/g, '""')}"`;
  }
  const { totalPrice, totalRefunded } = computeTotals(rows);
  const header = "Booking ID,Date,Site,Slot,Crew,Status,Price (IDR),Payment Method,Paid At,Refunded (IDR),Rating,Rating Note\n";
  const dataRows = rows.map((r) => [
    csvField(r.id),
    csvField(formatDate(r.createdAt)),
    csvField(r.siteName),
    csvField(r.slot),
    csvField(r.crewName),
    csvField(r.status),
    r.price,
    csvField(r.paymentMethod),
    csvField(r.paidAt ? formatDate(r.paidAt) : null),
    r.refundedAmount,
    csvField(r.rating != null ? String(r.rating) : null),
    csvField(r.ratingNote),
  ].join(",")).join("\n");
  const totalRow = `"TOTAL",,,,,,${totalPrice},,,,${totalRefunded},,`;
  const csv = header + dataRows + "\n" + totalRow;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Photo Lightbox ───────────────────────────────────────────────────────────

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

  const zoomIn = useCallback(
    () => setZoom((z) => Math.min(+(z + ZOOM_STEP).toFixed(1), ZOOM_MAX)),
    [],
  );
  const zoomOut = useCallback(
    () => setZoom((z) => Math.max(+(z - ZOOM_STEP).toFixed(1), ZOOM_MIN)),
    [],
  );
  const resetZoom = useCallback(() => setZoom(1), []);

  function navigate(delta: number) {
    setZoom(1);
    onNavigate((index + delta + photos.length) % photos.length);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
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
      className='fixed inset-0 z-200 flex flex-col'
      style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(6px)" }}
    >
      <div className='flex shrink-0 items-center justify-between px-4 py-3'>
        <span className='font-mono text-xs text-white/50'>
          {index + 1}/{photos.length} — {photo.type.replaceAll("_", " ")}
        </span>
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1'>
            <button
              onClick={zoomOut}
              disabled={zoom <= ZOOM_MIN}
              className='p-0.5 text-white/80 transition-colors hover:text-white disabled:opacity-30'
            >
              <ZoomOut className='h-4 w-4' />
            </button>
            <span className='w-12 text-center font-mono text-xs text-white/80'>
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={zoomIn}
              disabled={zoom >= ZOOM_MAX}
              className='p-0.5 text-white/80 transition-colors hover:text-white disabled:opacity-30'
            >
              <ZoomIn className='h-4 w-4' />
            </button>
            <button
              onClick={resetZoom}
              className='ml-1 p-0.5 text-white/60 transition-colors hover:text-white'
            >
              <RotateCcw className='h-3.5 w-3.5' />
            </button>
          </div>
          <button
            onClick={onClose}
            className='rounded-lg bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white'
          >
            <X className='h-4 w-4' />
          </button>
        </div>
      </div>

      <div
        className='relative flex flex-1 items-center justify-center overflow-hidden'
        onClick={onClose}
      >
        {photos.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(-1);
            }}
            className='absolute left-4 z-10 rounded-full bg-black/40 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white'
          >
            <ChevronLeft className='h-6 w-6' />
          </button>
        )}
        <div
          className='overflow-auto'
          style={{ maxWidth: "90vw", maxHeight: "calc(100vh - 130px)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            ref={imgRef}
            key={src}
            src={src}
            alt={photo.type}
            unoptimized
            width={1200}
            height={800}
            style={{
              width: `${zoom * 100}%`,
              maxWidth: zoom <= 1 ? "100%" : "none",
              height: "auto",
              display: "block",
              transition: "width 0.15s ease",
            }}
            className='rounded-lg shadow-2xl'
          />
        </div>
        {photos.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(1);
            }}
            className='absolute right-4 z-10 rounded-full bg-black/40 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white'
          >
            <ChevronRight className='h-6 w-6' />
          </button>
        )}
      </div>

      {photos.length > 1 && (
        <div className='flex shrink-0 items-center justify-center gap-1.5 py-3'>
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setZoom(1);
                onNavigate(i);
              }}
              className={cn(
                "rounded-full transition-all",
                i === index
                  ? "h-2 w-2 bg-white"
                  : "h-1.5 w-1.5 bg-white/30 hover:bg-white/60",
              )}
            />
          ))}
        </div>
      )}
      <p className='shrink-0 pb-2 text-center text-[10px] text-white/25'>
        ← → navigate · +/- zoom · 0 reset · Esc close
      </p>
    </div>,
    document.body,
  );
}

// ─── Photo Section ────────────────────────────────────────────────────────────

function PhotoSection({
  photos,
  label,
  viewable,
  onPhotoClick,
}: {
  photos: ReportPhotoAsset[];
  label: string;
  viewable: ReportPhotoAsset[];
  onPhotoClick: (index: number) => void;
}) {
  if (photos.length === 0) return null;
  return (
    <div className='space-y-2'>
      <p className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground'>
        {label}
      </p>
      <div className='grid grid-cols-4 gap-2'>
        {photos.map((p) => (
          <button
            key={p.storageKey}
            type='button'
            onClick={() => onPhotoClick(viewable.indexOf(p))}
            className='relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-lg border border-border transition-colors hover:border-primary/60'
          >
            <Image
              src={p.url ?? p.storageKey}
              alt={p.type}
              fill
              unoptimized
              className='object-cover transition-opacity hover:opacity-80'
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Job Detail Modal ─────────────────────────────────────────────────────────

function JobDetailModal({
  open,
  onClose,
  row,
  t,
}: {
  open: boolean;
  onClose: () => void;
  row: ReportBookingRow | null;
  t: (key: string) => string;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [confirmRefund, setConfirmRefund] = useState(false);
  const queryClient = useQueryClient();

  const refundMutation = useMutation({
    mutationFn: (bookingId: string) =>
      api.post(`/v1/admin/bookings/${bookingId}/refund`, {
        reasonCode: "admin_manual",
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "report-bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "report"] });
      setConfirmRefund(false);
    },
  });

  if (!row) return null;

  const canRefund = !!row.paidAt && row.refundedAmount === 0;
  const isRefunded = row.refundedAmount > 0;

  const before = row.photos.filter((p) => BEFORE_TYPES.has(p.type));
  const after = row.photos.filter((p) => AFTER_TYPES.has(p.type));
  const other = row.photos.filter(
    (p) => !BEFORE_TYPES.has(p.type) && !AFTER_TYPES.has(p.type),
  );
  const viewable = [...before, ...after, ...other];

  const effStatus = row.status === "CANCELLED" && row.refundedAmount > 0 ? "REFUNDED" : row.status;
  const statusStyle = STATUS_STYLES[effStatus] ?? "bg-muted text-muted-foreground";

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) {
            if (lightboxIndex !== null) {
              setLightboxIndex(null);
              return;
            }
            setConfirmRefund(false);
            onClose();
          }
        }}
      >
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center justify-between pr-6'>
              <span className='text-sm font-semibold text-muted-foreground'>
                {formatDate(row.createdAt)}
              </span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase",
                  statusStyle,
                )}
              >
                {effStatus}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-6 overflow-y-auto max-h-[65vh] pr-1 pt-1'>
            {/* Job Info */}
            <div className='rounded-lg border border-border bg-muted/30 divide-y divide-border'>
              <div className='flex items-center justify-between gap-4 px-4 py-3'>
                <span className='flex items-center gap-2 text-xs text-muted-foreground'>
                  <Hash className='h-3.5 w-3.5 shrink-0' />
                  Booking ID
                </span>
                <span className='break-all text-right font-mono text-xs font-medium'>
                  {row.id}
                </span>
              </div>
              <div className='flex items-center justify-between px-4 py-3'>
                <span className='flex items-center gap-2 text-xs text-muted-foreground'>
                  <Building2 className='h-3.5 w-3.5 shrink-0' />
                  {t("reports.jobDetail.mall")}
                </span>
                <span className='text-xs font-medium'>
                  {row.siteName ?? "—"}
                </span>
              </div>
              <div className='flex items-center justify-between px-4 py-3'>
                <span className='text-xs text-muted-foreground'>
                  {t("reports.jobDetail.slot")}
                </span>
                <span className='font-mono text-xs font-medium'>
                  {row.slot ?? "—"}
                </span>
              </div>
              <div className='flex items-center justify-between px-4 py-3'>
                <span className='flex items-center gap-2 text-xs text-muted-foreground'>
                  <Users className='h-3.5 w-3.5 shrink-0' />
                  {t("reports.jobDetail.crew")}
                </span>
                <span className='text-xs font-medium'>
                  {row.crewName ?? "—"}
                </span>
              </div>
              <div className='flex items-center justify-between px-4 py-3'>
                <span className='text-xs text-muted-foreground'>
                  {t("reports.jobDetail.price")}
                </span>
                <span className='font-mono text-xs font-semibold'>
                  {formatRupiah(row.price)}
                </span>
              </div>
            </div>

            {/* Refund */}
            {(canRefund || isRefunded) && (
              <div className={cn(
                "rounded-lg border px-4 py-3",
                isRefunded
                  ? "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20"
                  : "border-border bg-muted/30",
              )}>
                {isRefunded ? (
                  <div className='flex items-center gap-2'>
                    <Undo2 className='h-3.5 w-3.5 text-red-500' />
                    <span className='text-xs font-medium text-red-600 dark:text-red-400'>
                      Refunded {formatRupiah(row.refundedAmount)}
                    </span>
                  </div>
                ) : confirmRefund ? (
                  <div className='space-y-2'>
                    <p className='text-xs text-muted-foreground'>
                      Refund <span className='font-semibold text-foreground'>{formatRupiah(row.price)}</span> ke customer
                      {row.paymentMethod && <span className='ml-1'>via <span className='font-medium'>{row.paymentMethod}</span></span>}.
                    </p>
                    <div className='flex gap-2'>
                      <Button
                        size='sm'
                        variant='destructive'
                        disabled={refundMutation.isPending}
                        onClick={() => refundMutation.mutate(row.id)}
                        className='h-7 text-xs'
                      >
                        {refundMutation.isPending ? "Processing..." : "Ya, tandai refund"}
                      </Button>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => setConfirmRefund(false)}
                        className='h-7 text-xs'
                      >
                        Batal
                      </Button>
                    </div>
                    {refundMutation.isError && (
                      <p className='text-xs text-destructive'>Gagal. Coba lagi.</p>
                    )}
                  </div>
                ) : (
                  <button
                    type='button'
                    onClick={() => setConfirmRefund(true)}
                    className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors'
                  >
                    <Undo2 className='h-3.5 w-3.5' />
                    Proses Refund
                  </button>
                )}
              </div>
            )}

            {/* Duration */}
            <div className='space-y-3'>
              <p className='flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground'>
                <Clock className='h-3 w-3' />
                Duration
              </p>
              <div className='grid grid-cols-3 gap-3'>
                {[
                  {
                    label: t("reports.jobDetail.locateTime"),
                    value: row.duration.locateSeconds,
                  },
                  {
                    label: t("reports.jobDetail.washTime"),
                    value: row.duration.washSeconds,
                  },
                  {
                    label: t("reports.jobDetail.totalTime"),
                    value: row.duration.totalJobSeconds,
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className='rounded-lg border border-border bg-muted/30 px-3 py-4 text-center'
                  >
                    <p className='font-mono text-base font-bold'>
                      {formatTurnaround(value)}
                    </p>
                    <p className='mt-1 text-[10px] text-muted-foreground'>
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating & Review */}
            <div className='space-y-3'>
              <p className='flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground'>
                <Star className='h-3 w-3' />
                {t("reports.jobDetail.rating")}
              </p>
              <div className='space-y-3 rounded-lg border border-border bg-muted/30 px-4 py-4'>
                {row.rating != null ? (
                  <div className='flex items-center gap-2'>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < row.rating!
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground/30",
                        )}
                      />
                    ))}
                    <span className='ml-1 font-mono text-sm font-semibold'>
                      {row.rating}
                    </span>
                  </div>
                ) : (
                  <p className='text-xs text-muted-foreground'>—</p>
                )}
                {row.ratingNote && (
                  <p className='text-xs italic text-muted-foreground'>
                    &ldquo;{row.ratingNote}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Photos */}
            {viewable.length > 0 && (
              <div className='space-y-3'>
                <p className='flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground'>
                  <Camera className='h-3 w-3' />
                  {t("reports.jobDetail.photos")} ({viewable.length})
                </p>
                <div className='space-y-4'>
                  <PhotoSection
                    photos={before}
                    label={t("reports.jobDetail.beforePhotos")}
                    viewable={viewable}
                    onPhotoClick={setLightboxIndex}
                  />
                  <PhotoSection
                    photos={after}
                    label={t("reports.jobDetail.afterPhotos")}
                    viewable={viewable}
                    onPhotoClick={setLightboxIndex}
                  />
                  <PhotoSection
                    photos={other}
                    label={t("reports.jobDetail.otherPhotos")}
                    viewable={viewable}
                    onPhotoClick={setLightboxIndex}
                  />
                </div>
              </div>
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

// ─── Report Tabs ──────────────────────────────────────────────────────────────

function ReportTabs() {
  const pathname = usePathname();
  const { t } = useTranslation("admin");
  const tabs = [
    { label: t("reports.tabs.summary"), href: "/reports" },
    { label: t("reports.tabs.jobs"), href: "/reports/jobs" },
    { label: "Tips", href: "/reports/tips" },
    { label: "Disbursements", href: "/reports/disbursements" },
    { label: "Customers", href: "/reports/customers" },
  ];
  return (
    <div className='flex gap-1 border-b border-border'>
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors",
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportJobsPage() {
  const { sites: allSites } = useSiteSelection();
  const { t } = useTranslation("admin");
  const setDrawerBookingId = useUIStore((s) => s.setDrawerBookingId);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");

  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [selectedCrewId, setSelectedCrewId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [hasRatingFilter, setHasRatingFilter] = useState<"" | "true" | "false">(
    "",
  );
  const [hasPhotosFilter, setHasPhotosFilter] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const [appliedFilters, setAppliedFilters] = useState<ReportBookingFilters>(
    {},
  );
  const [appliedSiteId, setAppliedSiteId] = useState<string | undefined>(
    undefined,
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [detailRow, setDetailRow] = useState<ReportBookingRow | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const effectiveSiteId =
    appliedSiteId === undefined ? undefined : appliedSiteId || undefined;
  const { crew } = useAdminCrew();

  const {
    bookings: jobRows,
    total: jobTotal,
    isLoading,
  } = useAdminReportBookings(
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
    setAppliedSiteId(
      selectedSiteId === "__all__" ? "" : selectedSiteId || undefined,
    );
    setAppliedFilters({
      crewId: selectedCrewId || undefined,
      statuses: statusFilter && statusFilter !== "REFUNDED" ? [statusFilter] : undefined,
      refunded: statusFilter === "REFUNDED" ? true : undefined,
      hasRating:
        hasRatingFilter === "true"
          ? true
          : hasRatingFilter === "false"
            ? false
            : undefined,
      hasPhotos: hasPhotosFilter || undefined,
      search: searchInput.trim() || undefined,
    });
  }

  function handleExportCurrent(format: "excel" | "csv") {
    const fn = format === "csv" ? downloadCSV : downloadExcel;
    fn(jobRows, `park-n-shine-jobs-page${page}`);
  }

  async function handleExportAll(format: "excel" | "csv") {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (effectiveSiteId) params.set("siteId", effectiveSiteId);
      if (appliedFrom) params.set("from", appliedFrom);
      if (appliedTo) params.set("to", appliedTo);
      if (appliedFilters.crewId) params.set("crewId", appliedFilters.crewId);
      if (appliedFilters.statuses?.length) params.set("statuses", appliedFilters.statuses.join(","));
      if (appliedFilters.hasRating !== undefined) params.set("hasRating", String(appliedFilters.hasRating));
      if (appliedFilters.hasPhotos !== undefined) params.set("hasPhotos", String(appliedFilters.hasPhotos));
      if (appliedFilters.search) params.set("search", appliedFilters.search);
      params.set("page", "1");
      params.set("limit", String(jobTotal || 10000));
      const res = await api.get<ReportBookingsResponse>(`/v1/admin/reports/bookings?${params}`);
      const fn = format === "csv" ? downloadCSV : downloadExcel;
      fn(res.data.rows, `park-n-shine-jobs-all`);
    } finally {
      setIsExporting(false);
    }
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
    setStatusFilter("");
    setHasRatingFilter("");
    setHasPhotosFilter(false);
    setSearchInput("");
    setAppliedFilters({});
  }

  const hasFilter =
    appliedSiteId !== undefined ||
    appliedFrom !== "" ||
    appliedTo !== "" ||
    !!appliedFilters.crewId ||
    !!appliedFilters.statuses?.length ||
    appliedFilters.hasRating !== undefined ||
    appliedFilters.hasPhotos ||
    !!appliedFilters.search;

  if (allSites.length === 0) {
    return (
      <div className='flex h-full flex-col items-center justify-center gap-2'>
        <p className='text-muted-foreground'>{t("common.noSites")}</p>
        <Link
          href='/sites'
          className='text-sm font-medium text-primary hover:underline'
        >
          {t("common.noSitesLink")}
        </Link>
      </div>
    );
  }

  const activeFilterCount = [
    appliedSiteId !== undefined,
    from || to,
    selectedCrewId,
    statusFilter !== "",
    hasRatingFilter !== "",
    hasPhotosFilter,
    searchInput.trim() !== "",
  ].filter(Boolean).length;

  const selectedCrewName = crew.find((c) => c.id === selectedCrewId)?.name;
  const selectedSiteName = appliedSiteId
    ? allSites.find((s) => s.id === appliedSiteId)?.name
    : null;

  const columns: ColumnDef<ReportBookingRow>[] = [
    {
      accessorKey: "id",
      header: "Booking ID",
      cell: ({ row }) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDrawerBookingId(row.original.id);
          }}
          className='font-mono text-xs text-blue-600 underline-offset-2 hover:underline'
        >
          {row.original.id}
        </button>
      ),
    },
    {
      accessorKey: "createdAt",
      header: t("reports.jobDetail.date"),
      cell: ({ row }) => (
        <span className='whitespace-nowrap text-xs'>
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "location",
      header: t("reports.jobDetail.slot"),
      cell: ({ row }) => (
        <div className='min-w-[80px]'>
          <span className='font-mono text-xs font-medium'>
            {row.original.slot ?? (
              <span className='text-muted-foreground'>—</span>
            )}
          </span>
          {row.original.siteName && (
            <p className='text-[10px] text-muted-foreground'>
              {row.original.siteName}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "crewName",
      header: t("reports.jobDetail.crew"),
      cell: ({ row }) => (
        <span className='text-xs'>{row.original.crewName ?? "—"}</span>
      ),
    },
    {
      accessorKey: "status",
      header: t("reports.jobDetail.status"),
      cell: ({ row }) => {
        const eff = row.original.status === "CANCELLED" && row.original.refundedAmount > 0 ? "REFUNDED" : row.original.status;
        const style = STATUS_STYLES[eff] ?? "bg-muted text-muted-foreground";
        return (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase",
              style,
            )}
          >
            {eff}
          </span>
        );
      },
    },
    {
      accessorKey: "price",
      header: t("reports.jobDetail.price"),
      meta: { align: "right" },
      cell: ({ row }) => {
        const { status, price, refundedAmount } = row.original;
        if (status === "EXPIRED") return <span className='font-mono text-xs text-muted-foreground'>—</span>;
        if (refundedAmount > 0)
          return (
            <span className='inline-flex items-center gap-1 font-mono text-xs font-semibold text-red-600 dark:text-red-400'>
              <Undo2 className='h-3 w-3' />
              -{formatRupiah(refundedAmount)}
            </span>
          );
        if (status === "CANCELLED") return <span className='font-mono text-xs text-muted-foreground'>—</span>;
        return <span className='font-mono text-xs'>{formatRupiah(price)}</span>;
      },
    },
    {
      accessorKey: "rating",
      header: t("reports.jobDetail.rating"),
      meta: { align: "right" },
      cell: ({ row }) =>
        row.original.rating != null ? (
          <span className='inline-flex items-center gap-1 font-mono text-xs'>
            <Star className='h-3.5 w-3.5 fill-yellow-400 text-yellow-400' />
            {row.original.rating}
          </span>
        ) : (
          <span className='text-xs text-muted-foreground'>—</span>
        ),
    },
    {
      id: "detail",
      header: "",
      cell: ({ row }) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDetailRow(row.original);
          }}
          className='flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
        >
          <Eye className='h-3.5 w-3.5' />
          Detail
        </button>
      ),
    },
  ];

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4'>
        <div>
          <h1 className='text-xl font-bold text-foreground'>
            {t("reports.title")}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {t("reports.jobDetail.subtitle")}
          </p>
        </div>
      </div>

      <ReportTabs />

      {/* Filter panel */}
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
              onClick={handleClear}
              className='flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive'
            >
              <X className='h-3 w-3' /> Reset all
            </button>
          )}
        </div>

        <div className='divide-y divide-border'>
          <div className='grid grid-cols-1 divide-y sm:grid-cols-2 lg:grid-cols-4 sm:divide-x sm:divide-y-0 divide-border'>
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
                  onChange={(e) => setFrom(e.target.value)}
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
                  onChange={(e) => setTo(e.target.value)}
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
                  setSelectedSiteId(v === "__all__" ? "" : v)
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
                  setSelectedCrewId(v === "__all__" ? "" : v)
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
                onValueChange={(v) => setStatusFilter(v === "__all__" ? "" : v)}
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
                  <SelectItem value='REFUNDED'>Refunded</SelectItem>
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
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleApply();
                }}
                placeholder='Cari Booking ID...'
                prefix={<Search />}
                className={cn(
                  "w-full sm:w-72",
                  appliedFilters.search ? "border-primary/50" : "",
                )}
              />
              {searchInput && (
                <button
                  type='button'
                  onClick={() => setSearchInput("")}
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
                      onClick={() => setHasRatingFilter(val)}
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
                onClick={() => setHasPhotosFilter((v) => !v)}
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
            </div>

            <Button
              onClick={handleApply}
              disabled={isLoading}
              className='gap-2 px-5'
            >
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

      {/* Active filter chips */}
      {hasFilter && (
        <div className='flex flex-wrap items-center gap-2'>
          <span className='text-xs font-medium text-muted-foreground'>
            Applied:
          </span>
          {appliedSiteId && (
            <span className='inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary'>
              <Building2 className='h-2.5 w-2.5' />
              {selectedSiteName ?? appliedSiteId}
            </span>
          )}
          {(appliedFrom || appliedTo) && (
            <span className='inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary'>
              <Calendar className='h-2.5 w-2.5' />
              {appliedFrom || "…"} → {appliedTo || "…"}
            </span>
          )}
          {appliedFilters.crewId && (
            <span className='inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary'>
              <Users className='h-2.5 w-2.5' />
              {selectedCrewName ?? appliedFilters.crewId}
            </span>
          )}
          {appliedFilters.hasRating === true && (
            <span className='inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary'>
              <Star className='h-2.5 w-2.5' />
              {t("reports.jobDetail.filterRatingYes")}
            </span>
          )}
          {appliedFilters.hasRating === false && (
            <span className='inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary'>
              {t("reports.jobDetail.filterRatingNo")}
            </span>
          )}
          {appliedFilters.hasPhotos && (
            <span className='inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary'>
              <Camera className='h-2.5 w-2.5' />
              {t("reports.jobDetail.filterHasPhotos")}
            </span>
          )}
          {appliedFilters.search && (
            <span className='inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary'>
              <Search className='h-2.5 w-2.5' />
              &ldquo;{appliedFilters.search}&rdquo;
            </span>
          )}
        </div>
      )}

      {/* Amount summary */}
      {jobRows.length > 0 && (() => {
        const pageRevenue = jobRows.reduce((sum, r) =>
          sum + (r.refundedAmount > 0 || r.status === "CANCELLED" || r.status === "EXPIRED" ? 0 : r.price), 0);
        const pageRefunded = jobRows.reduce((sum, r) => sum + r.refundedAmount, 0);
        const pageNet = pageRevenue - pageRefunded;
        return (
          <div className='flex flex-wrap items-center gap-4 rounded-xl border border-border bg-muted/30 px-4 py-3'>
            <div className='flex items-center gap-3'>
              <span className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground'>Revenue</span>
              <span className='font-mono text-sm font-semibold text-foreground'>{formatRupiah(pageRevenue)}</span>
            </div>
            <div className='h-4 w-px bg-border' />
            <div className='flex items-center gap-3'>
              <span className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground'>Refunded</span>
              <span className='font-mono text-sm font-semibold text-red-600 dark:text-red-400'>{pageRefunded > 0 ? `-${formatRupiah(pageRefunded)}` : formatRupiah(0)}</span>
            </div>
            <div className='h-4 w-px bg-border' />
            <div className='flex items-center gap-3'>
              <span className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground'>Net</span>
              <span className='font-mono text-sm font-bold text-foreground'>{formatRupiah(pageNet)}</span>
            </div>
            <span className='ml-auto text-[10px] text-muted-foreground/60'>halaman ini</span>
          </div>
        );
      })()}

      {/* Export toolbar */}
      <div className='flex items-center justify-between gap-3'>
        <span className='text-sm text-muted-foreground'>
          <span className='font-semibold text-foreground'>{jobTotal}</span> results
        </span>
        <div className='flex items-center gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                disabled={isLoading || jobRows.length === 0}
                className='gap-1.5 text-xs'
              >
                <FileDown className='h-3.5 w-3.5' />
                Export Current View
                <ChevronDown className='h-3 w-3' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => handleExportCurrent("excel")}>
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportCurrent("csv")}>
                CSV (.csv)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                disabled={isLoading || jobTotal === 0 || isExporting}
                className='gap-1.5 text-xs'
              >
                {isExporting ? (
                  <span className='h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground' />
                ) : (
                  <FileDown className='h-3.5 w-3.5' />
                )}
                Export All ({jobTotal})
                <ChevronDown className='h-3 w-3' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => handleExportAll("excel")}>
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportAll("csv")}>
                CSV (.csv)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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
        onPageSizeChange={(v) => {
          setPageSize(v);
          setPage(1);
        }}
        resultsLabel={(start, end, total) => (
          <>
            Showing{" "}
            <span className='font-semibold text-foreground'>
              {start}–{end}
            </span>{" "}
            of <span className='font-semibold text-foreground'>{total}</span>{" "}
            results
          </>
        )}
      />

      {/* Detail modal */}
      <JobDetailModal
        open={detailRow !== null}
        onClose={() => setDetailRow(null)}
        row={detailRow}
        t={t}
      />
    </div>
  );
}
