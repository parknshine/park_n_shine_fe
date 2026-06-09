"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BarChart2, LayoutGrid, Mail, QrCode, ScrollText, Settings, Shield, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";
import { useTranslation } from "@/i18n";
import { Combobox } from "@/components/ui/combobox";

export function AdminSidebar() {
  const pathname = usePathname();
  const sites = useUIStore((s) => s.sites);
  const activeSiteId = useUIStore((s) => s.activeSiteId);
  const setActiveSiteId = useUIStore((s) => s.setActiveSiteId);
  const role = useAuthStore((s) => s.role);
  const { t } = useTranslation("admin");

  const BASE_NAV_ITEMS = [
    { href: "/dashboard", label: t("sidebar.dashboard"), icon: LayoutGrid },
    { href: "/sites", label: t("sidebar.sitesQr"), icon: QrCode },
    { href: "/reports", label: t("sidebar.reports"), icon: BarChart2 },
    { href: "/audit", label: t("sidebar.auditTrail"), icon: ScrollText },
    { href: "/crew-members", label: t("sidebar.crew"), icon: Users },
    { href: "/email", label: t("sidebar.email"), icon: Mail },
    { href: "/settings", label: t("sidebar.settings"), icon: Settings },
  ];

  const SUPER_ADMIN_NAV_ITEMS = [
    { href: "/users", label: t("sidebar.adminUsers"), icon: Shield },
  ];

  const navItems = [
    ...BASE_NAV_ITEMS,
    ...(role === "super_admin" ? SUPER_ADMIN_NAV_ITEMS : []),
  ];

  return (
    <aside className="flex h-full w-56 flex-col border-r border-border bg-background">
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-4">
        <Image
          src="/park_n_shine_logo.jpeg.png"
          alt="Park & Shine logo"
          width={28}
          height={28}
          className="shrink-0 rounded-md"
        />
        <div>
          <p className="text-sm font-bold tracking-tight text-foreground leading-none">
            Park &amp; Shine
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{t("common.adminConsole")}</p>
        </div>
      </div>

      {/* Site selector */}
      {sites.length > 0 && (
        <div className="border-b border-border px-4 py-3">
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            {t("common.siteActive")}
          </p>
          <Combobox
            options={sites.map((s) => ({ value: s.id, label: s.name }))}
            value={activeSiteId ?? ""}
            onChange={setActiveSiteId}
            placeholder={t("common.siteActive")}
          />
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-2 py-3">
        {navItems.map(({ href, label, icon: Icon }) => {
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
