const PREFIX = "pns_booking_idem_";

export function getBookingIdempotencyKey(flowKey: string): string {
  if (typeof window === "undefined") return crypto.randomUUID();
  const storageKey = `${PREFIX}${flowKey}`;
  const existing = sessionStorage.getItem(storageKey);
  if (existing) return existing;
  const next = crypto.randomUUID();
  sessionStorage.setItem(storageKey, next);
  return next;
}

export function clearBookingIdempotencyKey(flowKey: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(`${PREFIX}${flowKey}`);
}
