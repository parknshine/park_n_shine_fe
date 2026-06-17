"use client";

import { useRouter } from "next/navigation";
import {
  Calendar,
  HelpCircle,
  MapPin,
  Phone,
  ChevronRight,
  Droplets,
} from "lucide-react";
import { useCustomerAuthStore } from "@/store/customer-auth-store";
import { usePublicSites } from "@/features/customer/hooks/use-public-sites";
import { useCustomerBookings } from "@/features/customer/hooks/use-customer-bookings";
import { useCustomerHome } from "@/features/customer/hooks/use-customer-home";
import { ActiveBookingCard } from "@/features/customer/components/active-booking-card";
import type { BookingStatus } from "@/features/customer/types";
import { useTranslation } from "@/i18n";
import { Button } from "@/components/ui/button";

const ACTIVE_STATUSES: BookingStatus[] = [
  "PAID",
  "ASSIGNED",
  "LOCATED",
  "IN_PROGRESS",
  "NEEDS_HELP",
];

const ACTIVE_STATUS_LABEL_KEYS: Record<string, string> = {
  PAID: "home.activeBookingStatusPaid",
  ASSIGNED: "home.activeBookingStatusAssigned",
  LOCATED: "home.activeBookingStatusLocated",
  IN_PROGRESS: "home.activeBookingStatusInProgress",
  NEEDS_HELP: "home.activeBookingStatusNeedsHelp",
};

