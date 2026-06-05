"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryState, parseAsString } from "nuqs";
import { Lock, CreditCard, AlertCircle } from "lucide-react";
import { useBookingStatus } from "@/features/customer/hooks/use-booking-status";
import { useChargeCard } from "@/features/customer/hooks/use-charge-card";
import { BookingExpiredModal } from "@/features/customer/components/booking-expired-modal";
import { AppShell } from "@/components/shared";

// ─── Midtrans tokenization (direct REST — no SDK needed) ─────────────────────

async function tokenizeCard(params: {
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  clientKey: string;
  isProduction: boolean;
}): Promise<string> {
  const base = params.isProduction
    ? "https://api.midtrans.com"
    : "https://api.sandbox.midtrans.com";
  const url = new URL(`${base}/v2/token`);
  url.searchParams.set("card_number", params.cardNumber);
  url.searchParams.set("card_exp_month", params.expMonth);
  url.searchParams.set("card_exp_year", params.expYear);
  url.searchParams.set("card_cvv", params.cvv);
  url.searchParams.set("client_key", params.clientKey);
  const resp = await fetch(url.toString());
  const data = await resp.json() as { status_code: string; status_message?: string; token_id?: string };
  if (data.status_code !== "200") {
    throw new Error(data.status_message ?? "Tokenisasi kartu gagal");
  }
  return data.token_id!;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCardNumber(raw: string): string {
  return raw
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length > 2) return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  return digits;
}

