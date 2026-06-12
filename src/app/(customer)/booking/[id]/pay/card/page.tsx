"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Lock, CreditCard, AlertCircle } from "lucide-react";
import { useBookingStatus } from "@/features/customer/hooks/use-booking-status";
import { useChargeCard } from "@/features/customer/hooks/use-charge-card";
import { BookingExpiredModal } from "@/features/customer/components/booking-expired-modal";
import { AppShell } from "@/components/shared";

// ─── Xendit.js tokenization ───────────────────────────────────────────────────

const XENDIT_PUBLIC_KEY = process.env.NEXT_PUBLIC_XENDIT_PUBLIC_KEY ?? "";

interface XenditCardToken {
  id: string;
  status?: string;
  authentication_id?: string;
  payer_authentication_url?: string;
  failure_reason?: string;
}

interface XenditInstance {
  setPublishableKey(key: string): void;
  card: {
    createToken(
      params: {
        card_number: string;
        card_exp_month: string;
        card_exp_year: string;
        card_cvn: string;
        amount?: number;
        card_holder_first_name?: string;
        card_holder_last_name?: string;
        card_holder_phone_number?: string;
        is_multiple_use: boolean;
        should_authenticate: boolean;
      },
      callback: (err: { message?: string } | null, token: XenditCardToken) => void,
    ): void;
  };
}

interface TokenizeResult {
  tokenId: string;
  authenticationId?: string;
}

