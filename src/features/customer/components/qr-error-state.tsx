"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslation } from "@/i18n";

export type QrReason = "invalid" | "rotated" | "paused" | "past_cutoff";

const REASON_KEY: Record<QrReason, string> = {
  invalid: "qr.invalidMessage",
  rotated: "qr.rotatedMessage",
  paused: "qr.pausedMessage",
  past_cutoff: "qr.pastCutoffMessage",
};

interface QrErrorStateProps {
  reason: QrReason;
  /** Admin-provided custom text (e.g. a launch-date note) — overrides the default copy for `reason` when present. */
  message?: string | null;
}

export function QrErrorState({ reason, message }: QrErrorStateProps) {
  const { t } = useTranslation("customer");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-foreground">{t("qr.cannotProceedTitle")}</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          {message || t(REASON_KEY[reason])}
        </p>
      </div>
    </div>
  );
}
