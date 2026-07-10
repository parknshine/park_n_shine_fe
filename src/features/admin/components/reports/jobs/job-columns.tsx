import { Star, Undo2, Banknote, Eye } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ReportBookingRow } from "@/features/admin/types";
import { bookingRef, cn } from "@/lib/utils";
import {
  STATUS_STYLES,
  PAYMENT_STATUS_STYLES,
  formatDate,
  formatRupiah,
} from "@/features/admin/utils/reports/jobs-format";
import type { LedgerRow } from "@/features/admin/utils/reports/jobs-export";

export function buildJobColumns({
  t,
  onOpenBooking,
  onOpenDetail,
}: {
  t: (key: string) => string;
  onOpenBooking: (bookingId: string) => void;
  onOpenDetail: (row: ReportBookingRow) => void;
}): ColumnDef<LedgerRow>[] {
  return [
    {
      accessorKey: "id",
      header: "Booking ID",
      cell: ({ row }) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenBooking(row.original.id);
          }}
          className='font-mono text-xs text-blue-600 underline-offset-2 hover:underline'
        >
          {bookingRef(row.original.reference, row.original.id)}
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
        <div className='min-w-20'>
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
      header: "Job Status",
      cell: ({ row }) => {
        const { status, paidAt, refundedAmount, _ledgerType } = row.original;
        const style = STATUS_STYLES[status] ?? "bg-muted text-muted-foreground";
        const isPaidUnrefunded =
          !_ledgerType &&
          (status === "CANCELLED" || status === "EXPIRED") &&
          !!paidAt &&
          refundedAmount === 0;
        return (
          <span className='inline-flex items-center gap-1.5'>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase",
                style,
              )}
            >
              {status}
            </span>
            {isPaidUnrefunded && (
              <span title='Sudah dibayar, belum direfund'>
                <Banknote className='h-3.5 w-3.5 text-amber-500' />
              </span>
            )}
          </span>
        );
      },
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment Status",
      cell: ({ row }) => {
        const { paymentStatus, _ledgerType } = row.original;
        const eff = _ledgerType === "PAID" ? "PAID" : paymentStatus;
        const style =
          PAYMENT_STATUS_STYLES[eff] ?? "bg-muted text-muted-foreground";
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
        const { status, price, refundedAmount, _ledgerType } = row.original;
        if (_ledgerType === "PAID")
          return (
            <span className='font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400'>
              {formatRupiah(price)}
            </span>
          );
        if (_ledgerType === "REFUND")
          return (
            <span className='inline-flex items-center gap-1 font-mono text-xs font-semibold text-red-600 dark:text-red-400'>
              <Undo2 className='h-3 w-3' />-{formatRupiah(refundedAmount)}
            </span>
          );
        if (status === "EXPIRED") {
          return row.original.paidAt ? (
            <span className='font-mono text-xs font-medium text-amber-600 dark:text-amber-400'>
              {formatRupiah(price)}
            </span>
          ) : (
            <span className='font-mono text-xs text-muted-foreground'>—</span>
          );
        }
        if (refundedAmount > 0)
          return (
            <span className='inline-flex items-center gap-1 font-mono text-xs font-semibold text-red-600 dark:text-red-400'>
              <Undo2 className='h-3 w-3' />-{formatRupiah(refundedAmount)}
            </span>
          );
        if (status === "CANCELLED") {
          return row.original.paidAt ? (
            <span className='font-mono text-xs font-medium text-amber-600 dark:text-amber-400'>
              {formatRupiah(price)}
            </span>
          ) : (
            <span className='font-mono text-xs text-muted-foreground'>—</span>
          );
        }
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
            onOpenDetail(row.original);
          }}
          className='flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
        >
          <Eye className='h-3.5 w-3.5' />
          Detail
        </button>
      ),
    },
  ];
}
