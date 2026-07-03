import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios-admin";
import { queryKeys, mutationKeys } from "@/lib/query-keys";
import type {
  CrewSummaryResponse,
  DisbursementEvent,
  TipListResponse,
  PendingSummaryResponse,
} from "@/features/admin/types/tip";

export function useAdminTipCrewSummary(period: string, siteId = "") {
  const query = useQuery({
    queryKey: queryKeys.admin.tipCrewSummary(period, siteId),
    queryFn: async () => {
      const params = new URLSearchParams({ period });
      if (siteId) params.set("siteId", siteId);
      const res = await api.get<CrewSummaryResponse>(`/v1/admin/tips/crew-summary?${params}`);
      return res.data;
    },
    enabled: !!period,
  });

  return { crewSummary: query.data ?? null, isLoading: query.isLoading, refetch: query.refetch, error: query.error };
}

export function useAdminTipList(
  period: string,
  page: number,
  pageSize: number,
  search: string,
  siteId: string
) {
  const query = useQuery({
    queryKey: queryKeys.admin.tipList(period, page, pageSize, search, siteId),
    queryFn: async () => {
      const params = new URLSearchParams({
        period,
        page: String(page),
        limit: String(pageSize),
        ...(search ? { search } : {}),
        ...(siteId ? { siteId } : {}),
      });
      const res = await api.get<TipListResponse>(`/v1/admin/tips?${params}`);
      return res.data;
    },
    enabled: !!period,
  });

  return { tipList: query.data ?? null, isLoading: query.isLoading, refetch: query.refetch, error: query.error };
}

export function useAdminPendingSummary() {
  const query = useQuery({
    queryKey: queryKeys.admin.tipPendingSummary(),
    queryFn: async () => {
      const res = await api.get<PendingSummaryResponse>("/v1/admin/tips/pending-summary");
      return res.data;
    },
  });

  return { pendingSummary: query.data?.periods ?? [], isLoading: query.isLoading };
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
        queryKey: ["admin", "tips", "crew-summary", variables.period],
      });
      void queryClient.invalidateQueries({
        queryKey: ["admin", "tips", "list", variables.period],
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.disbursements(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.tipPendingSummary(),
      });
    },
  });
}
