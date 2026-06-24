"use client";

import { useEffect, useState } from "react";

// Returns true once the ETA deadline has passed. The initializer covers landing
// on a page after 00:00; the interval flips it the moment the clock crosses the
// deadline. An approved extension moves etaEndsAt into the future (new deps →
// effect re-runs), and the next tick clears the blocked state.
export function useEtaExpired(etaEndsAt?: string | null): boolean {
  const [expired, setExpired] = useState(
    () => !!etaEndsAt && Date.now() >= new Date(etaEndsAt).getTime()
  );

  useEffect(() => {
    if (!etaEndsAt) return;
    const end = new Date(etaEndsAt).getTime();
    const id = setInterval(() => setExpired(Date.now() >= end), 1000);
    return () => clearInterval(id);
  }, [etaEndsAt]);

  return expired;
}
