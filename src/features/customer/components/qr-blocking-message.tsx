"use client";

import { useTranslation } from "@/i18n";

type QrBlockingReason = "paused" | "past_cutoff";

interface QrBlockingMessageProps {
  reason: QrBlockingReason;
}

const REASON_KEY: Record<QrBlockingReason, string> = {
  paused: "qr.pausedMessage",
  past_cutoff: "qr.pastCutoffMessage",
};

export function QrBlockingMessage({ reason }: QrBlockingMessageProps) {
  const { t } = useTranslation("customer");

  return (
    <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-center text-sm text-destructive">
      {t(REASON_KEY[reason])}
    </div>
  );
}