function tokenizeCardXendit(
  params: {
    cardNumber: string;
    expMonth: string;
    expYear: string;
    cvn: string;
    amount: number;
    cardHolderName: string;
    phone?: string | null;
  },
  opts: {
    onAuthUrl: (url: string | null) => void;
    registerCancel: (cancel: () => void) => void;
  },
): Promise<TokenizeResult> {
  return new Promise((resolve, reject) => {
    const Xendit = (globalThis as { Xendit?: XenditInstance }).Xendit;
    if (!Xendit) {
      reject(new Error("Xendit.js belum dimuat — refresh halaman dan coba lagi"));
      return;
    }

    const nameParts = params.cardHolderName.trim().split(/\s+/);
    const firstName = nameParts[0] ?? params.cardHolderName;
    const lastName = nameParts.slice(1).join(" ") || undefined;

    let settled = false;
    let savedToken: TokenizeResult | null = null;

    function settle(result: TokenizeResult | null, error?: Error) {
      if (settled) return;
      settled = true;
      window.removeEventListener("message", onAuthMessage);
      opts.onAuthUrl(null);
      if (error) reject(error);
      else resolve(result!);
    }

    // Fallback to Xendit.js's own VERIFIED callback: the 3DS page posts a JSON
    // message {id, status} to its parent frame when authentication completes.
    function onAuthMessage(event: MessageEvent) {
      if (typeof event.data !== "string" || !savedToken?.authenticationId) return;
      try {
        const data = JSON.parse(event.data) as { id?: string; status?: string };
        if (!data.id || data.id !== savedToken.authenticationId) return;
        if (data.status === "VERIFIED") settle(savedToken);
        else if (data.status === "FAILED") settle(null, new Error("Autentikasi 3DS gagal. Silakan coba lagi atau gunakan kartu lain."));
      } catch {
        // not a Xendit auth message — ignore
      }
    }

    opts.registerCancel(() => settle(null, new Error("Verifikasi 3DS dibatalkan.")));

    Xendit.card.createToken(
      {
        card_number: params.cardNumber,
        card_exp_month: params.expMonth,
        card_exp_year: params.expYear,
        card_cvn: params.cvn,
        amount: params.amount,
        card_holder_first_name: firstName,
        ...(lastName ? { card_holder_last_name: lastName } : {}),
        ...(params.phone ? { card_holder_phone_number: params.phone } : {}),
        is_multiple_use: false,
        should_authenticate: true,
      },
      (err, token) => {
        if (err) {
          settle(null, new Error(err.message ?? "Tokenisasi kartu gagal"));
          return;
        }

        if (token.status === "IN_REVIEW") {
          // Xendit.js v1 detects 3DS completion via a postMessage that the
          // redirect.xendit.co page sends to its PARENT frame. The auth URL must
          // therefore render in an in-page iframe — in a popup, window.parent is
          // the popup itself and the completion message never reaches this page.
          if (!token.payer_authentication_url) {
            settle(null, new Error("URL verifikasi 3DS tidak tersedia. Silakan coba lagi."));
            return;
          }
          savedToken = { tokenId: token.id, authenticationId: token.authentication_id };
          window.addEventListener("message", onAuthMessage);
          opts.onAuthUrl(token.payer_authentication_url);
          return; // this same callback fires again with VERIFIED/FAILED
        }

        if (token.status === "FAILED") {
          settle(null, new Error(token.failure_reason ?? "Autentikasi 3DS gagal. Silakan coba lagi atau gunakan kartu lain."));
          return;
        }

        // VERIFIED (3DS done) or frictionless flow without challenge
        settle({ tokenId: token.id, authenticationId: token.authentication_id });
      },
    );
  });
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

function toE164(phone: string | null | undefined): string | undefined {
  if (!phone) return undefined;
  if (phone.startsWith("+")) return phone;
  return `+62${phone.replace(/^0/, "")}`;
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
  const [cardName, setCardName] = useState("");
  const [phoneOverride, setPhoneOverride] = useState<string | undefined>(undefined);
  const phone = phoneOverride ?? booking?.phone ?? "";
  const [tokenizing, setTokenizing] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const cancelAuthRef = useRef<(() => void) | null>(null);
  const xenditReadyRef = useRef(false);

  useEffect(() => {
    if (!XENDIT_PUBLIC_KEY) return;
    const script = document.createElement("script");
    script.src = "https://js.xendit.co/v1/xendit.min.js";
    script.async = true;
    script.onload = () => {
      (globalThis as { Xendit?: { setPublishableKey: (k: string) => void } }).Xendit?.setPublishableKey(XENDIT_PUBLIC_KEY);
      xenditReadyRef.current = true;
    };
    document.head.appendChild(script);
    return () => { if (document.head.contains(script)) script.remove(); };
  }, []);

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
      const result = await tokenizeCardXendit(
        {
          cardNumber: rawNumber,
          expMonth: mm,
          expYear: `20${yy}`,
          cvn: cvv,
          amount: booking?.priceAmount ?? 0,
          cardHolderName: cardName,
          phone: toE164(phone || null),
        },
        {
          onAuthUrl: setAuthUrl,
          registerCancel: (cancel) => { cancelAuthRef.current = cancel; },
        },
      );

      setTokenizing(false);
      const callbackUrl = `${globalThis.location.origin}/booking/card-callback?bookingId=${bookingId}`;
      chargeCard(
        {
          tokenId: result.tokenId,
          callbackUrl,
          ...(result.authenticationId ? { authenticationId: result.authenticationId } : {}),
        },
        {
          onSuccess: (r) => {
            if (r.paid) {
              router.replace(`/booking/${bookingId}/status?token=${token}`);
            } else if (r.redirectUrl) {
              sessionStorage.setItem(`card_payment_token_${bookingId}`, token ?? "");
              globalThis.location.href = r.redirectUrl;
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
      {/* 3DS verification — must be an in-page iframe so redirect.xendit.co can
          postMessage the result to this window (its parent frame) */}
      {authUrl && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
          <div className='w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-xl'>
            <iframe
              src={authUrl}
              title='Verifikasi 3D Secure'
              className='h-[480px] w-full border-0 bg-white'
            />
            <button
              type='button'
              onClick={() => cancelAuthRef.current?.()}
              className='w-full border-t border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
            >
              Batalkan
            </button>
          </div>
        </div>
      )}
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
              Data kartu diproses langsung oleh Xendit — aman dan terenkripsi
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
            <div className='mt-3 flex items-end justify-between'>
              <div>
                <p className='text-[10px] uppercase opacity-60'>Nama Pemegang</p>
                <p className='text-sm font-semibold uppercase'>{cardName || "NAMA LENGKAP"}</p>
              </div>
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

            <div className='space-y-1.5'>
              <label htmlFor='card-name' className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
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

            <div className='space-y-1.5'>
              <label htmlFor='card-phone' className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
                Nomor HP
              </label>
              <input
                id='card-phone'
                type='tel'
                inputMode='tel'
                value={phone}
                onChange={(e) => setPhoneOverride(e.target.value.replace(/[^\d+]/g, ""))}
                placeholder='08xxxxxxxxxx'
                required
                className='w-full rounded-xl border border-border bg-card px-4 py-3 font-mono text-base text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40'
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
        <div className='fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-card/95 shadow-sm backdrop-blur-sm'>
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
