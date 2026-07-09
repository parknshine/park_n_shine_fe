"use client";

import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export type MenuAccessLevel = "write" | "read" | "none";
export type MenuAccessMap = Record<string, MenuAccessLevel>;

// Single source of truth for admin menus (href + i18n label key).
// /users is superadmin-only and excluded — it can't be granted to admins.
export const ADMIN_MENUS = [
  { href: "/dashboard", key: "sidebar.dashboard" },
  { href: "/sites", key: "sidebar.sitesQr" },
  { href: "/reports", key: "sidebar.reports" },
  { href: "/audit", key: "sidebar.auditTrail" },
  { href: "/crew-members", key: "sidebar.crew" },
  { href: "/testimonials", key: "sidebar.testimonials" },
  { href: "/inbox", key: "sidebar.inbox" },
  { href: "/settings", key: "sidebar.settings" },
] as const;

export function menuForPath(pathname: string): string | null {
  const menu = ADMIN_MENUS.find(
    (m) => pathname === m.href || pathname.startsWith(m.href + "/"),
  );
  return menu?.href ?? null;
}

// Missing map, missing key, unknown path, or super_admin → "write" (full access).
export function accessForPath(
  pathname: string,
  role: "super_admin" | "admin" | null,
  menuAccess: MenuAccessMap | null,
): MenuAccessLevel {
  if (role === "super_admin" || !menuAccess) return "write";
  const href = menuForPath(pathname);
  if (!href) return "write";
  return menuAccess[href] ?? "write";
}

export function useMenuAccess(): MenuAccessLevel {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.role);
  const menuAccess = useAuthStore((s) => s.menuAccess);
  return accessForPath(pathname, role, menuAccess);
}

export function useCanWrite(): boolean {
  return useMenuAccess() === "write";
}
