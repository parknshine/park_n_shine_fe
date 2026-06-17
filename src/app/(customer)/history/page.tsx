"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ClipboardList } from "lucide-react";
import { useCustomerAuthStore } from "@/store/customer-auth-store";
import { useCustomerBookings } from "@/features/customer/hooks/use-customer-bookings";
import { useTranslation } from "@/i18n";
import { Button } from "@/components/ui/button";

type TabId = "cuci" | "pembayaran" | "terjadwal";
type StatusKind = "ok" | "fail" | "pending";

const DONE = new Set(["READY", "CLOSED"]);
const FAIL = new Set(["CANCELLED", "EXPIRED"]);

function statusKind(s: string): StatusKind {
  if (DONE.has(s)) return "ok";
  if (FAIL.has(s)) return "fail";
  return "pending";
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  PENDING: "Menunggu Bayar",
  CONFIRMED: "Terkonfirmasi",
  IN_PROGRESS: "Sedang Cuci",
  READY: "Selesai",
  CLOSED: "Selesai",
  CANCELLED: "Dibatalkan",
  EXPIRED: "Kadaluarsa",
  NEEDS_HELP: "Butuh Bantuan",
};

const KIND_STYLE: Record<StatusKind, { color: string; bg: string }> = {
  ok: { color: "#1f8a5b", bg: "#e7f5ee" },
  fail: { color: "#ef4444", bg: "#fdeaea" },
  pending: { color: "#a07c00", bg: "#fff3d6" },
};

