"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";

// Route-level boundary for the admin console. Catches render/effect errors
// before they bubble up to global-error (which replaces the whole document)
// and surfaces the message so support can identify the failure.
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation("common");

  useEffect(() => {
    console.error("[admin] uncaught error", error);
    if (Sentry.isInitialized()) {
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    <div className='flex h-dvh flex-col items-center justify-center gap-4 p-6 text-center'>
      <h2 className='text-lg font-semibold'>{t("error.generic")}</h2>
      <p className='max-w-md break-words font-mono text-xs text-muted-foreground'>
        {error.name}: {error.message}
        {error.digest ? ` (${error.digest})` : ""}
      </p>
      <Button onClick={() => reset()}>{t("action.retry")}</Button>
    </div>
  );
}
