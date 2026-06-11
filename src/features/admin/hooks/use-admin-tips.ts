import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios-admin";
import { queryKeys, mutationKeys } from "@/lib/query-keys";
import type { CrewSummaryResponse, DisbursementEvent } from "@/features/admin/types/tip";

export function useAdminTipCrewSummary(period: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.admin.tipCrewSummary(period),
    queryFn: async () => {
      const res = await api.get<CrewSummaryResponse>(
        `/v1/admin/tips/crew-summary?period=${period}`
      );
      return res.data;
    },
    enabled: !!period,
  });

  return { crewSummary: data ?? null, isLoading, error };
}

export function useAdminDisbursements() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.admin.disbursements(),
    queryFn: async () => {
      const res = await api.get<DisbursementEvent[]>("/v1/admin/disbursements");
      return res.data;
    },
  });

  return { disbursements: data ?? [], isLoading, error };
}

export interface CreateDisbursementPayload {
  period: string;
  notes?: string;
}

export function useCreateDisbursement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.admin.createDisbursement(),
    mutationFn: async (payload: CreateDisbursementPayload) => {
      const res = await api.post<DisbursementEvent>("/v1/admin/disbursements", payload);
      return res.data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.tipCrewSummary(variables.period),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.disbursements(),
      });
    },
  });
}
