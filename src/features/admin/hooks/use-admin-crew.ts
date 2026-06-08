"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios-admin";
import { queryKeys, mutationKeys } from "@/lib/query-keys";
import type { AdminCrewMember, CreateCrewPayload, UpdateCrewPayload } from "@/features/admin/types";

export function useAdminCrew() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.admin.crew(),
    queryFn: async () => {
      const res = await api.get<AdminCrewMember[]>("/v1/admin/crew");
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationKey: mutationKeys.admin.createCrew(),
    mutationFn: async (payload: CreateCrewPayload) => {
      const res = await api.post<AdminCrewMember>("/v1/admin/crew", payload);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.crew() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ crewId, payload }: { crewId: string; payload: UpdateCrewPayload }) => {
      const res = await api.patch<AdminCrewMember>(`/v1/admin/crew/${crewId}`, payload);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.crew() });
    },
  });

  return {
    crew: query.data ?? [],
    isLoading: query.isLoading,
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    update: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

export function useDeleteCrew() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "crew", "delete"],
    mutationFn: async (crewId: string) => {
      await api.delete(`/v1/admin/crew/${crewId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.crew() });
    },
  });
}
