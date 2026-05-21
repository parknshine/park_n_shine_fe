"use client";

import Image from "next/image";
import { useTranslation } from "@/i18n";

export function HowItWorksPanel() {
  const { t } = useTranslation("customer");

  const STEPS = [
    { src: "/park-shine-panel-1.jpeg", alt: t("howItWorks.step1Alt"), step: "1" },
    { src: "/park-shine-panel-2.jpeg", alt: t("howItWorks.step2Alt"), step: "2" },
    { src: "/park-shine-panel-3.jpeg", alt: t("howItWorks.step3Alt"), step: "3" },
    { src: "/park-shine-panel-4.jpeg", alt: t("howItWorks.step4Alt"), step: "4" },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{t("howItWorks.title")}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none [-webkit-overflow-scrolling:touch]">
        {STEPS.map(({ src, alt, step }) => (
          <div key={step} className="relative w-36 shrink-0">
            <div className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {step}
            </div>
            <div className="aspect-4/5 overflow-hidden rounded-xl">
              <Image src={src} alt={alt} width={144} height={180} className="h-full w-full object-cover" />
            </div>
            <p className="mt-1.5 text-center text-xs text-muted-foreground">{alt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
