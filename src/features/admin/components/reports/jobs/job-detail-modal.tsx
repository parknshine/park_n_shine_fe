"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Hash, Users, Building2, Clock, Star, Camera, Undo2 } from "lucide-react";
import api from "@/lib/axios-admin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ReportBookingRow } from "@/features/admin/types";
import { bookingRef, cn } from "@/lib/utils";
import {
  BEFORE_TYPES,
  AFTER_TYPES,
  STATUS_STYLES,
  formatDate,
  formatRupiah,
  formatTurnaround,
} from "@/features/admin/utils/reports/jobs-format";
import { PhotoLightboxOverlay, PhotoSection } from "./job-photo-viewer";

export function JobDetailModal({
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
      void queryClient.invalidateQueries({
        queryKey: ["admin", "report-bookings"],
      });
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

  const effStatus = row.refundedAmount > 0 ? "REFUNDED" : row.status;
  const statusStyle =
    STATUS_STYLES[effStatus] ?? "bg-muted text-muted-foreground";

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
                <span className='text-right font-mono text-xs font-medium'>
                  {bookingRef(row.reference, row.id)}
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
              <div
                className={cn(
                  "rounded-lg border px-4 py-3",
                  isRefunded
                    ? "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20"
                    : "border-border bg-muted/30",
                )}
              >
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
                      Refund{" "}
                      <span className='font-semibold text-foreground'>
                        {formatRupiah(row.price)}
                      </span>{" "}
                      ke customer
                    </p>
                    <div className='flex gap-2'>
                      <Button
                        size='sm'
                        variant='destructive'
                        disabled={refundMutation.isPending}
                        onClick={() => refundMutation.mutate(row.id)}
                        className='h-7 text-xs'
                      >
                        {refundMutation.isPending
                          ? "Processing..."
                          : "Ya, tandai refund"}
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
                      <p className='text-xs text-destructive'>
                        Gagal. Coba lagi.
                      </p>
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
