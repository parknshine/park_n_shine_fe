"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios-admin";
import { queryKeys } from "@/lib/query-keys";
import type { AdminEscalationsResponse } from "@/features/admin/types";

export function useAdminEscalations(pollIntervalMs = 3_000) {
  const query = useQuery({
    queryFn: async () => {
      const response = await api.get<AdminEscalationsResponse>(
        "/v1/admin/escalations"
      );
      return response.data;
    },
    queryKey: queryKeys.admin.escalations(),
    refetchInterval: pollIntervalMs,
    refetchIntervalInBackground: true,
  });

  const error =
    query.error instanceof Error
      ? query.error.message
      : query.error
        ? "admin_escalations_failed"
        : null;

  return {
    error,
    escalations: query.data?.escalations ?? [],
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isOfflinePaused: query.fetchStatus === "paused",
  };
}
