"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Trash2,
  SlidersHorizontal,
  Search,
  Calendar,
  Users,
  ArrowRight,
  X,
  Check,
  Hash,
  RefreshCw,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useAdminLoyaltyCustomers,
  useDeleteCustomer,
  type LoyaltyCustomer,
} from "@/features/admin/hooks/use-admin-loyalty";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "—";
  if (phone.length <= 6) return phone;
  return phone.slice(0, 4) + "****" + phone.slice(-3);
}

function CustomerTypeBadge({ type }: { type: "registered" | "guest" }) {
  if (type === "registered") {
    return (
      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
        User
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-gray-300 px-2 py-0.5 text-xs font-medium text-gray-500">
      Guest
    </span>
  );
}

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
    <div className="flex gap-1 border-b border-border">
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

export default function CustomersReportPage() {
  const { t } = useTranslation("admin");
  const { deleteCustomer, isDeleting } = useDeleteCustomer();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  // Staged filter state (pending Apply)
  const [searchInput, setSearchInput] = useState("");
  const [type, setType] = useState<"" | "registered" | "guest">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [minWash, setMinWash] = useState("");

  // Applied filter state (sent to hook)
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedType, setAppliedType] = useState<"" | "registered" | "guest">("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const [appliedMinWash, setAppliedMinWash] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  function handleApply() {
    setPage(1);
    setAppliedSearch(searchInput);
    setAppliedType(type);
    setAppliedFrom(from);
    setAppliedTo(to);
    setAppliedMinWash(minWash);
  }

  function handleClear() {
    setSearchInput("");
    setType("");
    setFrom("");
    setTo("");
    setMinWash("");
    setAppliedSearch("");
    setAppliedType("");
    setAppliedFrom("");
    setAppliedTo("");
    setAppliedMinWash("");
    setPage(1);
  }

  async function handleConfirmDelete(id: string) {
    try {
      await deleteCustomer(id);
    } finally {
      setConfirmingId(null);
    }
  }

  const minWashNum = appliedMinWash ? Number.parseInt(appliedMinWash, 10) : undefined;

  const { customers, pagination, isLoading, refetch } = useAdminLoyaltyCustomers({
    search: appliedSearch || undefined,
    type: appliedType || undefined,
    from: appliedFrom || undefined,
    to: appliedTo || undefined,
    minWash: minWashNum,
    page,
    limit: pageSize,
  });

  const hasApplied =
    appliedSearch !== "" ||
    appliedType !== "" ||
    appliedFrom !== "" ||
    appliedTo !== "" ||
    appliedMinWash !== "";

  const activeFilterCount = [
    searchInput !== "",
    type !== "",
    from !== "" || to !== "",
    minWash !== "",
  ].filter(Boolean).length;

  const columns: ColumnDef<LoyaltyCustomer>[] = [
    {
      id: "type",
      header: "Tipe",
      cell: ({ row }) => <CustomerTypeBadge type={row.original.type} />,
    },
    {
      id: "name",
      header: "Nama",
      cell: ({ row }) =>
        row.original.name ?? <span className="text-muted-foreground">—</span>,
    },
    {
      id: "email",
      header: "Email",
      cell: ({ row }) =>
        row.original.email ?? <span className="text-muted-foreground">—</span>,
    },
    {
      id: "phone",
      header: "No HP",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{maskPhone(row.original.phone)}</span>
      ),
    },
    {
      id: "washCount",
      header: "Cuci",
      meta: { align: "right" },
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.washCount}</span>
      ),
    },
    {
      id: "bookingCount",
      header: "Booking",
      meta: { align: "right" },
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.bookingCount}</span>
      ),
    },
    {
      id: "createdAt",
      header: "Bergabung",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
          onClick={() => setConfirmingId(row.original.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Customers</h1>
        <p className="text-sm text-muted-foreground">
          Daftar pelanggan terdaftar dan tamu yang pernah melakukan booking
        </p>
      </div>

      <ReportTabs />

      {/* Filter panel */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
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
          {(hasApplied || activeFilterCount > 0) && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
            >
              <X className="h-3 w-3" /> Reset all
            </button>
          )}
        </div>

        <div className="divide-y divide-border">
          {/* Row 1: Date range | Type | Min wash */}
          <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="space-y-2 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Tanggal Bergabung
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className={cn(
                    "h-8 min-w-0 flex-1 rounded-lg border px-2.5 text-xs bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
                    from
                      ? "border-primary/40 text-foreground"
                      : "border-border text-muted-foreground",
                  )}
                />
                <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                <input
                  type="date"
                  value={to}
                  min={from}
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

            <div className="space-y-2 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Tipe
                </span>
              </div>
              <Select
                value={type || "__all__"}
                onValueChange={(v) =>
                  setType(v === "__all__" ? "" : (v as "registered" | "guest"))
                }
              >
                <SelectTrigger
                  className={cn(
                    "h-8 w-full text-xs",
                    type ? "border-primary/40 font-medium" : "",
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Semua tipe</SelectItem>
                  <SelectItem value="registered">User (Akun)</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <Hash className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Min. Cuci
                </span>
              </div>
              <input
                type="number"
                min={0}
                value={minWash}
                onChange={(e) => setMinWash(e.target.value)}
                placeholder="0"
                className={cn(
                  "h-8 w-full rounded-lg border px-2.5 text-xs bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
                  minWash
                    ? "border-primary/40 text-foreground"
                    : "border-border text-muted-foreground",
                )}
              />
            </div>
          </div>

          {/* Row 2: Search */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-1.5">
              <Search className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Cari
              </span>
            </div>
            <div className="relative mt-2">
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleApply();
                }}
                placeholder="Cari nama, email, atau no HP..."
                className={cn(
                  "w-full sm:w-72",
                  appliedSearch ? "border-primary/50" : "",
                )}
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Row 3: Apply button */}
          <div className="flex items-center justify-end gap-2 px-4 py-3">
            <Button variant="outline" size="sm" disabled={isLoading} onClick={() => refetch()} title="Refresh" className="gap-1.5 text-xs">
              <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            </Button>
            <Button onClick={handleApply} disabled={isLoading} className="gap-2 px-5">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Memuat...
                </span>
              ) : (
                <>
                  Terapkan
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
      {hasApplied && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Aktif:
          </span>
          {appliedSearch && (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              <Search className="h-2.5 w-2.5" />
              &ldquo;{appliedSearch}&rdquo;
            </span>
          )}
          {appliedType && (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              <Users className="h-2.5 w-2.5" />
              {appliedType === "registered" ? "User" : "Guest"}
            </span>
          )}
          {(appliedFrom || appliedTo) && (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              <Calendar className="h-2.5 w-2.5" />
              {appliedFrom || "…"} → {appliedTo || "…"}
            </span>
          )}
          {appliedMinWash && (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              <Hash className="h-2.5 w-2.5" />
              Min. {appliedMinWash}× cuci
            </span>
          )}
        </div>
      )}

      {/* Data table */}
      <DataTable
        columns={columns}
        data={customers}
        isLoading={isLoading}
        emptyMessage={t("reports.customerFilter.emptyMessage")}
        totalCount={pagination?.total}
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
            <span className="font-semibold text-foreground">
              {start}–{end}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">{total}</span>{" "}
            pelanggan
          </>
        )}
      />

      {/* Delete confirm dialog */}
      <Dialog
        open={confirmingId !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmingId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Pelanggan</DialogTitle>
            <DialogDescription>
              Hapus pelanggan ini? Data booking tidak akan hilang.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmingId(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={() => confirmingId && handleConfirmDelete(confirmingId)}
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
