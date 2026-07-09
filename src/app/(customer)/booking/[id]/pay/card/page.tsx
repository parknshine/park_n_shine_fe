"use client";

import { Suspense, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Lock, CreditCard, AlertCircle } from "lucide-react";
import { useBookingStatus } from "@/features/customer/hooks/use-booking-status";
import { useChargeCard } from "@/features/customer/hooks/use-charge-card";
import { BookingExpiredModal } from "@/features/customer/components/booking-expired-modal";
import { AppShell } from "@/components/shared";

// ─── Midtrans Core API tokenization ────────────────────────────────────────────
// Tokenize via GET /v2/token (client-side, client key only — no server key exposed).
// 3DS, if required, happens after the backend charge call via a full-page redirect
// to the `redirectUrl` it returns (handled in handleSubmit's onSuccess below).

const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";
const MIDTRANS_API_BASE = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
  ? "https://api.midtrans.com"
  : "https://api.sandbox.midtrans.com";

interface TokenizeResult {
  tokenId: string;
}

async function tokenizeCardMidtrans(params: {
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvn: string;
  amount: number;
}): Promise<TokenizeResult> {
  if (!MIDTRANS_CLIENT_KEY) {
    throw new Error("Midtrans client key belum dikonfigurasi");
  }
  const query = new URLSearchParams({
    client_key: MIDTRANS_CLIENT_KEY,
    card_number: params.cardNumber,
    card_exp_month: params.expMonth,
    card_exp_year: params.expYear,
    card_cvv: params.cvn,
    gross_amount: String(params.amount),
    secure: "true",
  });
  const res = await fetch(`${MIDTRANS_API_BASE}/v2/token?${query.toString()}`);
  const data = await res.json() as { status_code?: string; status_message?: string; token_id?: string };
  if (data.status_code !== "200" || !data.token_id) {
    throw new Error(data.status_message ?? "Tokenisasi kartu gagal");
  }
  return { tokenId: data.token_id };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCardNumber(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length > 2) return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  return digits;
}

