"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQueryState, parseAsString } from "nuqs";
import { Copy, CheckCircle, RefreshCw, AlertCircle, Wallet } from "lucide-react";
import { useBookingStatus } from "@/features/customer/hooks/use-booking-status";
import { useCheckPayment } from "@/features/customer/hooks/use-check-payment";
import { usePaymentAutoPoll } from "@/features/customer/hooks/use-payment-auto-poll";
import { BOOKING_STATUSES } from "@/features/customer/types";
import { BookingExpiredModal } from "@/features/customer/components/booking-expired-modal";
import { AppShell } from "@/components/shared";
import type {
  BookingStatus,
  PaymentInstructions,
} from "@/features/customer/types";

const PAID_STATUSES = new Set<BookingStatus>([
  BOOKING_STATUSES.PAID,
  BOOKING_STATUSES.ASSIGNED,
  BOOKING_STATUSES.IN_PROGRESS,
  BOOKING_STATUSES.READY,
  BOOKING_STATUSES.CLOSED,
]);

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

function CopyButton({ value }: { value: string }) {
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
          <CheckCircle className="w-3.5 h-3.5" />
          Tersalin
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          Salin
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
}: {
  label: string;
  value: string;
  mono?: boolean;
  copyValue?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
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
      {copyValue && <CopyButton value={copyValue} />}
    </div>
  );
}

// ─── Expiry badge ─────────────────────────────────────────────────────────────

function ExpiryBadge({ expiryTime }: { expiryTime: string }) {
  return (
    <div className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
      <p className="text-xs text-amber-700 font-medium">
        Berlaku hingga{" "}
        <span className="font-semibold">{formatExpiry(expiryTime)}</span>
      </p>
    </div>
  );
}

// ─── Payment instruction variants ────────────────────────────────────────────

