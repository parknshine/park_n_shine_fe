"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { i18n } from "@/i18n";
import { useUIStore } from "@/store/ui-store";

interface I18nProviderProps {
  children: ReactNode;
}

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function I18nProvider({ children }: I18nProviderProps) {
  const mounted = useIsMounted();
  const locale = useUIStore((s) => s.locale);

  useEffect(() => {
    let hasStoredLocale = false;
    try {
      const stored = localStorage.getItem("ui");
      hasStoredLocale = !!JSON.parse(stored ?? "{}")?.state?.locale;
    } catch {}

    useUIStore.persist.rehydrate();

    if (!hasStoredLocale) {
      const detected = navigator.language.startsWith("en") ? "en" : "id";
      useUIStore.getState().setLocale(detected);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    void i18n.changeLanguage(locale);
  }, [locale, mounted]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
