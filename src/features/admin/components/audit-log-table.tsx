"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { AuditEntry } from "@/features/admin/types";
import { useTranslation } from "@/i18n";
import { formatAuditDetail, formatAuditAction } from "@/features/admin/utils/format-audit-detail";
import { DataTable } from "@/components/ui/data-table";

interface AuditLogTableProps {
  entries: AuditEntry[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRowClick?: (entry: AuditEntry) => void;
}

const PAGE_SIZE_OPTIONS = [25, 50, 100];

export function AuditLogTable({
  entries,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onRowClick,
}: Readonly<AuditLogTableProps>) {
  const { t } = useTranslation("admin");

  const columns: ColumnDef<AuditEntry>[] = [
    {
      accessorKey: "createdAt",
      header: t("auditTable.columns.timestamp"),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleString("id-ID")}
        </span>
      ),
    },
    {
      accessorKey: "bookingId",
      header: t("auditTable.columns.bookingId"),
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.bookingId}</span>
      ),
    },
    {
      accessorKey: "plateText",
      header: t("auditTable.columns.plate"),
      cell: ({ row }) => (
        <span className="font-semibold">{row.original.plateText ?? "—"}</span>
      ),
    },
    {
      accessorKey: "action",
      header: t("auditTable.columns.action"),
      cell: ({ row }) => (
        <span>{formatAuditAction(row.original.action)}</span>
      ),
    },
    {
      id: "detail",
      header: t("auditTable.columns.detail"),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatAuditDetail(row.original.action, row.original.detail)}
        </span>
      ),
    },
    {
      accessorKey: "adminEmail",
      header: t("auditTable.columns.actor"),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.adminEmail}</span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={entries}
      emptyMessage={t("auditTable.empty")}
      totalCount={totalCount}
      page={page}
      pageSize={pageSize}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      resultsLabel={(start, end, total) => `${start}–${end} of ${total}`}
      onRowClick={onRowClick}
    />
  );
}
