import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ELLIPSIS = { LEFT: "ellipsis-left", RIGHT: "ellipsis-right" } as const;
type Ellipsis = (typeof ELLIPSIS)[keyof typeof ELLIPSIS];
type PageItem = number | Ellipsis;

function getPageNumbers(current: number, total: number): PageItem[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, ELLIPSIS.RIGHT, total];
  if (current >= total - 3)
    return [1, ELLIPSIS.LEFT, total - 4, total - 3, total - 2, total - 1, total];
  return [1, ELLIPSIS.LEFT, current - 1, current, current + 1, ELLIPSIS.RIGHT, total];
}

interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  resultsLabel?: (start: number, end: number, total: number) => React.ReactNode;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}

export function DataTablePagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
  resultsLabel,
  pageSizeOptions,
  onPageSizeChange,
}: Readonly<DataTablePaginationProps>) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex = Math.min((page - 1) * pageSize + 1, totalCount);
  const endIndex = Math.min(page * pageSize, totalCount);
  const pageNums = getPageNumbers(page, totalPages);

  if (totalCount === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-4 py-2",
        resultsLabel !== undefined ? "justify-between" : "justify-end"
      )}
    >
      {resultsLabel !== undefined && (
        <p className="text-xs text-muted-foreground">
          {resultsLabel(startIndex, endIndex, totalCount)}
        </p>
      )}

      <div className="flex items-center gap-3">
        {pageSizeOptions && onPageSizeChange && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => onPageSizeChange(Number(v))}
            >
              <SelectTrigger className="h-7 w-20 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(1)}
              disabled={page === 1}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
              aria-label="First page"
            >
              «
            </button>
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background transition-colors hover:border-primary/40 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            {pageNums.map((n) =>
              typeof n === "string" ? (
                <span
                  key={n}
                  className="flex h-7 w-7 items-center justify-center text-xs text-muted-foreground select-none"
                >
                  …
                </span>
              ) : (
                <button
                  key={n}
                  onClick={() => onPageChange(n)}
                  aria-current={n === page ? "page" : undefined}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md border text-xs font-medium transition-colors",
                    n === page
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-background text-foreground hover:border-primary/40 hover:text-primary"
                  )}
                >
                  {n}
                </button>
              )
            )}

            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background transition-colors hover:border-primary/40 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={page === totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
              aria-label="Last page"
            >
              »
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
