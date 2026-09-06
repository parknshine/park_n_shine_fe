"use client";

import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlarmClock,
  Bell,
  LogOut,
  Menu,
  PhoneCall,
  Timer,
  Undo2,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";
import {
  useAdminAuth,
  useAdminEscalations,
  useAdminExpiringJobs,
  useAdminNotificationRequests,
  useAdminRefundsNeeded,
} from "@/features/admin/hooks";
import { LanguageSwitcher } from "@/components/shared";
import { StatusBadge } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { BOOKING_STATUS_TONES } from "@/features/customer/types";
import { bookingRef, shortId } from "@/lib/utils";
import { useTranslation } from "@/i18n";
import { adminClock } from "@/features/admin/utils/admin-clock";

const PAGE_TITLE_KEYS: Record<string, string> = {
  "/dashboard": "dashboard.title",
  "/reports": "reports.title",
  "/audit": "audit.title",
  "/settings": "settings.title",
  "/profile": "profilePage.title",
};

export function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAdminAuth();
  const user = useAuthStore((s) => s.user);
  const { t } = useTranslation("admin");
  const [showEscalations, setShowEscalations] = useState(false);
  const [showTimeExt, setShowTimeExt] = useState(false);
  const [showExpiring, setShowExpiring] = useState(false);
  const [showRefunds, setShowRefunds] = useState(false);
  const [showNotificationRequests, setShowNotificationRequests] =
    useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeExtDropdownRef = useRef<HTMLDivElement>(null);
  const expiringDropdownRef = useRef<HTMLDivElement>(null);
  const refundsDropdownRef = useRef<HTMLDivElement>(null);
  const notificationRequestsDropdownRef = useRef<HTMLDivElement>(null);

  const timeExtNotifications = useUIStore((s) => s.timeExtNotifications);
  const setDrawerBookingId = useUIStore((s) => s.setDrawerBookingId);
  const toggleSidebarCollapsed = useUIStore((s) => s.toggleSidebarCollapsed);

  const { escalations } = useAdminEscalations();
  const escalationCount = escalations.length;

  const { jobs: expiringJobs } = useAdminExpiringJobs();
  const expiringCount = expiringJobs.length;

  // Ticks so the "minutes left" countdown in the expiring-soon dropdown stays
  // fresh.  useSyncExternalStore avoids hydration mismatch (server returns 0,
  // client returns Date.now()) and the lint error from calling setState
  // synchronously inside an effect body.
  const now = useSyncExternalStore(
    adminClock.subscribe,
    adminClock.getSnapshot,
    adminClock.getServerSnapshot,
  );

  const { refunds, total: refundsCount } = useAdminRefundsNeeded();

  const { requests: notificationRequests, total: notificationRequestsCount } =
    useAdminNotificationRequests();

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowEscalations(false);
      }
      if (
        timeExtDropdownRef.current &&
        !timeExtDropdownRef.current.contains(e.target as Node)
      ) {
        setShowTimeExt(false);
      }
      if (
        expiringDropdownRef.current &&
        !expiringDropdownRef.current.contains(e.target as Node)
      ) {
        setShowExpiring(false);
      }
      if (
        refundsDropdownRef.current &&
        !refundsDropdownRef.current.contains(e.target as Node)
      ) {
        setShowRefunds(false);
      }
      if (
        notificationRequestsDropdownRef.current &&
        !notificationRequestsDropdownRef.current.contains(e.target as Node)
      ) {
        setShowNotificationRequests(false);
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
    <header className='flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4'>
      {/* Left: hamburger + page title */}
      <div className='flex items-center gap-3'>
        <button
          type='button'
          onClick={toggleSidebarCollapsed}
          className='rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
          aria-label='Toggle sidebar'
        >
          <Menu className='h-4 w-4' />
        </button>
        <h1 className='text-base font-semibold text-foreground'>{pageTitle}</h1>
      </div>

      {/* Right: escalations + language + user + logout */}
      <div className='flex items-center gap-2'>
        {/* Time extension request bell */}
        <div ref={timeExtDropdownRef} className='relative'>
          <button
            type='button'
            onClick={() => setShowTimeExt((v) => !v)}
            className='relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            aria-label={t("navbar.timeExtAriaLabel")}
          >
            <Timer className='h-4 w-4' />
            {timeExtNotifications.length > 0 && (
              <span className='absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white'>
                {timeExtNotifications.length > 9
                  ? "9+"
                  : timeExtNotifications.length}
              </span>
            )}
          </button>

          {showTimeExt && (
            <div className='absolute right-0 top-full z-50 mt-1 w-72 rounded-lg border border-border bg-background shadow-lg'>
              <div className='border-b border-border px-4 py-2.5'>
                <p className='text-xs font-semibold text-foreground'>
                  {timeExtNotifications.length > 0
                    ? t(
                        timeExtNotifications.length === 1
                          ? "navbar.timeExtTitle"
                          : "navbar.timeExtTitlePlural",
                        { count: timeExtNotifications.length },
                      )
                    : t("navbar.noTimeExt")}
                </p>
              </div>
              {timeExtNotifications.length > 0 ? (
                <ul className='max-h-64 divide-y divide-border overflow-y-auto'>
                  {timeExtNotifications.map((n) => (
                    <li
                      key={n.bookingId}
                      role='button'
                      tabIndex={0}
                      onClick={() => {
                        setShowTimeExt(false);
                        setDrawerBookingId(n.bookingId);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setShowTimeExt(false);
                          setDrawerBookingId(n.bookingId);
                        }
                      }}
                      className='flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60'
                    >
                      <Timer className='h-4 w-4 shrink-0 text-amber-500' />
                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-sm font-semibold text-foreground'>
                          {shortId(n.bookingId)}
                        </p>
                        <p className='truncate text-xs text-muted-foreground'>
                          {t("timeExtension.toastTitle")}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className='px-4 py-6 text-center'>
                  <p className='text-sm text-muted-foreground'>
                    {t("navbar.noTimeExtDesc")}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Expiring-soon bell */}
        <div ref={expiringDropdownRef} className='relative'>
          <button
            type='button'
            onClick={() => setShowExpiring((v) => !v)}
            className='relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            aria-label={t("navbar.expiringAriaLabel")}
          >
            <AlarmClock className='h-4 w-4' />
            {expiringCount > 0 && (
              <span className='absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white'>
                {expiringCount > 9 ? "9+" : expiringCount}
              </span>
            )}
          </button>

          {showExpiring && (
            <div className='absolute right-0 top-full z-50 mt-1 w-72 rounded-lg border border-border bg-background shadow-lg'>
              <div className='border-b border-border px-4 py-2.5'>
                <p className='text-xs font-semibold text-foreground'>
                  {expiringCount > 0
                    ? t(
                        expiringCount === 1
                          ? "navbar.expiringTitle"
                          : "navbar.expiringTitlePlural",
                        { count: expiringCount },
                      )
                    : t("navbar.noExpiring")}
                </p>
              </div>
              {expiringJobs.length > 0 ? (
                <ul className='max-h-64 divide-y divide-border overflow-y-auto'>
                  {expiringJobs.map((job) => {
                    const minutesLeft = job.estimatedReadyAt
                      ? Math.max(
                          0,
                          Math.round(
                            (new Date(job.estimatedReadyAt).getTime() - now) /
                              60_000,
                          ),
                        )
                      : null;
                    return (
                      <li
                        key={job.id}
                        role='button'
                        tabIndex={0}
                        onClick={() => {
                          setShowExpiring(false);
                          setDrawerBookingId(job.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setShowExpiring(false);
                            setDrawerBookingId(job.id);
                          }
                        }}
                        className='flex cursor-pointer items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/60'
                      >
                        <div className='min-w-0'>
                          <p className='truncate text-sm font-semibold text-foreground'>
                            {bookingRef(job.reference, job.id)}
                          </p>
                          <p className='truncate text-xs text-muted-foreground'>
                            {job.plateText ?? "-"} · {job.siteName}
                            {job.slotText ? ` · ${job.slotText}` : ""}
                          </p>
                        </div>
                        <span className='shrink-0 text-xs font-semibold text-orange-600 dark:text-orange-400'>
                          {minutesLeft !== null
                            ? t("navbar.expiringMinutesLeft", {
                                minutes: minutesLeft,
                              })
                            : "—"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className='px-4 py-6 text-center'>
                  <p className='text-sm text-muted-foreground'>
                    {t("navbar.noExpiringDesc")}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Escalation bell */}
        <div ref={dropdownRef} className='relative'>
          <button
            type='button'
            onClick={() => setShowEscalations((v) => !v)}
            className='relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            aria-label={t("navbar.escalationsAriaLabel")}
          >
            <Bell className='h-4 w-4' />
            {escalationCount > 0 && (
              <span className='absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground'>
                {escalationCount > 9 ? "9+" : escalationCount}
              </span>
            )}
          </button>

          {/* Escalation dropdown */}
          {showEscalations && (
            <div className='absolute right-0 top-full z-50 mt-1 w-72 rounded-lg border border-border bg-background shadow-lg'>
              <div className='border-b border-border px-4 py-2.5'>
                <p className='text-xs font-semibold text-foreground'>
                  {escalationCount > 0
                    ? t("navbar.escalationsTitle", { count: escalationCount })
                    : t("navbar.noEscalations")}
                </p>
              </div>
              {escalations.length > 0 ? (
                <ul className='max-h-64 divide-y divide-border overflow-y-auto'>
                  {escalations.map((booking) => (
                    <li
                      key={booking.id}
                      role='button'
                      tabIndex={0}
                      onClick={() => {
                        setShowEscalations(false);
                        router.push(`/dashboard?bookingId=${booking.id}`);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setShowEscalations(false);
                          router.push(`/dashboard?bookingId=${booking.id}`);
                        }
                      }}
                      className='flex cursor-pointer items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/60'
                    >
                      <div className='min-w-0'>
                        <p className='truncate text-sm font-semibold text-foreground'>
                          {bookingRef(booking.reference, booking.id)}
                        </p>
                        <p className='truncate text-xs text-muted-foreground'>
                          {booking.plateText ?? "-"} · {booking.siteName}
                          {booking.slotText ? ` · ${booking.slotText}` : ""}
                        </p>
                      </div>
                      <StatusBadge
                        tone={BOOKING_STATUS_TONES[booking.status] ?? "neutral"}
                      >
                        {booking.status}
                      </StatusBadge>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className='px-4 py-6 text-center'>
                  <p className='text-sm text-muted-foreground'>
                    {t("navbar.noEscalationsDesc")}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Refund-needed bell */}
        <div ref={refundsDropdownRef} className='relative'>
          <button
            type='button'
            onClick={() => setShowRefunds((v) => !v)}
            className='relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            aria-label={t("navbar.refundsAriaLabel")}
          >
            <Undo2 className='h-4 w-4' />
            {refundsCount > 0 && (
              <span className='absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white'>
                {refundsCount > 9 ? "9+" : refundsCount}
              </span>
            )}
          </button>

          {showRefunds && (
            <div className='absolute right-0 top-full z-50 mt-1 w-72 rounded-lg border border-border bg-background shadow-lg'>
              <div className='border-b border-border px-4 py-2.5'>
                <p className='text-xs font-semibold text-foreground'>
                  {refundsCount > 0
                    ? t(
                        refundsCount === 1
                          ? "navbar.refundsTitle"
                          : "navbar.refundsTitlePlural",
                        { count: refundsCount },
                      )
                    : t("navbar.noRefunds")}
                </p>
              </div>
              {refunds.length > 0 ? (
                <>
                  <ul className='max-h-64 divide-y divide-border overflow-y-auto'>
                    {refunds.map((row) => (
                      <li
                        key={row.id}
                        role='button'
                        tabIndex={0}
                        onClick={() => {
                          setShowRefunds(false);
                          router.push(
                            "/reports/jobs?paymentStatus=needs_refund",
                          );
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setShowRefunds(false);
                            router.push(
                              "/reports/jobs?paymentStatus=needs_refund",
                            );
                          }
                        }}
                        className='flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60'
                      >
                        <Undo2 className='h-4 w-4 shrink-0 text-blue-500' />
                        <div className='min-w-0 flex-1'>
                          <p className='truncate text-sm font-semibold text-foreground'>
                            {bookingRef(row.reference, row.id)}
                          </p>
                          <p className='truncate text-xs text-muted-foreground'>
                            {row.plate ?? "-"} · {row.siteName ?? "-"}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div
                    role='button'
                    tabIndex={0}
                    onClick={() => {
                      setShowRefunds(false);
                      router.push("/reports/jobs?paymentStatus=needs_refund");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setShowRefunds(false);
                        router.push("/reports/jobs?paymentStatus=needs_refund");
                      }
                    }}
                    className='cursor-pointer border-t border-border px-4 py-2.5 text-center text-xs font-semibold text-primary hover:bg-muted/60'
                  >
                    {t("navbar.refundsSeeAll")}
                  </div>
                </>
              ) : (
                <div className='px-4 py-6 text-center'>
                  <p className='text-sm text-muted-foreground'>
                    {t("navbar.noRefundsDesc")}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notification-requested bell */}
        <div ref={notificationRequestsDropdownRef} className='relative'>
          <button
            type='button'
            onClick={() => setShowNotificationRequests((v) => !v)}
            className='relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            aria-label={t("navbar.notificationRequestsAriaLabel")}
          >
            <PhoneCall className='h-4 w-4' />
            {notificationRequestsCount > 0 && (
              <span className='absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white'>
                {notificationRequestsCount > 9
                  ? "9+"
                  : notificationRequestsCount}
              </span>
            )}
          </button>

          {showNotificationRequests && (
            <div className='absolute right-0 top-full z-50 mt-1 w-72 rounded-lg border border-border bg-background shadow-lg'>
              <div className='border-b border-border px-4 py-2.5'>
                <p className='text-xs font-semibold text-foreground'>
                  {notificationRequestsCount > 0
                    ? t(
                        notificationRequestsCount === 1
                          ? "navbar.notificationRequestsTitle"
                          : "navbar.notificationRequestsTitlePlural",
                        { count: notificationRequestsCount },
                      )
                    : t("navbar.noNotificationRequests")}
                </p>
              </div>
              {notificationRequests.length > 0 ? (
                <>
                  <ul className='max-h-64 divide-y divide-border overflow-y-auto'>
                    {notificationRequests.map((row) => (
                      <li
                        key={row.id}
                        role='button'
                        tabIndex={0}
                        onClick={() => {
                          setShowNotificationRequests(false);
                          setDrawerBookingId(row.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setShowNotificationRequests(false);
                            setDrawerBookingId(row.id);
                          }
                        }}
                        className='flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60'
                      >
                        <PhoneCall className='h-4 w-4 shrink-0 text-emerald-500' />
                        <div className='min-w-0 flex-1'>
                          <p className='truncate text-sm font-semibold text-foreground'>
                            {bookingRef(row.reference, row.id)}
                          </p>
                          <p className='truncate text-xs text-muted-foreground'>
                            {row.plate ?? "-"} · {row.phone ?? "-"}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div
                    role='button'
                    tabIndex={0}
                    onClick={() => {
                      setShowNotificationRequests(false);
                      router.push("/reports/jobs?hasPhone=true");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setShowNotificationRequests(false);
                        router.push("/reports/jobs?hasPhone=true");
                      }
                    }}
                    className='cursor-pointer border-t border-border px-4 py-2.5 text-center text-xs font-semibold text-primary hover:bg-muted/60'
                  >
                    {t("navbar.notificationRequestsSeeAll")}
                  </div>
                </>
              ) : (
                <div className='px-4 py-6 text-center'>
                  <p className='text-sm text-muted-foreground'>
                    {t("navbar.noNotificationRequestsDesc")}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <LanguageSwitcher />

        {/* Divider */}
        <div className='h-5 w-px bg-border' />

        {/* User profile */}
        <Link
          href='/profile'
          className='flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-muted'
        >
          <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary'>
            {avatarLetter}
          </div>
          <span className='hidden max-w-35 truncate text-xs text-muted-foreground sm:block'>
            {email}
          </span>
        </Link>

        {/* Logout */}
        <Button
          variant='ghost'
          size='sm'
          className='gap-1.5 text-muted-foreground hover:text-foreground'
          onClick={logout}
        >
          <LogOut className='h-3.5 w-3.5' />
          <span className='hidden text-xs sm:inline'>{t("common.logout")}</span>
        </Button>
      </div>
    </header>
  );
}
