"use client";

import QRCode from "react-qr-code";
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  Copy,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Wallet,
} from "lucide-react";
import { useTranslation } from "@/i18n";
import { useBookingStatus } from "@/features/customer/hooks/use-booking-status";
import { useCheckPayment } from "@/features/customer/hooks/use-check-payment";
import { usePaymentAutoPoll } from "@/features/customer/hooks/use-payment-auto-poll";
import { useChargePayment } from "@/features/customer/hooks/use-charge-payment";
import { BOOKING_STATUSES } from "@/features/customer/types";
import { resolvePayPageAction } from "@/features/customer/utils/pay-page-action";
import { openDeeplink } from "@/features/customer/utils/open-deeplink";
import { BookingExpiredModal } from "@/features/customer/components/booking-expired-modal";
import { AppShell } from "@/components/shared";
import type { PaymentInstructions } from "@/features/customer/types";

type TFunction = (key: string) => string;

const IS_SNAP_MODE =
  process.env.NEXT_PUBLIC_SKIP_PAYMENT_METHOD_SELECTION === "true";

// SNAP mode ignores the paymentMethod value server-side (Midtrans Snap
// bundles all channels), but the /charge endpoint still requires a valid one.
const SNAP_AUTO_CHARGE_METHOD = "QRIS";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isExpired(expiryTime: string): boolean {
  return new Date(expiryTime.replace(/\s/, "T")) < new Date();
}

function formatExpiry(expiryTime: string): string {
  const d = new Date(expiryTime.replace(/\s/, "T"));
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ value, t }: Readonly<{ value: string; t: TFunction }>) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    void navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={handleCopy}
      className={[
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0",
        copied
          ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
          : "bg-muted border border-border text-primary",
      ].join(" ")}
    >
      {copied ? (
        <>
          <CheckCircle className='w-3.5 h-3.5' />
          {t("booking.payment.copied")}
        </>
      ) : (
        <>
          <Copy className='w-3.5 h-3.5' />
          {t("booking.payment.copy")}
        </>
      )}
    </button>
  );
}

// ─── Info row (label + value + optional copy) ─────────────────────────────────

function InfoRow({
  label,
  value,
  mono = false,
  copyValue,
  t,
}: Readonly<{
  label: string;
  value: string;
  mono?: boolean;
  copyValue?: string;
  t: TFunction;
}>) {
  return (
    <div className='flex items-center justify-between gap-3 px-4 py-3.5'>
      <div className='flex-1 min-w-0'>
        <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5'>
          {label}
        </p>
        <p
          className={[
            "font-bold text-foreground break-all",
            mono ? "font-mono text-lg tracking-widest" : "text-base",
          ].join(" ")}
        >
          {value}
        </p>
      </div>
      {copyValue && <CopyButton value={copyValue} t={t} />}
    </div>
  );
}

// ─── Expiry badge ─────────────────────────────────────────────────────────────

function ExpiryBadge({ expiryTime, t }: { expiryTime: string; t: TFunction }) {
  return (
    <div className='flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl'>
      <AlertCircle className='w-3.5 h-3.5 text-amber-500 shrink-0' />
      <p className='text-xs text-amber-700 font-medium'>
        {t("booking.payment.validUntil")}{" "}
        <span className='font-semibold'>{formatExpiry(expiryTime)}</span>
      </p>
    </div>
  );
}

// ─── E-Wallet deeplink with fallback ──────────────────────────────────────────

const EWALLET_STORE_URLS: Record<string, { android: string; ios: string }> = {
  gopay: {
    android: "https://play.google.com/store/apps/details?id=com.gojek.gopay",
    ios: "https://apps.apple.com/id/app/gojek/id944875099",
  },
  shopeepay: {
    android: "https://play.google.com/store/apps/details?id=com.shopee.id",
    ios: "https://apps.apple.com/id/app/shopee/id959919760",
  },
};

function detectPlatform(): "android" | "ios" | "other" {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("android")) return "android";
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  return "other";
}

function getStoreUrl(
  provider: string,
  platform: "android" | "ios" | "other",
): string | null {
  const key = provider.toLowerCase().replace(/\s/g, "");
  const urls = EWALLET_STORE_URLS[key];
  if (!urls) return null;
  return platform === "ios" ? urls.ios : urls.android;
}

