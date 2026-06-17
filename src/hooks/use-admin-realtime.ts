"use client";

import { useEffect, useRef, useState } from "react";
import { useRealtimeEvents } from "@/lib/use-realtime-events";
import adminApi from "@/lib/axios-admin";
import type { RealtimeEvent } from "@/lib/use-realtime-events";

interface UseAdminRealtimeOptions {
  onEvent: (event: RealtimeEvent) => void;
}

export function useAdminRealtime({ onEvent }: UseAdminRealtimeOptions) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  const [sseToken, setSseToken] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_REALTIME_ENABLED !== "true") return;
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    adminApi
      .post<{ sseToken: string }>("/v1/admin/realtime/sse-token")
      .then((res) => {
        setSseToken(res.data.sseToken);
      })
      .catch(() => {
        // SSE unavailable — silent fail
      })
      .finally(() => {
        fetchingRef.current = false;
      });
  }, []);

  useRealtimeEvents({
    url: sseToken ? `${baseUrl}/v1/admin/realtime/stream?token=${sseToken}` : "",
    enabled: !!sseToken,
    onEvent,
  });
}
