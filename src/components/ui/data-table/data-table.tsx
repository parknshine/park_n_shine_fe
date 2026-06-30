"use client";

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type RowData,
} from "@tanstack/react-table";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTableToolbar } from "./data-table-toolbar";
import { DataTablePagination } from "./data-table-pagination";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: "left" | "center" | "right";
  }
}

function alignClass(align?: "left" | "center" | "right"): string {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "";
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  isLoading?: boolean;
  emptyMessage: string;
  // toolbar
  searchPlaceholder?: string;
  toolbar?: React.ReactNode;
  // pagination — provide totalCount + onPageChange to enable
  totalCount?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  resultsLabel?: (start: number, end: number, total: number) => React.ReactNode;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  // row interaction
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  emptyMessage,
  searchPlaceholder,
  toolbar,
  totalCount,
  page = 1,
  pageSize = 25,
  onPageChange,
  resultsLabel,
  pageSizeOptions,
  onPageSizeChange,
  onRowClick,
}: Readonly<DataTableProps<TData>>) {
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const rows = table.getRowModel().rows;
  const hasPagination =
    totalCount !== undefined && onPageChange !== undefined;

  return (
    <div className="space-y-3">
      <DataTableToolbar
        searchValue={globalFilter}
        onSearchChange={setGlobalFilter}
        searchPlaceholder={searchPlaceholder}
        toolbar={toolbar}
      />

      <div className="overflow-x-auto rounded-2xl bg-card shadow-(--shadow)">
        <table className="w-full text-sm">
          <thead className="bg-(--surface-low)">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "px-4 py-3 text-left font-medium text-foreground whitespace-nowrap",
                      alignClass(header.column.columnDef.meta?.align)
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={`skeleton-row-${i}`}>
                  {columns.map((col, j) => (
                    <td
                      key={col.id ?? `skeleton-col-${j}`}
                      className="px-4 py-3"
                    >
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="m-2 flex h-32 items-center justify-center rounded-lg border border-dashed border-border">
                    <p className="text-sm text-muted-foreground">
                      {emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(
                    "hover:bg-muted/30",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn(
                        "px-4 py-3",
                        alignClass(cell.column.columnDef.meta?.align)
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasPagination && (
        <DataTablePagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={onPageChange}
          resultsLabel={resultsLabel}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
