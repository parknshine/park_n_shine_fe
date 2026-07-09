"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  Inbox,
  LayoutGrid,
  MessageSquare,
  QrCode,
  ScrollText,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_MENUS, accessForPath } from "@/lib/menu-access";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";
import { useTranslation } from "@/i18n";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MENU_ICONS: Record<string, typeof LayoutGrid> = {
  "/dashboard": LayoutGrid,
  "/sites": QrCode,
  "/reports": BarChart2,
  "/audit": ScrollText,
  "/crew-members": Users,
  "/testimonials": MessageSquare,
  "/inbox": Inbox,
  "/settings": Settings,
};

const BASE_NAV_ITEMS = ADMIN_MENUS.map((m) => ({
  ...m,
  icon: MENU_ICONS[m.href] ?? LayoutGrid,
}));

const SUPER_ADMIN_NAV_ITEMS = [
  { href: "/users", key: "sidebar.adminUsers", icon: Shield },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.role);
  const menuAccess = useAuthStore((s) => s.menuAccess);
  const { t } = useTranslation("admin");
  const collapsed = useUIStore((s) => s.sidebarCollapsed);

  const navItems = [
    ...BASE_NAV_ITEMS.filter(
      ({ href }) => accessForPath(href, role, menuAccess) !== "none",
    ),
    ...(role === "super_admin" ? SUPER_ADMIN_NAV_ITEMS : []),
  ];

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-background transition-[width] duration-200 ease-in-out overflow-hidden shrink-0",
        collapsed ? "w-12" : "w-56"
      )}
    >
      <TooltipProvider delayDuration={100}>
        {/* Logo */}
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b border-border transition-[padding,gap] duration-200",
            collapsed ? "justify-center px-0" : "gap-2.5 px-4"
          )}
        >
          <Image
            src="/parknshinelogo.svg"
            alt="Park & Shine logo"
            width={28}
            height={28}
            className="shrink-0 h-7 w-auto"
          />
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold tracking-tight text-foreground leading-none whitespace-nowrap">
                Park &amp; Shine
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 whitespace-nowrap">
                {t("common.adminConsole")}
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-1.5 py-3">
          {navItems.map(({ href, key, icon: Icon }) => {
            const label = t(key);
            const isActive = pathname === href || pathname.startsWith(href + "/");
            const linkClass = cn(
              "flex items-center rounded-md py-2 text-sm font-medium transition-colors",
              collapsed ? "justify-center px-2" : "gap-3 px-3",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            );

            if (collapsed) {
              return (
                <Tooltip key={href}>
                  <TooltipTrigger asChild>
                    <Link href={href} className={linkClass}>
                      <Icon className="h-4 w-4 shrink-0" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link key={href} href={href} className={linkClass}>
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </TooltipProvider>
    </aside>
  );
}
