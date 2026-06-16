"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminLoyaltyCustomers } from "@/features/admin/hooks/use-admin-loyalty";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

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
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

export default function CustomersReportPage() {
  const { customers, isLoading } = useAdminLoyaltyCustomers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Customers</h1>
        <p className="text-sm text-muted-foreground">
          Daftar pelanggan terdaftar dan tamu yang pernah melakukan booking
        </p>
      </div>

      <ReportTabs />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Memuat..." : `${customers.length} pelanggan`}
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Tipe
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Nama
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  No HP
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Cuci
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Booking
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Bergabung
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
                      Memuat data...
                    </span>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Belum ada pelanggan terdaftar.
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  return (
                    <tr key={c.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <CustomerTypeBadge type={c.type} />
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground">
                        {c.name ?? <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground">
                        {c.email ?? <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{maskPhone(c.phone)}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs">{c.washCount}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs">{c.bookingCount}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(c.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
