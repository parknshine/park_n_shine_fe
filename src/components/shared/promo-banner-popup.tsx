"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { usePublicSettings } from "@/features/customer/hooks/use-public-settings";

const DISMISS_PREFIX = "promo-banner-dismissed:";

function isDismissed(dismissKey: string) {
  if (typeof window === "undefined") return true;
  try {
    return sessionStorage.getItem(`${DISMISS_PREFIX}${dismissKey}`) === "true";
  } catch {
    return true;
  }
}

export function PromoBannerPopup() {
  const { t } = useTranslation();
  const { promoBannerUrls } = usePublicSettings();
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const dismissKey = promoBannerUrls.join("|");

  if (promoBannerUrls.length === 0) return null;
  if (dismissedKey === dismissKey) return null;
  if (isDismissed(dismissKey)) return null;

  function handleClose() {
    try {
      sessionStorage.setItem(`${DISMISS_PREFIX}${dismissKey}`, "true");
    } catch {
      // ignore — private browsing / storage disabled
    }
    setDismissedKey(dismissKey);
  }

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(index);
  }

  function scrollToIndex(index: number) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  }

  return (
    <Dialog open onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="h-auto w-fit max-h-[90dvh] max-w-[92vw] overflow-hidden p-3 sm:max-w-[70vw] sm:p-4">
        <DialogHeader className="pr-8">
          <DialogTitle>{t("promoBanner.title")}</DialogTitle>
        </DialogHeader>
        <div className="mt-2 space-y-2">
          <div className="relative">
            <div
              ref={scrollerRef}
              onScroll={handleScroll}
              className="flex w-max max-w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden rounded-xl scroll-smooth scrollbar-none"
            >
              {promoBannerUrls.map((url, i) => (
                <div
                  key={url}
                  className="flex shrink-0 snap-center items-center justify-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- promoBannerUrl is a dynamic storage URL not in next/image's remotePatterns allowlist */}
                  <img
                    src={url}
                    alt={t("promoBanner.imageAlt", { count: i + 1 })}
                    className="h-auto w-auto max-h-[calc(90dvh-6rem)] max-w-[calc(92vw-1.5rem)] object-contain sm:max-w-[calc(70vw-2rem)]"
                  />
                </div>
              ))}
            </div>
            {promoBannerUrls.length > 1 && activeIndex > 0 && (
              <button
                type="button"
                aria-label={t("promoBanner.prevSlide")}
                onClick={() => scrollToIndex(activeIndex - 1)}
                className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm transition-colors hover:bg-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            {promoBannerUrls.length > 1 && activeIndex < promoBannerUrls.length - 1 && (
              <button
                type="button"
                aria-label={t("promoBanner.nextSlide")}
                onClick={() => scrollToIndex(activeIndex + 1)}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm transition-colors hover:bg-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
          {promoBannerUrls.length > 1 && (
            <div className="flex items-center justify-center gap-1.5">
              {promoBannerUrls.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  aria-label={t("promoBanner.goToSlide", { n: i + 1 })}
                  onClick={() => scrollToIndex(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === activeIndex ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30",
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
