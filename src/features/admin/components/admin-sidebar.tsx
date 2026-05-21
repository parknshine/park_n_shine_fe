"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, LayoutGrid, ScrollText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";
import { useTranslation } from "@/i18n";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/reports", label: "Reports", icon: BarChart2 },
  { href: "/audit", label: "Audit Trail", icon: ScrollText },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const sites = useUIStore((s) => s.sites);
  const activeSiteId = useUIStore((s) => s.activeSiteId);
  const setActiveSiteId = useUIStore((s) => s.setActiveSiteId);
  const { t } = useTranslation("admin");

  return (
    <aside className="flex h-full w-56 flex-col border-r border-border bg-background">
      {/* Logo */}
      <div className="border-b border-border px-4 py-4">
        <p className="text-sm font-bold tracking-tight text-foreground">
          Park &amp; Shine
        </p>
        <p className="text-xs text-muted-foreground">{t("common.adminConsole")}</p>
      </div>

      {/* Site selector */}
      {sites.length > 0 && (
        <div className="border-b border-border px-4 py-3">
          <label
            htmlFor="site-select"
            className="mb-1 block text-xs font-medium text-muted-foreground"
          >
            {t("common.siteActive")}
          </label>
          <select
            id="site-select"
            value={activeSiteId ?? ""}
            onChange={(e) => setActiveSiteId(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
          >
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-2 py-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
