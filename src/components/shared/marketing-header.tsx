"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCustomerAuthStore } from "@/store/customer-auth-store";
import { getMarketingBackOrigin } from "@/lib/marketing-back-origin";
import { LanguageSwitcher } from "./language-switcher";

interface MarketingHeaderProps {
  readonly backLabel?: string;
  readonly showLanguageSwitcher?: boolean;
}

export function MarketingHeader({
  backLabel = "Back",
  showLanguageSwitcher = false,
}: MarketingHeaderProps) {
  const router = useRouter();
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);

  function handleBack() {
    const origin = getMarketingBackOrigin();
    if (origin) {
      router.push(origin);
      return;
    }
    router.push(isAuthenticated ? "/home" : "/");
  }

  return (
    <header
      className="bg-white border-b border-[#e8e8e8] sticky top-0 z-50"
      style={{ boxShadow: "0px 1px 1px rgba(0,0,0,0.05)" }}
    >
      <div className="max-w-341.5 mx-auto px-4 md:px-12 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-[#024ad8] text-xl md:text-2xl whitespace-nowrap"
          style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 700 }}
        >
          Park &amp; Shine
        </Link>
        <div className="flex items-center gap-3">
          {showLanguageSwitcher && <LanguageSwitcher />}
          <button
            type="button"
            onClick={handleBack}
            className="text-[#636363] text-sm flex items-center gap-2 hover:text-[#024ad8] transition-colors"
            style={{ fontFamily: "var(--font-inter), sans-serif", fontWeight: 600 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {backLabel}
          </button>
        </div>
      </div>
    </header>
  );
}
