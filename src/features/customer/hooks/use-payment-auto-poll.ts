"use client";

import { useEffect, useRef } from "react";

const POLL_INTERVAL_MS = parseInt(
  process.env.NEXT_PUBLIC_PAYMENT_POLL_INTERVAL_MS ?? "0",
  10
);

const IS_DEV_POLL_ENABLED =
  POLL_INTERVAL_MS > 0 ||
  (typeof process !== "undefined" && process.env.NODE_ENV === "development");

const EFFECTIVE_INTERVAL_MS = POLL_INTERVAL_MS > 0 ? POLL_INTERVAL_MS : 5_000;

interface UsePaymentAutoPollOptions {
  enabled: boolean;
  onPoll: () => Promise<"PAID" | "PENDING" | null>;
  onPaid: () => void;
}

/**
 * In dev mode (NODE_ENV=development or NEXT_PUBLIC_PAYMENT_POLL_INTERVAL_MS set),
 * automatically polls check-payment at an interval so no ngrok/webhook is needed.
 * In production, this hook is a no-op — the SSE stream handles payment updates.
 */
export function usePaymentAutoPoll({
  enabled,
  onPoll,
  onPaid,
}: UsePaymentAutoPollOptions) {
  const onPollRef = useRef(onPoll);
  const onPaidRef = useRef(onPaid);

  useEffect(() => { onPollRef.current = onPoll; }, [onPoll]);
  useEffect(() => { onPaidRef.current = onPaid; }, [onPaid]);

  useEffect(() => {
    if (!IS_DEV_POLL_ENABLED || !enabled) return;

    const id = setInterval(async () => {
      const result = await onPollRef.current();
      if (result === "PAID") {
        clearInterval(id);
        onPaidRef.current();
      }
    }, EFFECTIVE_INTERVAL_MS);

    return () => clearInterval(id);
  }, [enabled]);
}
