"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Heart } from "lucide-react";
import { useCustomerAuthStore } from "@/store/customer-auth-store";
import { useTranslation } from "@/i18n";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";

function TipThankYouContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id: bookingId } = useParams<{ id: string }>();
  const { t } = useTranslation("customer");
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useCustomerAuthStore((s) => s._hasHydrated);
  const tokenParam = searchParams.get("token");
  // Snap's finish callback lands here without a token (Midtrans caps callback
  // URLs at ~255 chars) — fall back to the token the rate page stashed.
  const [storedToken] = useState<string | null>(() =>
    typeof window === "undefined"
      ? null
      : sessionStorage.getItem(`tip_payment_token_${bookingId}`),
  );
  const token = tokenParam ?? storedToken;

  // Sync tip status on mount — e-wallet redirects here directly, bypassing polling on the rate page.
  useEffect(() => {
    if (!token || !bookingId) return;
    api.get(`/v1/bookings/${bookingId}/tip`, {
      headers: { "X-Booking-Token": token },
    }).catch(() => {});
  }, [bookingId, token]);

  function handleContinue() {
    router.push(isAuthenticated ? "/home" : "/");
  }

  return (
    <div className="mx-auto flex min-h-[80dvh] max-w-md flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
        <Heart className="h-12 w-12 text-primary" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Terima Kasih!</h1>
        <p className="text-sm text-muted-foreground">
          Tip kamu sudah diterima. Crew kami sangat menghargai kebaikanmu.
        </p>
      </div>

      {/* Wait for store rehydration before rendering auth-dependent content */}
      {hasHydrated && !isAuthenticated && (
        <div className="w-full rounded-2xl border border-border bg-muted/50 p-5 space-y-3 text-left">
          <p className="font-semibold text-foreground">
            {t("postFlow.guestPromptTitle")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("postFlow.guestPromptDesc")}
          </p>
          <div className="flex flex-col gap-2 pt-1">
            <Button
              className="w-full rounded-full"
              onClick={() => {
                const claimParam = token ? `&claim=${encodeURIComponent(token)}` : "";
                router.push(`/login?mode=register&redirect=/home${claimParam}`);
              }}
            >
              {t("postFlow.registerCta")}
            </Button>
            <Button
              variant="ghost"
              className="w-full rounded-full text-muted-foreground"
              onClick={handleContinue}
            >
              {t("postFlow.skipCta")}
            </Button>
          </div>
        </div>
      )}

      {hasHydrated && isAuthenticated && (
        <button
          type="button"
          onClick={handleContinue}
          className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Kembali ke Home
        </button>
      )}
    </div>
  );
}

export default function TipThankYouPage() {
  return (
    <Suspense fallback={null}>
      <TipThankYouContent />
    </Suspense>
  );
}