function PaymentInstructionsUI({
  instructions,
  onChangeMethod,
}: {
  instructions: PaymentInstructions;
  onChangeMethod: () => void;
}) {
  const expired = "expiryTime" in instructions && isExpired(instructions.expiryTime);

  if (expired) {
    return (
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-amber-500" />
        </div>
        <div>
          <p className="font-semibold text-foreground mb-1">
            Waktu Pembayaran Habis
          </p>
          <p className="text-sm text-muted-foreground">
            Silakan pilih metode pembayaran baru untuk melanjutkan.
          </p>
        </div>
        <button
          onClick={onChangeMethod}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Ganti Metode Pembayaran
        </button>
      </div>
    );
  }

  // ── Virtual Account ──
  if (instructions.type === "VA") {
    return (
      <div className="flex flex-col gap-3">
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <InfoRow label="Bank" value={instructions.bank} />
          <div className="border-t border-border">
            <InfoRow
              label="Nomor Virtual Account"
              value={instructions.vaNumber}
              mono
              copyValue={instructions.vaNumber}
            />
          </div>
        </div>
        <ExpiryBadge expiryTime={instructions.expiryTime} />
      </div>
    );
  }

  // ── Mandiri echannel ──
  if (instructions.type === "MANDIRI") {
    return (
      <div className="flex flex-col gap-3">
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <InfoRow
            label="Kode Perusahaan"
            value={instructions.companyCode}
            mono
            copyValue={instructions.companyCode}
          />
          <div className="border-t border-border">
            <InfoRow
              label="Kode Tagihan"
              value={instructions.billCode}
              mono
              copyValue={instructions.billCode}
            />
          </div>
        </div>
        <ExpiryBadge expiryTime={instructions.expiryTime} />
      </div>
    );
  }

  // ── QRIS ──
  if (instructions.type === "QRIS") {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={instructions.qrUrl}
            alt="QRIS QR Code"
            className="w-56 h-56 object-contain"
          />
        </div>
        <p className="text-xs text-muted-foreground font-medium text-center">
          Scan QR di atas menggunakan dompet digital apapun
        </p>
        <ExpiryBadge expiryTime={instructions.expiryTime} />
      </div>
    );
  }

  // ── Credit card / Snap redirect ──
  if (instructions.type === "REDIRECT") {
    return (
      <div className="bg-primary rounded-2xl p-6 flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-full bg-primary-foreground/10 flex items-center justify-center">
          <Wallet className="w-7 h-7 text-primary-foreground" />
        </div>
        <div>
          <p className="font-semibold text-primary-foreground mb-1">Bayar dengan Kartu</p>
          <p className="text-sm text-primary-foreground/70">
            Klik tombol di bawah untuk membuka halaman pembayaran dan memasukkan detail kartu kredit / debit kamu.
          </p>
        </div>
        <a
          href={instructions.redirectUrl}
          className="w-full py-3 rounded-xl bg-primary-foreground text-primary text-sm font-semibold text-center hover:bg-primary-foreground/90 transition-colors"
        >
          Bayar Sekarang
        </a>
      </div>
    );
  }

  // ── E-Wallet deeplink ──
  if (instructions.type === "EWALLET") {
    return (
      <div className="flex flex-col gap-3">
        <div className="bg-primary rounded-2xl p-6 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-primary-foreground/10 flex items-center justify-center">
            <Wallet className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-primary-foreground mb-1">
              Selesaikan di {instructions.provider}
            </p>
            <p className="text-sm text-primary-foreground/70">
              Klik tombol di bawah untuk membuka aplikasi{" "}
              <span className="font-semibold text-primary-foreground">
                {instructions.provider}
              </span>{" "}
              dan menyelesaikan pembayaran.
            </p>
          </div>
          <a
            href={instructions.deepLinkUrl}
            className="w-full py-3 rounded-xl bg-primary-foreground text-primary text-sm font-semibold text-center hover:bg-primary-foreground/90 transition-colors"
          >
            Buka {instructions.provider}
          </a>
        </div>
        <ExpiryBadge expiryTime={instructions.expiryTime} />
      </div>
    );
  }

  return null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PayPage() {
  const { id: bookingId } = useParams<{ id: string }>();
  const [token] = useQueryState("token", parseAsString);
  const router = useRouter();
  const signedToken = token ?? "";

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

  useEffect(() => {
    if (!booking) return;
    if (PAID_STATUSES.has(booking.status)) {
      router.replace(`/booking/${bookingId}/status?token=${token}`);
    }
  }, [booking, bookingId, token, router]);

  useEffect(() => {
    if (!booking) return;
    if (PAID_STATUSES.has(booking.status)) return;
    if (!booking.paymentInstructions) {
      router.replace(`/booking/${bookingId}/payment-method?token=${token}`);
    }
  }, [booking, bookingId, token, router]);

  function handleChangeMethod() {
    router.push(`/booking/${bookingId}/payment-method?token=${token}`);
  }

  return (
    <>
    <BookingExpiredModal open={booking?.status === BOOKING_STATUSES.EXPIRED} />
    <AppShell surface="customer" className="pb-32">
      <div className="space-y-5">
        {/* ── Page heading ──────────────────────────────────────────── */}
        <div>
          {booking?.plateText && (
            <p className="font-mono text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {booking.plateText}
              {booking.slotText ? ` · ${booking.slotText}` : ""}
            </p>
          )}
          <h1 className="mt-1 text-2xl font-bold leading-tight text-foreground">
            Selesaikan Pembayaran
          </h1>
        </div>

        {/* ── Instruction card ──────────────────────────────────────── */}
        {booking?.paymentInstructions ? (
          <PaymentInstructionsUI
            instructions={booking.paymentInstructions}
            onChangeMethod={handleChangeMethod}
          />
        ) : (
          <div className="bg-card rounded-2xl border border-border shadow-sm flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {/* ── How to pay — Virtual Account ──────────────────────────── */}
        {booking?.paymentInstructions?.type === "VA" && (
          <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Cara Bayar
            </p>
            <ol className="space-y-2">
              {[
                "Buka aplikasi mobile banking atau ATM",
                "Pilih Transfer → Virtual Account",
                "Masukkan nomor VA di atas",
                "Konfirmasi dan selesaikan pembayaran",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-foreground leading-snug">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* ── How to pay — Mandiri ──────────────────────────────────── */}
        {booking?.paymentInstructions?.type === "MANDIRI" && (
          <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Cara Bayar via Mandiri
            </p>
            <ol className="space-y-2">
              {[
                "Buka Livin' by Mandiri atau ATM Mandiri",
                "Pilih Bayar → Multipayment",
                "Masukkan Kode Perusahaan di atas",
                "Masukkan Kode Tagihan di atas",
                "Konfirmasi pembayaran",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-foreground leading-snug">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* ── Sticky bottom actions ─────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-card/95 border-t border-border shadow-sm backdrop-blur-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex flex-col gap-2">
          <button
            onClick={() => void checkPayment()}
            disabled={isChecking}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            <RefreshCw
              className={["w-4 h-4", isChecking ? "animate-spin" : ""].join(" ")}
            />
            {isChecking ? "Memeriksa status..." : "Sudah Bayar? Cek Status"}
          </button>
          <button
            onClick={handleChangeMethod}
            className="w-full py-2.5 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:bg-muted transition-colors"
          >
            Ganti Metode Pembayaran
          </button>
        </div>
      </div>
    </AppShell>
    </>
  );
}
