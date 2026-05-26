"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios-admin";
import { queryKeys, mutationKeys } from "@/lib/query-keys";
import type { AdminShift, CreateShiftPayload, UpdateShiftCrewPayload } from "@/features/admin/types";

export function useAdminShifts(siteId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    enabled: !!siteId,
    queryKey: queryKeys.admin.shifts(siteId),
    queryFn: async () => {
      const res = await api.get<AdminShift[]>(`/v1/admin/sites/${siteId}/shifts`);
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationKey: mutationKeys.admin.createShift(siteId),
    mutationFn: async (payload: CreateShiftPayload) => {
      const res = await api.post<AdminShift>(`/v1/admin/sites/${siteId}/shifts`, payload);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.shifts(siteId) });
    },
  });

  const updateCrewMutation = useMutation({
    mutationFn: async ({ shiftId, payload }: { shiftId: string; payload: UpdateShiftCrewPayload }) => {
      const res = await api.patch<AdminShift>(`/v1/admin/shifts/${shiftId}/crew`, payload);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.shifts(siteId) });
    },
  });

  const closeMutation = useMutation({
    mutationFn: async (shiftId: string) => {
      const res = await api.post<AdminShift>(`/v1/admin/shifts/${shiftId}/close`);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.shifts(siteId) });
    },
  });

  return {
    shifts: query.data ?? [],
    isLoading: query.isLoading,
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateCrew: updateCrewMutation.mutateAsync,
    close: closeMutation.mutateAsync,
    isClosing: closeMutation.isPending,
  };
}