function detectBrand(number: string): "visa" | "mastercard" | "jcb" | "amex" | null {
  const n = number.replace(/\s/g, "");
  if (n.startsWith("4")) return "visa";
  if (/^5[1-5]|^2[2-7]/.test(n)) return "mastercard";
  if (n.startsWith("35")) return "jcb";
  if (n.startsWith("34") || n.startsWith("37")) return "amex";
  return null;
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

const CDN = "https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads";
const BRAND_LOGOS: Record<string, string> = {
  visa: `${CDN}/2021/02/bc8804c570a21f444ff665c5e8882b06_be31feee12a5fd37e039cd951d664959_compressed.png`,
  mastercard: `${CDN}/2020/09/b2bbf094c458f87f3f2da2a586e7900f_02a27aedf91f8278ededd199d03fb89b_compressed.png`,
  jcb: `${CDN}/2020/09/e70f8cd723b85ef55461416a8c7e49dd_1118d6206bcf7e8864d85dcab530ec68_compressed.png`,
  amex: `${CDN}/2020/09/cd1a6491d9ff7780d5f9bcc2b310b673_3400f5b0f30a1cda074ecb91682a11a1_compressed.png`,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CardPayPage() {
  return (
    <Suspense>
      <CardPayContent />
    </Suspense>
  );
}

function CardPayContent() {
  const { id: bookingId } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const signedToken = token ?? "";

  const { booking } = useBookingStatus({
    bookingId,
    signedToken,
    enabled: !!bookingId && !!token,
  });
  const { chargeCard, isCharging, error: chargeError } = useChargeCard(bookingId, signedToken);

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [tokenizing, setTokenizing] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const brand = detectBrand(cardNumber);
  const isBusy = tokenizing || isCharging;
  const displayError = tokenError ?? chargeError;

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isBusy) return;

    setTokenError(null);
    setTokenizing(true);

    const rawNumber = cardNumber.replace(/\s/g, "");
    const parts = expiry.replace(/\s/g, "").split("/");
    const mm = parts[0]?.trim() ?? "";
    const yy = parts[1]?.trim() ?? "";

    if (mm.length !== 2 || yy.length !== 2) {
      setTokenizing(false);
      setTokenError("Masukkan tanggal kedaluwarsa yang valid (MM/YY)");
      return;
    }

    try {
      const result = await tokenizeCardMidtrans({
        cardNumber: rawNumber,
        expMonth: mm,
        expYear: `20${yy}`,
        cvn: cvv,
        amount: booking?.priceAmount ?? 0,
      });

      setTokenizing(false);
      // Midtrans POSTs here after the 3DS challenge completes (route handler,
      // which 303-redirects to the client callback page).
      const callbackUrl = `${globalThis.location.origin}/booking/card-callback/complete?bookingId=${bookingId}`;
      chargeCard(
        {
          tokenId: result.tokenId,
          callbackUrl,
        },
        {
          onSuccess: (r) => {
            if (r.paid) {
              router.replace(`/booking/${bookingId}/status?token=${token}`);
            } else if (r.redirectUrl) {
              sessionStorage.setItem(`card_payment_token_${bookingId}`, token ?? "");
              // Mirror MidtransNew3ds.redirect: `callback_type=form` switches the 3DS
              // result page from js_event (iframe postMessage) to a form POST redirect
              // back to `callback_url`. Without it "Tap to Continue" goes nowhere.
              const url = new URL(r.redirectUrl);
              url.searchParams.set("callback_type", "form");
              url.searchParams.set("callback_url", callbackUrl);
              globalThis.location.href = url.toString();
            }
          },
        },
      );
    } catch (err) {
      setTokenizing(false);
      setTokenError(err instanceof Error ? err.message : "Tokenisasi kartu gagal");
    }
  }

  return (
    <>
      <BookingExpiredModal open={booking?.status === "EXPIRED"} />
      <AppShell surface='customer' className='pb-32'>
        <div className='space-y-6'>
          <div>
            {booking?.plateText && (
              <p className='font-mono text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                {booking.plateText}
              </p>
            )}
            <h1 className='mt-1 text-2xl font-bold leading-tight text-foreground'>
              Detail Kartu
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Data kartu diproses langsung oleh Midtrans — aman dan terenkripsi
            </p>
          </div>

          {/* Card preview */}
          <div className='relative rounded-2xl bg-linear-to-br from-primary to-primary/70 p-6 text-primary-foreground shadow-lg'>
            <div className='flex items-start justify-between'>
              <CreditCard className='h-8 w-8 opacity-80' />
              {brand && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={BRAND_LOGOS[brand]} alt={brand} className='h-8 w-auto object-contain' />
              )}
            </div>
            <p className='mt-4 font-mono text-xl tracking-widest'>
              {cardNumber || "•••• •••• •••• ••••"}
            </p>
            <div className='mt-3 flex items-end justify-end'>
              <div className='text-right'>
                <p className='text-[10px] uppercase opacity-60'>Berlaku Hingga</p>
                <p className='text-sm font-semibold'>{expiry || "MM / YY"}</p>
              </div>
            </div>
          </div>

          {/* Error */}
          {displayError && (
            <div className='flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
              <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
              <span>{displayError}</span>
            </div>
          )}

          {/* Form */}
          <form id='card-form' onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-1.5'>
              <label htmlFor='card-number' className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
                Nomor Kartu
              </label>
              <input
                id='card-number'
                type='text'
                inputMode='numeric'
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder='1234 5678 9012 3456'
                required
                className='w-full rounded-xl border border-border bg-card px-4 py-3 font-mono text-base tracking-widest text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40'
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <label htmlFor='card-expiry' className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
                  Berlaku Hingga
                </label>
                <input
                  id='card-expiry'
                  type='text'
                  inputMode='numeric'
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder='MM / YY'
                  required
                  className='w-full rounded-xl border border-border bg-card px-4 py-3 font-mono text-base text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40'
                />
              </div>
              <div className='space-y-1.5'>
                <label htmlFor='card-cvv' className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
                  CVV
                </label>
                <input
                  id='card-cvv'
                  type='password'
                  inputMode='numeric'
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder='•••'
                  required
                  maxLength={4}
                  className='w-full rounded-xl border border-border bg-card px-4 py-3 font-mono text-base text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40'
                />
              </div>
            </div>

            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              <Lock className='h-3.5 w-3.5 shrink-0' />
              <span>Data kartu kamu dienkripsi dan tidak disimpan di server kami</span>
            </div>
          </form>
        </div>

        {/* Sticky footer */}
        <div className='fixed bottom-16 left-0 right-0 z-10 border-t border-border bg-card/95 shadow-sm backdrop-blur-sm'>
          <div className='mx-auto max-w-md px-4 py-4 space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>Total Pembayaran</span>
              <span className='font-bold text-foreground'>
                {booking?.priceAmount !== undefined ? formatIDR(booking.priceAmount) : "—"}
              </span>
            </div>
            <button
              type='submit'
              form='card-form'
              disabled={isBusy}
              className='w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2'
            >
              {isBusy ? (
                <>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground' />
                  {tokenizing ? "Memverifikasi kartu..." : "Memproses pembayaran..."}
                </>
              ) : (
                <>
                  <Lock className='h-4 w-4' />
                  Bayar Sekarang
                </>
              )}
            </button>
          </div>
        </div>
      </AppShell>
    </>
  );
}
