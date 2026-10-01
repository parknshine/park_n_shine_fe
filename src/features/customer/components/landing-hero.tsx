"use client";

import Image from "next/image";
import { useTranslation } from "@/i18n";

interface LandingHeroProps {
  siteName: string;
  washPrice?: number;
}

function formatIDR(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export function LandingHero({ siteName, washPrice }: LandingHeroProps) {
  const { t } = useTranslation("customer");

  return (
    <div className="space-y-5">
      <div className="inline-flex items-center rounded-full bg-amber-400 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
        {t("landing.badge")}
      </div>

      <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground">
        {t("landing.heading").split("\n").map((line, i, arr) => (
          <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
        ))}
      </h1>

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground">
          <span className="h-2 w-2 rounded-full bg-primary" />
          {siteName}
        </div>
        {washPrice != null && (
          <div className="inline-flex items-center rounded-full bg-primary/10 px-3.5 py-1.5 text-sm font-semibold text-primary">
            {t("landing.fromPrice", { amount: formatIDR(washPrice) })}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl">
        <Image
          src="/park-shine-hero.jpeg"
          alt={t("landing.heroAlt")}
          width={600}
          height={400}
          className="w-full object-cover"
          priority
        />
      </div>
    </div>
  );
}