function fmtPrice(price: number): string {
  if (!price) return "—";
  if (price >= 1_000_000) {
    const n = price / 1_000_000;
    return `Rp${n % 1 === 0 ? n : n.toFixed(1)}jt`;
  }
  return `Rp${Math.round(price / 1_000)}rb`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

function shortId(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}-${id.slice(8, 12).toUpperCase()}-${id.slice(12, 16).toUpperCase()}`;
}

function DropletSVG({ color }: Readonly<{ color: string }>) {
  return (
    <svg
      width='22'
      height='22'
      viewBox='0 0 24 24'
      fill='none'
      stroke={color}
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M12 2.7C12 2.7 5 9.6 5 14.5a7 7 0 0 0 14 0C19 9.6 12 2.7 12 2.7z' />
    </svg>
  );
}

function CardSVG({ color }: Readonly<{ color: string }>) {
  return (
    <svg
      width='22'
      height='22'
      viewBox='0 0 24 24'
      fill='none'
      stroke={color}
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M3 10h18' />
      <path d='M5 6h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z' />
    </svg>
  );
}

function CalSVG({ color }: Readonly<{ color: string }>) {
  return (
    <svg
      width='22'
      height='22'
      viewBox='0 0 24 24'
      fill='none'
      stroke={color}
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M8 2v4M16 2v4M3 10h18' />
      <path d='M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z' />
    </svg>
  );
}

const TABS: { id: TabId; label: string }[] = [
  { id: "cuci", label: "Cuci" },
  { id: "pembayaran", label: "Pembayaran" },
  { id: "terjadwal", label: "Terjadwal" },
];

export default function HistoryPage() {
  const router = useRouter();
  const { t } = useTranslation("customer");
  const [activeTab, setActiveTab] = useState<TabId>("cuci");
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useCustomerAuthStore((s) => s._hasHydrated);
  const { data, isLoading, isFetching, fetchNextPage, hasNextPage } = useCustomerBookings(isAuthenticated);
  const HIDDEN_STATUSES = new Set(["PENDING", "DRAFT"]);
  const bookings = (data?.pages.flatMap((p) => p.items) ?? []).filter(
    (b) => !HIDDEN_STATUSES.has(b.status),
  );

  const sentinelRef = useRef<HTMLDivElement>(null);
  const canFetchRef = useRef(false);

  useEffect(() => {
    canFetchRef.current = hasNextPage && !isFetching;
  }, [hasNextPage, isFetching]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && canFetchRef.current) {
          canFetchRef.current = false;
          fetchNextPage();
        }
      },
      { rootMargin: "100px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage]);

  if (!hasHydrated || isLoading || (data === undefined && isFetching)) {
    return (
      <div className='flex min-h-[60vh] items-center justify-center'>
        <Loader2
          className='h-8 w-8 animate-spin'
          style={{ color: "#006289" }}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className='mx-auto max-w-md flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center'>
        <ClipboardList className='h-12 w-12 text-muted-foreground/40' />
        <p className='text-sm text-muted-foreground'>
          {t("history.authPrompt")}
        </p>
        <Button className='rounded-full' onClick={() => router.push("/login")}>
          {t("history.loginCta")}
        </Button>
      </div>
    );
  }

  if (bookings.length === 0 && !isLoading && !isFetching) {
    return (
      <div className='mx-auto max-w-md flex flex-col items-center justify-center min-h-[60vh] gap-3 px-4 text-center'>
        <ClipboardList className='h-12 w-12 text-muted-foreground/40' />
        <p className='text-sm text-muted-foreground'>{t("history.empty")}</p>
        <Button
          variant='outline'
          className='rounded-full'
          onClick={() => router.push("/book/capture")}
        >
          Mulai Cuci Pertama
        </Button>
      </div>
    );
  }

  const payItems = bookings.filter((b) => b.price > 0);
  const activeItems = bookings.filter(
    (b) => !DONE.has(b.status) && !FAIL.has(b.status),
  );
  let items = bookings;
  if (activeTab === "pembayaran") items = payItems;
  else if (activeTab === "terjadwal") items = activeItems;

  const totalSpent = bookings.reduce((s, b) => s + b.price, 0);
  const doneCount = bookings.filter((b) => DONE.has(b.status)).length;

  const summaryMap: Record<
    TabId,
    { count: string; countLabel: string; total: string; totalLabel: string }
  > = {
    cuci: {
      count: String(bookings.length),
      countLabel: "Total cuci",
      total: fmtPrice(totalSpent),
      totalLabel: "Total belanja",
    },
    pembayaran: {
      count: String(payItems.length),
      countLabel: "Transaksi",
      total: fmtPrice(payItems.reduce((s, b) => s + b.price, 0)),
      totalLabel: "Total dibayar",
    },
    terjadwal: {
      count: String(activeItems.length),
      countLabel: "Terjadwal",
      total: String(doneCount),
      totalLabel: "Selesai",
    },
  };
  const summary = summaryMap[activeTab];

  return (
    <div className='min-h-screen' style={{ background: "#eff8fe" }}>
      {/* top wash gradient */}
      <div
        className='pointer-events-none absolute inset-x-0 top-0 h-60'
        style={{
          background:
            "radial-gradient(120% 90% at 100% 0%, #cdeafd 0%, rgba(205,234,253,0) 58%), radial-gradient(110% 70% at 0% 0%, #fdf2cf 0%, rgba(253,242,207,0) 40%), linear-gradient(180deg, #f3fafe 0%, #eff8fe 100%)",
        }}
      />

      <div className='relative mx-auto max-w-md'>
        {/* ── Header ── */}
        <div className='px-5 pb-3.5'>
          <h1
            className='mb-4 font-extrabold'
            style={{ fontSize: 25, letterSpacing: "-0.02em", color: "#273034" }}
          >
            {t("bottomNav.history")}
          </h1>

          {/* Segmented tabs */}
          <div
            className='flex gap-1 p-1 rounded-[16px] border'
            style={{
              background: "rgba(255,255,255,0.65)",
              borderColor: "rgba(111,120,125,0.14)",
              backdropFilter: "blur(6px)",
            }}
          >
            {TABS.map((seg) => {
              const active = activeTab === seg.id;
              return (
                <button
                  key={seg.id}
                  type='button'
                  onClick={() => setActiveTab(seg.id)}
                  className='flex-1 h-[42px] rounded-[12px] text-[13.5px] font-bold border-0 cursor-pointer transition-all duration-[180ms]'
                  style={{
                    fontFamily: "inherit",
                    background: active ? "#fff" : "transparent",
                    color: active ? "#006289" : "#5a666d",
                    boxShadow: active
                      ? "0 6px 16px rgba(0,98,137,0.12)"
                      : "none",
                  }}
                >
                  {seg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Scroll body ── */}
        <div className='px-5 pb-6 [&::-webkit-scrollbar]:w-0'>
          {/* Summary strip */}
          <div className='flex gap-2.5 mb-4'>
            <div
              className='flex-1 bg-white rounded-[16px] px-[15px] py-[13px]'
              style={{ boxShadow: "0 12px 28px rgba(0,98,137,0.06)" }}
            >
              <div
                className='font-extrabold'
                style={{
                  fontSize: 22,
                  letterSpacing: "-0.02em",
                  color: "#006289",
                }}
              >
                {summary.count}
              </div>
              <div
                className='font-semibold mt-0.5'
                style={{ fontSize: 11.5, color: "#5a666d" }}
              >
                {summary.countLabel}
              </div>
            </div>
            <div
              className='flex-1 bg-white rounded-[16px] px-[15px] py-[13px]'
              style={{ boxShadow: "0 12px 28px rgba(0,98,137,0.06)" }}
            >
              <div
                className='font-extrabold'
                style={{
                  fontSize: 22,
                  letterSpacing: "-0.02em",
                  color: "#273034",
                }}
              >
                {summary.total}
              </div>
              <div
                className='font-semibold mt-0.5'
                style={{ fontSize: 11.5, color: "#5a666d" }}
              >
                {summary.totalLabel}
              </div>
            </div>
          </div>

          {/* Item list */}
          <div className='flex flex-col gap-3'>
            {items.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 gap-2'>
                <ClipboardList
                  className='h-10 w-10'
                  style={{ color: "#c2ccd1" }}
                />
                <p
                  className='text-sm font-semibold'
                  style={{ color: "#9aa6ad" }}
                >
                  Belum ada data
                </p>
              </div>
            ) : (
              items.map((booking) => {
                const kind = statusKind(booking.status);
                const st = KIND_STYLE[kind];

                let iconEl: React.ReactNode;
                let tint: string;
                let title: string;
                let subtitle: string;
                let amount: string;
                let amountColor: string;

                if (activeTab === "cuci") {
                  iconEl = <DropletSVG color='#006289' />;
                  tint = "#e8f2f9";
                  title = booking.plate ?? "—";
                  subtitle = booking.paymentMethod ?? t("history.noPayment");
                  amount = fmtPrice(booking.price);
                  amountColor = "#273034";
                } else if (activeTab === "pembayaran") {
                  iconEl = <CardSVG color='#514eb6' />;
                  tint = "#f1f0fb";
                  title = booking.paymentMethod ?? "Tidak diketahui";
                  subtitle = booking.plate ?? "—";
                  amount = booking.price ? `-${fmtPrice(booking.price)}` : "—";
                  amountColor = kind === "fail" ? "#ef4444" : "#273034";
                  // amountColor already set above — no nested ternary
                } else {
                  iconEl = <CalSVG color='#a07c00' />;
                  tint = "#fff3d6";
                  title = booking.plate ?? "—";
                  subtitle = booking.site?.name ?? "—";
                  amount = STATUS_LABEL[booking.status] ?? booking.status;
                  amountColor = "#a07c00";
                }

                return (
                  <button
                    key={booking.id}
                    type='button'
                    onClick={() =>
                      router.push(
                        `/booking/${booking.id}/status?token=${booking.bookingToken}`,
                      )
                    }
                    className='w-full text-left border-0 cursor-pointer bg-white rounded-[18px] p-4'
                    style={{
                      boxShadow: "0 14px 32px rgba(0,98,137,0.07)",
                      fontFamily: "inherit",
                    }}
                  >
                    {/* row 1: code + status */}
                    <div className='flex items-center justify-between gap-2.5 mb-3'>
                      <span
                        className='text-[11px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap'
                        style={{
                          color: "#9aa6ad",
                          fontFamily: "ui-monospace, 'SF Mono', monospace",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {shortId(booking.id)}
                      </span>
                      <span
                        className='flex-shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold px-[11px] py-[5px] rounded-full'
                        style={{ color: st.color, background: st.bg }}
                      >
                        <span
                          className='w-1.5 h-1.5 rounded-full flex-shrink-0'
                          style={{ background: st.color }}
                        />
                        {STATUS_LABEL[booking.status] ?? booking.status}
                      </span>
                    </div>

                    {/* row 2: icon + main info + amount/date */}
                    <div className='flex items-center gap-3.5'>
                      <div
                        className='w-[46px] h-[46px] rounded-[14px] flex items-center justify-center flex-shrink-0'
                        style={{ background: tint }}
                      >
                        {iconEl}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div
                          className='font-extrabold truncate'
                          style={{
                            fontSize: 16,
                            letterSpacing: "-0.01em",
                            color: "#273034",
                          }}
                        >
                          {title}
                        </div>
                        <div
                          className='mt-0.5 truncate'
                          style={{ fontSize: 12.5, color: "#5a666d" }}
                        >
                          {subtitle}
                        </div>
                      </div>
                      <div className='text-right flex-shrink-0'>
                        <div
                          className='font-extrabold'
                          style={{ fontSize: 14, color: amountColor }}
                        >
                          {amount}
                        </div>
                        <div
                          className='mt-0.5'
                          style={{ fontSize: 11, color: "#9aa6ad" }}
                        >
                          {fmtDate(booking.createdAt)}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* infinite scroll sentinel */}
          <div ref={sentinelRef} />

          {/* load-more spinner */}
          {isFetching && !isLoading && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#006289" }} />
            </div>
          )}

          <div className='h-2' />
        </div>
      </div>
    </div>
  );
}
