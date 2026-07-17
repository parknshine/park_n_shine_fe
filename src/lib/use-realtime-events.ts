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
  /** Full URL or a function that returns the current URL (called on every connect attempt) */
  url: string | (() => string);
  onEvent: (event: RealtimeEvent) => void;
  /** Set to false to pause the connection without unmounting */
  enabled?: boolean;
}

const EVENT_TYPES = ["booking_status_changed", "job_assigned", "new_job", "crew_time_extension_request", "eta_extended", "time_extension_approved", "time_extension_rejected", "tip_paid", "payment_confirmed", "payment_failed", "chat_message"];
const INITIAL_RECONNECT_DELAY_MS = 1_000;
const MAX_RECONNECT_DELAY_MS = 30_000;

/** Appends `sinceId` as a query param so a reconnecting client can ask the
 * server to replay events it missed while disconnected. Pure so it's testable
 * without an EventSource/DOM environment. */
export function appendSinceId(url: string, sinceId: string | null): string {
  if (!sinceId) return url;
  return `${url}${url.includes("?") ? "&" : "?"}sinceId=${encodeURIComponent(sinceId)}`;
}

export function useRealtimeEvents({
  url,
  onEvent,
  enabled = true,
}: UseRealtimeEventsOptions) {
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const resolvedUrl = typeof url === "function" ? url() : url;

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_REALTIME_ENABLED !== "true") return;
    if (!enabled || !resolvedUrl) return;

    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let delay = INITIAL_RECONNECT_DELAY_MS;
    let destroyed = false;
    let lastEventId: string | null = null;

    function connect() {
      if (destroyed) return;
      const currentUrl = typeof url === "function" ? url() : url;
      es = new EventSource(appendSinceId(currentUrl, lastEventId));

      es.onopen = () => {
        delay = INITIAL_RECONNECT_DELAY_MS;
      };

      const handleMessage = (ev: MessageEvent<string>) => {
        if (ev.lastEventId) lastEventId = ev.lastEventId;
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
  }, [resolvedUrl, enabled]); // eslint-disable-line react-hooks/exhaustive-deps
}
