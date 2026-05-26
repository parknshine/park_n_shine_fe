"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios-admin";
import { mutationKeys, queryKeys } from "@/lib/query-keys";
import type { AdminSettings } from "@/features/admin/types";

export function useAdminSettings() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.admin.settings(),
    queryFn: async () => {
      const response = await api.get<AdminSettings>("/v1/admin/settings");
      return response.data;
    },
  });

  const saveMutation = useMutation({
    meta: { persist: false },
    mutationKey: mutationKeys.admin.saveSettings(),
    mutationFn: async (payload: { staleJobTimeoutMinutes: number }) => {
      const response = await api.post<AdminSettings>("/v1/admin/settings", payload);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.settings(),
      });
    },
  });

  const error =
    saveMutation.error instanceof Error
      ? saveMutation.error.message
      : saveMutation.error
        ? "settings_save_failed"
        : null;

  return {
    settings: query.data ?? null,
    isLoading: query.isLoading,
    save: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    saveSuccess: saveMutation.isSuccess,
    error,
  };
}
