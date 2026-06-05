"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { ChevronRight, CreditCard } from "lucide-react";
import { useBookingStatus } from "@/features/customer/hooks/use-booking-status";
import { useChargePayment } from "@/features/customer/hooks/use-charge-payment";
import { PAYMENT_CATEGORIES } from "@/features/customer/payment-methods";
import { BookingExpiredModal } from "@/features/customer/components/booking-expired-modal";
import { AppShell } from "@/components/shared";

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentMethodPage() {
  return (
    <Suspense>
      <PaymentMethodContent />
    </Suspense>
  );
}

function PaymentMethodContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = params.id;
  const token = searchParams.get("token") ?? "";

  const { booking } = useBookingStatus({ bookingId, signedToken: token });
  const { charge, isCharging, error } = useChargePayment(bookingId, token);
  const [loadingMethod, setLoadingMethod] = useState<string | null>(null);

  function handleSelect(code: string) {
    if (isCharging) return;
    if (code === "CREDIT_CARD") {
      router.push(`/booking/${bookingId}/pay/card?token=${token}`);
      return;
    }
    setLoadingMethod(code);
    charge(
      { paymentMethod: code },
      {
        onSuccess: () => {
          setLoadingMethod(null);
          router.push(`/booking/${bookingId}/pay?token=${token}`);
        },
        onError: () => {
          setLoadingMethod(null);
        },
      },
    );
  }

  return (
    <>
    <BookingExpiredModal open={booking?.status === "EXPIRED"} />
    <AppShell surface="customer" className="pb-28">
      <div className="space-y-6">
        {/* ── Header ────────────────────────────────────────────────── */}
        <div>
          {booking?.plateText && (
            <p className="font-mono text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {booking.plateText}
            </p>
          )}
          <h1 className="mt-1 text-2xl font-bold leading-tight text-foreground">
            Pilih Metode Pembayaran
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pilih cara pembayaran yang ingin digunakan
          </p>
        </div>

        {/* ── Error banner ──────────────────────────────────────────── */}
        {error && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* ── Categories ────────────────────────────────────────────── */}
        <div className="space-y-5">
          {PAYMENT_CATEGORIES.map((category) => (
            <div key={category.label}>
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {category.label}
              </p>

              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                {category.methods.map((method, idx) => {
                  const isLoading = loadingMethod === method.code;

                  return (
                    <button
                      key={method.code}
                      onClick={() => handleSelect(method.code)}
                      disabled={!!loadingMethod}
                      className={[
                        "flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors",
                        idx > 0 ? "border-t border-border" : "",
                        isLoading
                          ? "bg-muted"
                          : !!loadingMethod
                            ? "cursor-not-allowed opacity-50"
                            : "hover:bg-muted active:bg-muted/80",
                      ].join(" ")}
                    >
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={method.logoUrl} alt={method.name} className="w-full h-full object-contain" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">
                          {method.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {method.subtitle}
                        </p>
                      </div>

                      {isLoading ? (
                        <div className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-border border-t-primary" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sticky footer ─────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-card/95 shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Total Harga
            </p>
            <p className="text-lg font-bold leading-tight text-foreground">
              {booking?.priceAmount !== undefined ? (
                formatIDR(booking.priceAmount)
              ) : (
                <span className="text-muted-foreground">Memuat...</span>
              )}
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>
    </AppShell>
    </>
  );
}
