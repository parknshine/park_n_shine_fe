"use client";

import { useEffect, useRef } from "react";

export interface RealtimeEvent {
  type: string;
  bookingId?: string;
  status?: string;
  ts: number;
  [key: string]: unknown;
}

interface UseRealtimeEventsOptions {
  /** Full URL to the SSE endpoint including query params */
  url: string;
  onEvent: (event: RealtimeEvent) => void;
  /** Set to false to pause the connection without unmounting */
  enabled?: boolean;
}

const EVENT_TYPES = ["booking_status_changed", "job_assigned", "new_job"];
const INITIAL_RECONNECT_DELAY_MS = 1_000;
const MAX_RECONNECT_DELAY_MS = 30_000;

export function useRealtimeEvents({
  url,
  onEvent,
  enabled = true,
}: UseRealtimeEventsOptions) {
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_REALTIME_ENABLED !== "true") return;
    if (!enabled || !url) return;

    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let delay = INITIAL_RECONNECT_DELAY_MS;
    let destroyed = false;

    function connect() {
      if (destroyed) return;
      es = new EventSource(url);

      es.onopen = () => {
        delay = INITIAL_RECONNECT_DELAY_MS;
      };

      const handleMessage = (ev: MessageEvent<string>) => {
        if (!ev.data || ev.data === "ping") return;
        try {
          const event = JSON.parse(ev.data) as RealtimeEvent;
          onEventRef.current(event);
        } catch {
          // ignore malformed data
        }
      };

      EVENT_TYPES.forEach((type) => es!.addEventListener(type, handleMessage));

      es.onerror = () => {
        es?.close();
        if (destroyed) return;
        reconnectTimer = setTimeout(() => {
          delay = Math.min(delay * 2, MAX_RECONNECT_DELAY_MS);
          connect();
        }, delay);
      };
    }

    connect();

    return () => {
      destroyed = true;
      clearTimeout(reconnectTimer);
      es?.close();
    };
  }, [url, enabled]);
}

/** Decode crewId from the JWT stored in localStorage without a library */
export function getCrewIdFromToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("crew-token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]!)) as { sub?: string };
    return payload.sub ?? null;
  } catch {
    return null;
  }
}