function detectBrand(
  number: string,
): "visa" | "mastercard" | "jcb" | "amex" | null {
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
  const [token] = useQueryState("token", parseAsString);
  const router = useRouter();
  const signedToken = token ?? "";

  const { booking } = useBookingStatus({
    bookingId,
    signedToken,
    enabled: !!bookingId && !!token,
  });
  const {
    chargeCard,
    isCharging,
    error: chargeError,
  } = useChargeCard(bookingId, signedToken);

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [tokenizing, setTokenizing] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [waiting3ds, setWaiting3ds] = useState(false);
  const popupRef = useRef<Window | null>(null);

  // Listen for postMessage from the 3DS popup
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Only accept messages from Midtrans domains
      if (!event.origin.includes("midtrans.com")) return;
      const data = event.data as { transaction_status?: string; status_message?: string };
      if (!data?.transaction_status) return;

      popupRef.current?.close();
      popupRef.current = null;

      if (data.transaction_status === "capture" || data.transaction_status === "settlement") {
        router.replace(`/booking/${bookingId}/status?token=${token}`);
      } else {
        setWaiting3ds(false);
        setTokenError(`Pembayaran gagal: ${data.status_message ?? data.transaction_status}`);
      }
    }

    globalThis.window.addEventListener("message", handleMessage);
    return () => globalThis.window.removeEventListener("message", handleMessage);
  }, [bookingId, token, router]);

  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";
  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";

  const brand = detectBrand(cardNumber);
  const isBusy = tokenizing || isCharging || waiting3ds;
  const displayError = tokenError ?? chargeError;

  function handleCardNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCardNumber(formatCardNumber(e.target.value));
  }

  function handleExpiryChange(e: React.ChangeEvent<HTMLInputElement>) {
    setExpiry(formatExpiry(e.target.value));
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isBusy) return;

    setTokenError(null);
    setTokenizing(true);

    try {
      const rawNumber = cardNumber.replace(/\s/g, "");
      const parts = expiry.replace(/\s/g, "").split("/");
      const mm = parts[0]?.trim() ?? "";
      const yy = parts[1]?.trim() ?? "";

      const tokenId = await tokenizeCard({
        cardNumber: rawNumber,
        expMonth: mm,
        expYear: `20${yy}`,
        cvv,
        clientKey,
        isProduction,
      });

      setTokenizing(false);
      // Store token in sessionStorage so the callback page can retrieve it
      // without needing to embed the long JWT in the callback URL.
      sessionStorage.setItem(`card_payment_token_${bookingId}`, token ?? "");
      const callbackUrl = `${globalThis.location.origin}/booking/card-callback?bookingId=${bookingId}`;
      chargeCard({ tokenId, callbackUrl }, {
        onSuccess: (result) => {
          if (result.paid) {
            router.replace(`/booking/${bookingId}/status?token=${token}`);
          } else if (result.redirectUrl) {
            setWaiting3ds(true);
            popupRef.current = globalThis.window.open(
              result.redirectUrl,
              "midtrans_3ds",
              "width=500,height=700,scrollbars=yes,resizable=yes"
            );
          }
        },
      });
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
          {/* ── Header ────────────────────────────────────────────────── */}
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

          {/* ── Card preview ──────────────────────────────────────────── */}
          <div className='relative rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-6 text-primary-foreground shadow-lg'>
            <div className='flex items-start justify-between'>
              <CreditCard className='h-8 w-8 opacity-80' />
              {brand && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={BRAND_LOGOS[brand]}
                  alt={brand}
                  className='h-8 w-auto object-contain'
                />
              )}
            </div>
            <p className='mt-4 font-mono text-xl tracking-widest'>
              {cardNumber || "•••• •••• •••• ••••"}
            </p>
            <div className='mt-3 flex items-end justify-between'>
              <div>
                <p className='text-[10px] uppercase opacity-60'>
                  Nama Pemegang
                </p>
                <p className='text-sm font-semibold uppercase'>
                  {cardName || "NAMA LENGKAP"}
                </p>
              </div>
              <div className='text-right'>
                <p className='text-[10px] uppercase opacity-60'>
                  Berlaku Hingga
                </p>
                <p className='text-sm font-semibold'>{expiry || "MM / YY"}</p>
              </div>
            </div>
          </div>

          {/* ── Error ─────────────────────────────────────────────────── */}
          {displayError && (
            <div className='flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
              <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
              <span>{displayError}</span>
            </div>
          )}

          {/* ── Form ──────────────────────────────────────────────────── */}
          <form id='card-form' onSubmit={handleSubmit} className='space-y-4'>
            {/* Card number */}
            <div className='space-y-1.5'>
              <label
                htmlFor='card-number'
                className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'
              >
                Nomor Kartu
              </label>
              <input
                id='card-number'
                type='text'
                inputMode='numeric'
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder='1234 5678 9012 3456'
                required
                className='w-full rounded-xl border border-border bg-card px-4 py-3 font-mono text-base tracking-widest text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40'
              />
            </div>

            {/* Name */}
            <div className='space-y-1.5'>
              <label
                htmlFor='card-name'
                className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'
              >
                Nama Pemegang Kartu
              </label>
              <input
                id='card-name'
                type='text'
                value={cardName}
                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                placeholder='NAMA SESUAI KARTU'
                required
                className='w-full rounded-xl border border-border bg-card px-4 py-3 font-medium uppercase text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40'
              />
            </div>

            {/* Expiry + CVV */}
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <label
                  htmlFor='card-expiry'
                  className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'
                >
                  Berlaku Hingga
                </label>
                <input
                  id='card-expiry'
                  type='text'
                  inputMode='numeric'
                  value={expiry}
                  onChange={handleExpiryChange}
                  placeholder='MM / YY'
                  required
                  className='w-full rounded-xl border border-border bg-card px-4 py-3 font-mono text-base text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40'
                />
              </div>
              <div className='space-y-1.5'>
                <label
                  htmlFor='card-cvv'
                  className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'
                >
                  CVV
                </label>
                <input
                  id='card-cvv'
                  type='password'
                  inputMode='numeric'
                  value={cvv}
                  onChange={(e) =>
                    setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder='•••'
                  required
                  maxLength={4}
                  className='w-full rounded-xl border border-border bg-card px-4 py-3 font-mono text-base text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40'
                />
              </div>
            </div>

            {/* Security note */}
            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              <Lock className='h-3.5 w-3.5 shrink-0' />
              <span>
                Data kartu kamu dienkripsi dan tidak disimpan di server kami
              </span>
            </div>

            {/* Submit — in sticky footer below */}
          </form>
        </div>

        {/* ── Sticky footer ─────────────────────────────────────────────── */}
        <div className='fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-card/95 shadow-sm backdrop-blur-sm'>
          <div className='mx-auto max-w-md px-4 py-4 space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>Total Pembayaran</span>
              <span className='font-bold text-foreground'>
                {booking?.priceAmount !== undefined
                  ? formatIDR(booking.priceAmount)
                  : "—"}
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
                  {waiting3ds && "Menunggu autentikasi 3DS..."}
                  {tokenizing && !waiting3ds && "Memverifikasi kartu..."}
                  {isCharging && !waiting3ds && "Memproses pembayaran..."}
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
