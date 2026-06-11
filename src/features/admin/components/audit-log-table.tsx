"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { AuditEntry } from "@/features/admin/types";
import { useTranslation } from "@/i18n";
import { formatAuditDetail } from "@/features/admin/utils/format-audit-detail";
import { DataTable } from "@/components/ui/data-table";

interface AuditLogTableProps {
  entries: AuditEntry[];
  onRowClick?: (entry: AuditEntry) => void;
}

export function AuditLogTable({ entries, onRowClick }: Readonly<AuditLogTableProps>) {
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
        <span>{t(`auditTable.actions.${row.original.action}`)}</span>
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
      header: t("auditTable.columns.admin"),
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
      onRowClick={onRowClick}
    />
  );
}
