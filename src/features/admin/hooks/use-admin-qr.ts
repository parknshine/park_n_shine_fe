"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios-admin";
import { queryKeys, mutationKeys } from "@/lib/query-keys";
import type { AdminQrCode, GenerateQrPayload, RotateQrResult } from "@/features/admin/types";

export function useAdminQr(siteId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    enabled: !!siteId,
    queryKey: queryKeys.admin.qrCodes(siteId),
    queryFn: async () => {
      const res = await api.get<AdminQrCode[]>(`/v1/admin/sites/${siteId}/qr-codes`);
      return res.data;
    },
  });

  const generateMutation = useMutation({
    mutationKey: mutationKeys.admin.generateQr(siteId),
    mutationFn: async (payload: GenerateQrPayload) => {
      const res = await api.post<AdminQrCode>(`/v1/admin/sites/${siteId}/qr-codes`, payload);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.qrCodes(siteId) });
    },
  });

  const rotateMutation = useMutation({
    mutationFn: async (qrId: string) => {
      const res = await api.post<RotateQrResult>(`/v1/admin/qr-codes/${qrId}/rotate`);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.qrCodes(siteId) });
    },
  });

  return {
    qrCodes: query.data ?? [],
    isLoading: query.isLoading,
    generate: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
    rotate: rotateMutation.mutateAsync,
    isRotating: rotateMutation.isPending,
  };
}
