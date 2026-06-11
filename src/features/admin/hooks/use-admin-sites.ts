"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios-admin";
import { queryKeys, mutationKeys } from "@/lib/query-keys";
import { useUIStore } from "@/store/ui-store";
import type {
  AdminSiteDetail,
  CreateSitePayload,
  UpdateSitePayload,
} from "@/features/admin/types";

export function useAdminSites() {
  const queryClient = useQueryClient();
  const setSites = useUIStore((s) => s.setSites);

  const query = useQuery({
    queryKey: queryKeys.admin.sites(),
    queryFn: async () => {
      const res = await api.get<AdminSiteDetail[]>("/v1/admin/sites");
      return res.data;
    },
    staleTime: 30_000,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (!query.data) return;
    setSites(query.data.map((s) => ({ id: s.id, name: s.name })));
  }, [query.data, setSites]);

  const createMutation = useMutation({
    mutationKey: mutationKeys.admin.createSite(),
    mutationFn: async (payload: CreateSitePayload) => {
      const res = await api.post<AdminSiteDetail>("/v1/admin/sites", payload);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.sites() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      siteId,
      payload,
    }: {
      siteId: string;
      payload: UpdateSitePayload;
    }) => {
      const res = await api.patch<AdminSiteDetail>(
        `/v1/admin/sites/${siteId}`,
        payload,
      );
      return res.data;
    },
    onSuccess: (_data, { siteId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.sites() });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.site(siteId),
      });
    },
  });
  return {
    sites: query.data ?? [],
    isLoading: query.isLoading,
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    update: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

export function useAdminSite(siteId: string) {
  return useQuery({
    enabled: !!siteId,
    queryKey: queryKeys.admin.site(siteId),
    queryFn: async () => {
      const res = await api.get<AdminSiteDetail>(`/v1/admin/sites/${siteId}`);
      return res.data;
    },
  });
}
