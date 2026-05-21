"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bell, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";
import { useAdminAuth, useAdminQueue } from "@/features/admin/hooks";
import { LanguageSwitcher } from "@/components/shared";
import { StatusBadge } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { BOOKING_STATUS_TONES } from "@/features/customer/types";
import { useTranslation } from "@/i18n";

const PAGE_TITLE_KEYS: Record<string, string> = {
  "/dashboard": "dashboard.title",
  "/reports": "reports.title",
  "/audit": "audit.title",
  "/settings": "settings.title",
};

export function AdminNavbar() {
  const pathname = usePathname();
  const { logout } = useAdminAuth();
  const user = useAuthStore((s) => s.user);
  const activeSiteId = useUIStore((s) => s.activeSiteId);
  const { t } = useTranslation("admin");
  const [showEscalations, setShowEscalations] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { queue } = useAdminQueue({
    siteId: activeSiteId ?? "",
    enabled: !!activeSiteId,
  });

  const escalations = queue?.escalations ?? [];
  const escalationCount = escalations.length;

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowEscalations(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const pageTitleKey = PAGE_TITLE_KEYS[pathname];
  const pageTitle = pageTitleKey ? t(pageTitleKey) : t("common.adminConsole");
  const email = (user as { email?: string })?.email ?? "admin";
  const avatarLetter = email.charAt(0).toUpperCase();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      {/* Left: current page title */}
      <h1 className="text-base font-semibold text-foreground">{pageTitle}</h1>

      {/* Right: escalations + language + user + logout */}
      <div className="flex items-center gap-2">
        {/* Escalation bell */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setShowEscalations((v) => !v)}
            className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={t("navbar.escalationsAriaLabel")}
          >
            <Bell className="h-4 w-4" />
            {escalationCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {escalationCount > 9 ? "9+" : escalationCount}
              </span>
            )}
          </button>

          {/* Escalation dropdown */}
          {showEscalations && (
            <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-lg border border-border bg-background shadow-lg">
              <div className="border-b border-border px-4 py-2.5">
                <p className="text-xs font-semibold text-foreground">
                  {escalationCount > 0
                    ? t("navbar.escalationsTitle", { count: escalationCount })
                    : t("navbar.noEscalations")}
                </p>
              </div>
              {escalations.length > 0 ? (
                <ul className="max-h-64 divide-y divide-border overflow-y-auto">
                  {escalations.map((booking) => (
                    <li
                      key={booking.id}
                      className="flex items-center justify-between gap-3 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {booking.plateText ?? booking.id}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {booking.slotText}
                        </p>
                      </div>
                      <StatusBadge tone={BOOKING_STATUS_TONES[booking.status] ?? "neutral"}>
                        {booking.status}
                      </StatusBadge>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t("navbar.noEscalationsDesc")}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <LanguageSwitcher />

        {/* Divider */}
        <div className="h-5 w-px bg-border" />

        {/* User profile */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {avatarLetter}
          </div>
          <span className="hidden max-w-[140px] truncate text-xs text-muted-foreground sm:block">
            {email}
          </span>
        </div>

        {/* Logout */}
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={logout}
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden text-xs sm:inline">{t("common.logout")}</span>
        </Button>
      </div>
    </header>
  );
}
