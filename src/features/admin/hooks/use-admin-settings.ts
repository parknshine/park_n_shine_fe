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
    mutationFn: async (payload: Partial<Pick<AdminSettings,
      "whatsappNumber" | "avgCleaningMinutes" | "paymentExpiryMinutes" |
      "crewTimeExtensionMinutes" | "washPrice" | "loyaltyEnabled" | "loyaltyOtpChannel" |
      "signupDiscountPercent" | "loyaltyWashThreshold" | "loyaltyRewardDiscountPercent"
    >>) => {
      const response = await api.post<AdminSettings>("/v1/admin/settings", payload);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.settings(),
      });
    },
  });

  const uploadPromoBannerMutation = useMutation({
    meta: { persist: false },
    mutationKey: mutationKeys.admin.uploadPromoBanner(),
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post<AdminSettings>(
        "/v1/admin/settings/promo-banner",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.settings(),
      });
    },
  });

  const deletePromoBannerMutation = useMutation({
    meta: { persist: false },
    mutationKey: mutationKeys.admin.deletePromoBanner(),
    mutationFn: async (key: string) => {
      const response = await api.delete<AdminSettings>(
        `/v1/admin/settings/promo-banner?key=${encodeURIComponent(key)}`,
      );
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.settings(),
      });
    },
  });

  let error: string | null = null;
  if (saveMutation.error instanceof Error) {
    error = saveMutation.error.message;
  } else if (saveMutation.error) {
    error = "settings_save_failed";
  }

  return {
    settings: query.data ?? null,
    isLoading: query.isLoading,
    save: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    saveSuccess: saveMutation.isSuccess,
    error,
    uploadPromoBanner: uploadPromoBannerMutation.mutateAsync,
    isUploadingPromoBanner: uploadPromoBannerMutation.isPending,
    deletePromoBanner: deletePromoBannerMutation.mutateAsync,
    isDeletingPromoBanner: deletePromoBannerMutation.isPending,
  };
}