function EwalletDeeplinkCard({
  provider,
  deepLinkUrl,
  expiryTime,
  t,
}: Readonly<{
  provider: string;
  deepLinkUrl: string;
  expiryTime: string;
  t: TFunction;
}>) {
  const [showFallback, setShowFallback] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  function handleOpenApp() {
    setIsOpening(true);
    setShowFallback(false);
    openDeeplink(deepLinkUrl, () => {
      setShowFallback(true);
      setIsOpening(false);
    });
  }

  const platform = detectPlatform();
  const storeUrl = getStoreUrl(provider, platform);

  if (showFallback) {
    return (
      <div className='flex flex-col gap-3'>
        <div className='bg-card rounded-2xl border border-amber-200 shadow-sm p-6 flex flex-col items-center gap-4 text-center'>
          <div className='w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center'>
            <AlertCircle className='w-7 h-7 text-amber-500' />
          </div>
          <div>
            <p className='font-semibold text-foreground mb-1'>
              {t("booking.payment.appNotOpened")}
            </p>
            <p className='text-sm text-muted-foreground'>
              {t("booking.payment.appNotOpenedDesc")}
            </p>
          </div>
          <button
            onClick={handleOpenApp}
            className='w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors'
          >
            {t("booking.payment.retryOpenApp")}
          </button>
          {storeUrl && (
            <a
              href={storeUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='w-full py-3 rounded-xl border border-border text-primary text-sm font-semibold text-center hover:bg-muted transition-colors'
            >
              {t("booking.payment.downloadApp")}
            </a>
          )}
        </div>
        <ExpiryBadge expiryTime={expiryTime} t={t} />
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-3'>
      <div className='bg-primary rounded-2xl p-6 flex flex-col items-center gap-4 text-center'>
        <div className='w-14 h-14 rounded-full bg-primary-foreground/10 flex items-center justify-center'>
          <Wallet className='w-7 h-7 text-primary-foreground' />
        </div>
        <div>
          <p className='font-semibold text-primary-foreground mb-1'>
            {t("booking.payment.completeIn")} {provider}
          </p>
          <p className='text-sm text-primary-foreground/70'>
            {t("booking.payment.openApp")}{" "}
            <span className='font-semibold text-primary-foreground'>
              {provider}
            </span>{" "}
            {t("booking.payment.andComplete")}
          </p>
        </div>
        <button
          onClick={handleOpenApp}
          disabled={isOpening}
          className='w-full py-3 rounded-xl bg-primary-foreground text-primary text-sm font-semibold text-center hover:bg-primary-foreground/90 disabled:opacity-70 transition-colors'
        >
          {isOpening
            ? t("booking.payment.openingApp")
            : `${t("booking.payment.openProvider")} ${provider}`}
        </button>
      </div>
      <ExpiryBadge expiryTime={expiryTime} t={t} />
    </div>
  );
}

// ─── Payment instruction variants ────────────────────────────────────────────

function PaymentInstructionsUI({
  instructions,
  onChangeMethod,
  canChangeMethod,
  t,
}: Readonly<{
  instructions: PaymentInstructions;
  onChangeMethod: () => void;
  canChangeMethod: boolean;
  t: TFunction;
}>) {
  const expired =
    "expiryTime" in instructions && isExpired(instructions.expiryTime);

  if (expired) {
    return (
      <div className='bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col items-center gap-4 text-center'>
        <div className='w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center'>
          <AlertCircle className='w-7 h-7 text-amber-500' />
        </div>
        <div>
          <p className='font-semibold text-foreground mb-1'>
            {t("booking.payment.expiredTitle")}
          </p>
          <p className='text-sm text-muted-foreground'>
            {t("booking.payment.expiredDesc")}
          </p>
        </div>
        {canChangeMethod && (
          <button
            onClick={onChangeMethod}
            className='w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors'
          >
            {t("booking.payment.changeMethod")}
          </button>
        )}
      </div>
    );
  }

  // ── Virtual Account ──
  if (instructions.type === "VA") {
    return (
      <div className='flex flex-col gap-3'>
        <div className='bg-card rounded-2xl border border-border shadow-sm overflow-hidden'>
          <InfoRow
            label={t("booking.payment.bankLabel")}
            value={instructions.bank}
            t={t}
          />
          <div className='border-t border-border'>
            <InfoRow
              label={t("booking.payment.vaLabel")}
              value={instructions.vaNumber}
              mono
              copyValue={instructions.vaNumber}
              t={t}
            />
          </div>
        </div>
        <ExpiryBadge expiryTime={instructions.expiryTime} t={t} />
      </div>
    );
  }

  // ── Mandiri echannel ──
  if (instructions.type === "MANDIRI") {
    return (
      <div className='flex flex-col gap-3'>
        <div className='bg-card rounded-2xl border border-border shadow-sm overflow-hidden'>
          <InfoRow
            label={t("booking.payment.companyCodeLabel")}
            value={instructions.companyCode}
            mono
            copyValue={instructions.companyCode}
            t={t}
          />
          <div className='border-t border-border'>
            <InfoRow
              label={t("booking.payment.billCodeLabel")}
              value={instructions.billCode}
              mono
              copyValue={instructions.billCode}
              t={t}
            />
          </div>
        </div>
        <ExpiryBadge expiryTime={instructions.expiryTime} t={t} />
      </div>
    );
  }

  // ── QRIS ──
  if (instructions.type === "QRIS") {
    const isImageUrl = instructions.qrString.startsWith("http");
    return (
      <div className='flex flex-col items-center gap-3'>
        <div className='bg-card rounded-2xl border border-border shadow-sm p-5'>
          {isImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={instructions.qrString}
              alt='QRIS QR Code'
              className='w-56 h-56 object-contain'
            />
          ) : (
            <div className='bg-white p-4 rounded-lg'>
              <QRCode value={instructions.qrString} size={192} />
            </div>
          )}
        </div>
        <p className='text-xs text-muted-foreground font-medium text-center'>
          {t("booking.payment.scanQris")}
        </p>
        <ExpiryBadge expiryTime={instructions.expiryTime} t={t} />
      </div>
    );
  }

  // ── Snap redirect ──
  if (instructions.type === "REDIRECT") {
    return (
      <div className='bg-primary rounded-2xl p-6 flex flex-col items-center gap-4 text-center'>
        <div className='w-14 h-14 rounded-full bg-primary-foreground/10 flex items-center justify-center'>
          <Wallet className='w-7 h-7 text-primary-foreground' />
        </div>
        <div>
          <p className='font-semibold text-primary-foreground mb-1'>
            {t("booking.payment.completePayment")}
          </p>
          <p className='text-sm text-primary-foreground/70'>
            {t("booking.payment.completePaymentDesc")}
          </p>
        </div>
        <a
          href={instructions.redirectUrl}
          className='w-full py-3 rounded-xl bg-primary-foreground text-primary text-sm font-semibold text-center hover:bg-primary-foreground/90 transition-colors'
        >
          {t("booking.payment.pay")}
        </a>
      </div>
    );
  }

  // ── E-Wallet deeplink ──
  if (instructions.type === "EWALLET") {
    return (
      <EwalletDeeplinkCard
        provider={instructions.provider}
        deepLinkUrl={instructions.deepLinkUrl}
        expiryTime={instructions.expiryTime}
        t={t}
      />
    );
  }

  return null;
}

// ─── Charge failed ────────────────────────────────────────────────────────────

function ChargeFailedCard({
  chargeError,
  isCharging,
  onRetry,
  t,
}: Readonly<{
  chargeError: string;
  isCharging: boolean;
  onRetry: () => void;
  t: TFunction;
}>) {
  return (
    <div className='bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col items-center gap-4 text-center'>
      <div className='w-14 h-14 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center'>
        <AlertCircle className='w-7 h-7 text-destructive' />
      </div>
      <div>
        <p className='font-semibold text-foreground mb-1'>
          {t("booking.payment.chargeFailedTitle")}
        </p>
        <p className='text-sm text-muted-foreground'>{chargeError}</p>
      </div>
      <button
        type='button'
        onClick={onRetry}
        disabled={isCharging}
        className='w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors'
      >
        {isCharging
          ? t("booking.payment.checking")
          : t("booking.payment.chargeFailedRetry")}
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PayPage() {
  const { id: bookingId } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const signedToken = token ?? "";
  const { t } = useTranslation("customer");

  useEffect(() => {
    if (token) {
      sessionStorage.setItem(`booking_payment_token_${bookingId}`, token);
    }
  }, [bookingId, token]);

  const { booking } = useBookingStatus({
    bookingId,
    signedToken,
    enabled: !!bookingId && !!token,
  });

  const { checkPayment, isChecking } = useCheckPayment({
    bookingId,
    signedToken,
    onPaid: () => router.replace(`/booking/${bookingId}/status?token=${token}`),
  });

  usePaymentAutoPoll({
    enabled: !!booking && booking.status === BOOKING_STATUSES.PENDING,
    onPoll: checkPayment,
    onPaid: () => router.replace(`/booking/${bookingId}/status?token=${token}`),
  });

  const {
    charge,
    isCharging,
    error: chargeError,
  } = useChargePayment(bookingId, signedToken);
  const hasAutoChargedRef = useRef(false);

  useEffect(() => {
    if (!booking) return;
    const action = resolvePayPageAction({
      isSnapMode: IS_SNAP_MODE,
      status: booking.status,
      hasPaymentInstructions: !!booking.paymentInstructions,
    });

    if (action === "redirect_status") {
      router.replace(`/booking/${bookingId}/status?token=${token}`);
      return;
    }
    if (action === "redirect_payment_method") {
      router.replace(`/booking/${bookingId}/payment-method?token=${token}`);
      return;
    }
    if (action === "auto_charge") {
      if (hasAutoChargedRef.current || isCharging) return;
      hasAutoChargedRef.current = true;
      charge(
        { paymentMethod: SNAP_AUTO_CHARGE_METHOD },
        {
          onError: () => {
            hasAutoChargedRef.current = false;
          },
        },
      );
    }
  }, [booking, bookingId, token, router, charge, isCharging]);

  function handleRetryCharge() {
    hasAutoChargedRef.current = true;
    charge(
      { paymentMethod: SNAP_AUTO_CHARGE_METHOD },
      {
        onError: () => {
          hasAutoChargedRef.current = false;
        },
      },
    );
  }

  function handleChangeMethod() {
    router.push(`/booking/${bookingId}/payment-method?token=${token}&change=1`);
  }

  return (
    <>
      <BookingExpiredModal
        open={booking?.status === BOOKING_STATUSES.EXPIRED}
      />
      <AppShell surface='customer' className='pb-32'>
        <div className='space-y-5'>
          {/* ── Page heading ──────────────────────────────────────────── */}
          <div>
            {booking?.plateText && (
              <p className='font-mono text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                {booking.plateText}
                {booking.slotText ? ` · ${booking.slotText}` : ""}
              </p>
            )}
            <h1 className='mt-1 text-2xl font-bold leading-tight text-foreground'>
              {t("booking.payment.completeTitle")}
            </h1>
          </div>

          {/* ── Instruction card ──────────────────────────────────────── */}
          {booking?.paymentInstructions ? (
            <PaymentInstructionsUI
              instructions={booking.paymentInstructions}
              onChangeMethod={handleChangeMethod}
              canChangeMethod={!IS_SNAP_MODE}
              t={t}
            />
          ) : chargeError ? (
            <ChargeFailedCard
              chargeError={chargeError}
              isCharging={isCharging}
              onRetry={handleRetryCharge}
              t={t}
            />
          ) : (
            <div className='bg-card rounded-2xl border border-border shadow-sm flex items-center justify-center py-16'>
              <div className='w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin' />
            </div>
          )}

          {/* ── How to pay — Virtual Account ──────────────────────────── */}
          {booking?.paymentInstructions?.type === "VA" && (
            <div className='bg-card rounded-2xl border border-border shadow-sm p-4'>
              <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3'>
                {t("booking.payment.howToPay")}
              </p>
              <ol className='space-y-2'>
                {[
                  t("booking.payment.vaStep1"),
                  t("booking.payment.vaStep2"),
                  t("booking.payment.vaStep3"),
                  t("booking.payment.vaStep4"),
                ].map((step, i) => (
                  <li key={i} className='flex items-start gap-2.5'>
                    <span className='shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5'>
                      {i + 1}
                    </span>
                    <p className='text-sm text-foreground leading-snug'>
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* ── How to pay — Mandiri ──────────────────────────────────── */}
          {booking?.paymentInstructions?.type === "MANDIRI" && (
            <div className='bg-card rounded-2xl border border-border shadow-sm p-4'>
              <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3'>
                {t("booking.payment.howToPayMandiri")}
              </p>
              <ol className='space-y-2'>
                {[
                  t("booking.payment.mandiriStep1"),
                  t("booking.payment.mandiriStep2"),
                  t("booking.payment.mandiriStep3"),
                  t("booking.payment.mandiriStep4"),
                  t("booking.payment.mandiriStep5"),
                ].map((step, i) => (
                  <li key={i} className='flex items-start gap-2.5'>
                    <span className='shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5'>
                      {i + 1}
                    </span>
                    <p className='text-sm text-foreground leading-snug'>
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* ── Sticky bottom actions ─────────────────────────────────── */}
        <div className='fixed bottom-16 left-0 right-0 z-10 bg-card/95 border-t border-border shadow-sm backdrop-blur-sm'>
          <div className='max-w-md mx-auto px-4 py-4 flex flex-col gap-2'>
            <p className='text-center text-sm text-muted-foreground'>
              {t("booking.payment.alreadyPaid")}
            </p>
            <button
              onClick={() => void checkPayment()}
              disabled={isChecking}
              className='w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-60 transition-colors'
            >
              <RefreshCw
                className={["w-4 h-4", isChecking ? "animate-spin" : ""].join(
                  " ",
                )}
              />
              {isChecking
                ? t("booking.payment.checking")
                : t("booking.payment.updateStatus")}
            </button>
            {!IS_SNAP_MODE && (
              <button
                onClick={handleChangeMethod}
                className='w-full py-2.5 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:bg-muted transition-colors'
              >
                {t("booking.payment.changeMethod")}
              </button>
            )}
          </div>
        </div>
      </AppShell>
    </>
  );
}
