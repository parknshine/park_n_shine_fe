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
  const setActiveSiteId = useUIStore((s) => s.setActiveSiteId);
  const activeSiteId = useUIStore((s) => s.activeSiteId);

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
    const mapped = query.data.map((s) => ({ id: s.id, name: s.name }));
    setSites(mapped);
    const isValid = mapped.some((s) => s.id === activeSiteId);
    if (!isValid && mapped.length > 0) {
      setActiveSiteId(mapped[0].id);
    }
  }, [query.data, setSites, setActiveSiteId, activeSiteId]);

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
