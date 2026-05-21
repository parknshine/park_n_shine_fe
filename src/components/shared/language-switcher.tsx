"use client";

import { useUIStore } from "@/store/ui-store";

export function LanguageSwitcher() {
  const locale = useUIStore((s) => s.locale);
  const setLocale = useUIStore((s) => s.setLocale);

  function toggle() {
    setLocale(locale === "id" ? "en" : "id");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground ring-1 ring-border transition-colors hover:bg-muted hover:text-foreground"
      aria-label={locale === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
    >
      {locale === "id" ? "EN" : "ID"}
    </button>
  );
}
