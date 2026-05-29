"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios-admin";

export type WaStatus = "disabled" | "disconnected" | "connecting" | "qr_ready" | "connected";

export interface WaState {
  status: WaStatus;
  qr: string | null;
}

export function useAdminWhatsapp() {
  const queryClient = useQueryClient();

  const query = useQuery<WaState>({
    queryKey: ["admin", "whatsapp", "status"],
    queryFn: async () => {
      const res = await api.get<WaState>("/v1/admin/whatsapp/status");
      return res.data;
    },
    // Poll every 3s while waiting for QR scan or connection
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "connected" || status === "disabled") return false;
      return 3_000;
    },
    refetchIntervalInBackground: false,
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<WaState>("/v1/admin/whatsapp/connect");
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "whatsapp", "status"] });
    },
  });

  return {
    state: query.data ?? { status: "disconnected" as WaStatus, qr: null },
    isLoading: query.isLoading,
    connect: connectMutation.mutateAsync,
    isConnecting: connectMutation.isPending,
  };
}