export default function HomePage() {
  const router = useRouter();
  const { t } = useTranslation("customer");
  const customer = useCustomerAuthStore((s) => s.customer);
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  const { sites } = usePublicSites();

  const { data: bookingsData } = useCustomerBookings(isAuthenticated);
  const { data: homeData } = useCustomerHome(isAuthenticated);

  const activeBookings = (bookingsData?.pages.flatMap((p) => p.items) ?? []).filter(
    (b) => ACTIVE_STATUSES.includes(b.status as BookingStatus),
  );

  const initials = customer?.name
    ? customer.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const quickActions = [
    {
      label: t("home.actionBooking"),
      icon: Calendar,
      tint: "#e8f2f9",
      color: "#006289",
      onClick: () => router.push("/book/capture"),
    },
    {
      label: t("home.actionBantuan"),
      icon: HelpCircle,
      tint: "#f1f0fb",
      color: "#514eb6",
      onClick: () => {},
    },
  ];

  if (!isAuthenticated) {
    return (
      <div className='min-h-full bg-[#eff8fe]'>
        <div className='px-5 pb-24 pt-2 space-y-5'>
          <div className='mb-2'>
            <div className='text-[13px] font-semibold text-[#5a666d] mb-1'>
              {t("home.greetingLine1")}
            </div>
            <h1 className='text-[25px] font-extrabold tracking-tight text-[#273034]'>
              {t("home.guestHeading")}
            </h1>
          </div>

          {/* Quick actions */}
          <div>
            <div className='text-[13px] font-extrabold tracking-wide text-[#273034] mb-3'>
              {t("home.quickActionsTitle")}
            </div>
            <div className='grid grid-cols-3 gap-2.5'>
              {quickActions.map(
                ({ label, icon: Icon, tint, color, onClick }) => (
                  <button
                    key={label}
                    type='button'
                    onClick={onClick}
                    className='border border-black/[0.06] bg-white rounded-2xl px-2 py-4 flex flex-col items-center gap-[9px] cursor-pointer'
                    style={{ boxShadow: "0 10px 26px rgba(0,98,137,0.05)" }}
                  >
                    <div
                      className='w-10 h-10 rounded-xl flex items-center justify-center'
                      style={{ background: tint, color }}
                    >
                      <Icon className='w-5 h-5' strokeWidth={2} />
                    </div>
                    <span className='text-xs font-bold text-[#273034]'>
                      {label}
                    </span>
                  </button>
                ),
              )}
            </div>
          </div>

          <div className='flex flex-col gap-3 pt-2'>
            <Button
              className='w-full rounded-full'
              onClick={() => router.push("/login")}
            >
              {t("home.guestLoginCta")}
            </Button>
            <Button
              variant='outline'
              className='w-full rounded-full'
              onClick={() => router.push("/book/capture")}
            >
              {t("home.guestWashCta")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-full bg-[#eff8fe]'>
      {/* Scrollable content */}
      <div className='px-5 pb-24 pt-2 space-y-4'>
        {/* Header */}
        <div className='flex items-start justify-between mb-6'>
          <div>
            <div className='text-[13px] font-semibold text-[#5a666d] mb-1'>
              {t("home.greetingLine1")}
            </div>
            <h1 className='text-[25px] font-extrabold tracking-tight text-[#273034]'>
              {t("home.greetingLine2")}, {customer?.name?.split(" ")[0]}
            </h1>
          </div>
          <button
            type='button'
            onClick={() => router.push("/account")}
            aria-label={t("account.title")}
            className='w-[46px] h-[46px] rounded-2xl text-white font-extrabold text-base flex items-center justify-center shrink-0'
            style={{
              background: "linear-gradient(135deg, #006289, #1db1f1)",
              boxShadow: "0 10px 22px rgba(0,98,137,0.28)",
            }}
          >
            {initials}
          </button>
        </div>

        {/* Hero stat card */}
        <div
          className='relative rounded-[22px] p-[22px] text-white overflow-hidden'
          style={{
            background:
              "linear-gradient(135deg, #006289 0%, #075f87 45%, #1db1f1 100%)",
            boxShadow: "0 20px 44px rgba(0,98,137,0.30)",
          }}
        >
          <div className='absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10' />
          <div className='absolute right-8 -bottom-10 w-24 h-24 rounded-full bg-white/[0.06]' />
          <div className='relative flex items-center justify-between'>
            <div>
              <div className='text-[12px] font-bold tracking-[0.08em] opacity-80 mb-2 uppercase'>
                {t("home.washCountLabel")}
              </div>
              <div className='flex items-baseline gap-2'>
                <span className='text-[46px] font-extrabold leading-none tracking-tight'>
                  {homeData?.washCount ?? customer?.washCount ?? 0}
                </span>
                <span className='text-[15px] font-semibold opacity-90'>
                  {t("home.washCountUnit")}
                </span>
              </div>
            </div>
            <div className='w-[58px] h-[58px] rounded-[18px] bg-white/[0.16] flex items-center justify-center'>
              <Droplets
                className='w-[30px] h-[30px] text-white'
                strokeWidth={1.8}
              />
            </div>
          </div>
        </div>

        {/* Active booking shortcut */}
        {activeBookings.length > 0 && (
          <div>
            <div className='text-[13px] font-extrabold tracking-wide text-[#273034] mb-3'>
              {t("home.activeBookingTitle")} ({activeBookings.length})
            </div>
            <div className='flex flex-col gap-2.5'>
              {activeBookings.map((b) => (
                <ActiveBookingCard
                  key={b.id}
                  bookingId={b.id}
                  signedToken={b.bookingToken}
                  plate={b.plate ?? "—"}
                  siteName={b.site?.name ?? "—"}
                  statusLabel={t(ACTIVE_STATUS_LABEL_KEYS[b.status] ?? "")}
                  ctaLabel={t("home.activeBookingCta")}
                />
              ))}
            </div>
          </div>
        )}

        {/* Phone completion alert */}
        {customer?.phone === null && (
          <div className='flex items-center gap-3 px-4 py-[14px] rounded-2xl bg-[#fff7e0] border border-yellow-200/80'>
            <div className='w-10 h-10 rounded-xl bg-[#fdd34d] flex items-center justify-center shrink-0'>
              <Phone className='w-5 h-5 text-[#5c4900]' strokeWidth={2} />
            </div>
            <div className='flex-1 min-w-0'>
              <div className='text-sm font-bold text-[#5c4900]'>
                {t("home.completePhoneTitle")}
              </div>
              <div className='text-[12.5px] text-[#8a6d18]'>
                {t("home.completePhoneDesc")}
              </div>
            </div>
            <button
              type='button'
              onClick={() => router.push("/account")}
              className='text-[13px] font-bold text-[#006289] flex items-center gap-0.5 shrink-0 border-0 bg-transparent p-0'
            >
              {t("home.completePhoneFill")}
              <ChevronRight className='w-3.5 h-3.5' strokeWidth={2.4} />
            </button>
          </div>
        )}

        {/* Quick actions */}
        <div>
          <div className='text-[13px] font-extrabold tracking-wide text-[#273034] mb-3'>
            {t("home.quickActionsTitle")}
          </div>
          <div className='grid grid-cols-3 gap-2.5'>
            {quickActions.map(({ label, icon: Icon, tint, color, onClick }) => (
              <button
                key={label}
                type='button'
                onClick={onClick}
                className='border border-black/[0.06] bg-white rounded-2xl px-2 py-4 flex flex-col items-center gap-[9px] cursor-pointer'
                style={{ boxShadow: "0 10px 26px rgba(0,98,137,0.05)" }}
              >
                <div
                  className='w-10 h-10 rounded-xl flex items-center justify-center'
                  style={{ background: tint, color }}
                >
                  <Icon className='w-5 h-5' strokeWidth={2} />
                </div>
                <span className='text-xs font-bold text-[#273034]'>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Nearby locations */}
        {sites.length > 0 && (
          <div>
            <div className='mb-3'>
              <span className='text-[13px] font-extrabold tracking-wide text-[#273034]'>
                {t("home.nearbyTitle")}
              </span>
            </div>
            <div className='flex flex-col gap-2.5'>
              {sites.map((site) => (
                <button
                  key={site.id}
                  type='button'
                  onClick={() => router.push(`/book/capture?siteId=${site.id}`)}
                  className='w-full text-left bg-white rounded-2xl px-[15px] py-[13px] flex items-center gap-[13px] border-0 cursor-pointer'
                  style={{ boxShadow: "0 10px 26px rgba(0,98,137,0.05)" }}
                >
                  <div className='w-[42px] h-[42px] rounded-xl bg-[#e8f2f9] flex items-center justify-center text-[#006289] shrink-0'>
                    <MapPin className='w-5 h-5' strokeWidth={2} />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='text-sm font-bold text-[#273034]'>
                      {site.name}
                    </div>
                    <div className='text-xs text-[#5a666d] truncate'>
                      {site.address}
                    </div>
                  </div>
                  <ChevronRight
                    className='w-[18px] h-[18px] shrink-0'
                    style={{ color: "#c2ccd1" }}
                    strokeWidth={2.4}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
