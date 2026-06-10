"use client";

import { useRealtimeEvents } from "@/lib/use-realtime-events";

interface AdminRealtimeEvent {
  type: string;
  bookingId?: string;
  requestId?: string;
  crewId?: string;
  ts?: number;
  [key: string]: unknown;
}

interface UseAdminRealtimeOptions {
  onEvent: (event: AdminRealtimeEvent) => void;
}

export function useAdminRealtime({ onEvent }: UseAdminRealtimeOptions) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

  useRealtimeEvents({
    url: () => {
      if (typeof window === "undefined") return "";
      const token = localStorage.getItem("admin-token") ?? "";
      if (!token) return "";
      return `${baseUrl}/v1/admin/realtime/stream?token=${token}`;
    },
    enabled: true,
    onEvent: onEvent as (event: Record<string, unknown>) => void,
  });
}
