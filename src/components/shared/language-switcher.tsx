"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/store/ui-store";

export function LanguageSwitcher() {
  const locale = useUIStore((s) => s.locale);
  const setLocale = useUIStore((s) => s.setLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function toggle() {
    setLocale(locale === "id" ? "en" : "id");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-full bg-background/80 px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-foreground shadow-[0_4px_16px_rgba(0,0,0,0.10)] backdrop-blur-sm transition-colors hover:bg-background"
      aria-label={mounted && locale === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
    >
      {mounted && locale === "id" ? "EN" : "ID"}
    </button>
  );
}
