"use client";

import { useRouter } from "next/navigation";
import { X, LogIn } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { useCustomerAuthStore } from "@/store/customer-auth-store";

function StarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#5c4900">
      <path d="M12 2l2 6.5L20.5 10 14 12l-2 6.5L10 12 3.5 10 10 8.5 12 2z" />
    </svg>
  );
}

interface BookNowModalProps {
  captureHref: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookNowModal({
  captureHref,
  open,
  onOpenChange,
}: Readonly<BookNowModalProps>) {
  const router = useRouter();
  const { t } = useTranslation("customer");
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);

  function handleLogin() {
    onOpenChange(false);
    if (isAuthenticated) {
      router.push(captureHref);
    } else {
      router.push(`/login?redirect=${encodeURIComponent(captureHref)}`);
    }
  }

  function handleGuest() {
    onOpenChange(false);
    router.push(captureHref);
  }

  return (
    <>
      <style>{`
        @keyframes pns-sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          50%       { transform: scale(1.18) rotate(12deg); opacity: 0.85; }
        }
        .pns-sparkle { animation: pns-sparkle 2.4s ease-in-out infinite; }
      `}</style>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="w-90 max-w-[calc(100vw-40px)] p-0 rounded-[22px] overflow-hidden shadow-[0_40px_90px_rgba(0,98,137,0.32)] border-0"
          hideCloseButton
        >
          {/* ── Gradient hero header ───────────────────────────── */}
          <div
            className="relative px-6.5 pt-6.5 pb-7.5 text-white overflow-hidden"
            style={{ background: "linear-gradient(135deg, #006289 0%, #1db1f1 100%)" }}
          >
            {/* Decorative background circles */}
            <div className="pointer-events-none absolute -right-7 -top-7 h-32.5 w-32.5 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-8.5 right-10 h-20 w-20 rounded-full bg-white/8" />

            {/* Close button */}
            <Button
              aria-label="Tutup"
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 h-7.5 w-7.5 rounded-full bg-white/18 p-0 text-white shadow-none hover:bg-white/30 hover:translate-y-0 active:translate-y-0"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.4} />
            </Button>

            {/* Animated sparkle badge */}
            <div className="pns-sparkle mb-4 flex h-11 w-11 items-center justify-center rounded-[13px] bg-[#fdd34d] shadow-[0_8px_18px_rgba(0,0,0,0.18)]">
              <StarIcon />
            </div>

            {/* Eyebrow */}
            <p className="mb-2 text-[12px] font-bold tracking-[0.08em] opacity-85">
              {t("bookNowModal.eyebrow")}
            </p>

            {/* Headline */}
            <DialogTitle className="text-[22px] font-extrabold leading-[1.22] tracking-[-0.01em] text-white">
              {t("bookNowModal.promoText")}
            </DialogTitle>
          </div>

          {/* ── Action body ────────────────────────────────────── */}
          <div className="px-6.5 pb-6.5 pt-5.5">
            <p className="mb-4 text-[12px] font-bold tracking-[0.08em] text-muted-foreground">
              {t("bookNowModal.title")}
            </p>

            {/* Login CTA — gradient */}
            <Button
              size="lg"
              onClick={handleLogin}
              prefix={isAuthenticated ? undefined : <LogIn className="h-4.5 w-4.5" strokeWidth={2} />}
              className="w-full font-bold"
            >
              {isAuthenticated ? t("bookNowModal.continueBtn") : t("bookNowModal.loginBtn")}
            </Button>

            {/* Guest CTA — only shown when not authenticated */}
            {!isAuthenticated && (
              <Button
                variant="outline"
                size="lg"
                onClick={handleGuest}
                className="mt-2.5 w-full bg-white font-bold hover:bg-[#e8f2f9]"
              >
                {t("bookNowModal.guestBtn")}
              </Button>
            )}

            {/* Terms note */}
            <p className="mt-4 text-center text-[12px] leading-relaxed text-muted-foreground">
              {t("bookNowModal.terms")}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
