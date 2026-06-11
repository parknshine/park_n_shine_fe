"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios-admin";
import { queryKeys } from "@/lib/query-keys";
import type { AdminAllSitesQueueResponse } from "@/features/admin/types";

interface UseAdminAllSitesQueueOptions {
  pollIntervalMs?: number;
}

export function useAdminAllSitesQueue({
  pollIntervalMs = 10_000,
}: UseAdminAllSitesQueueOptions = {}) {
  const query = useQuery({
    meta: { persist: true },
    queryFn: async () => {
      const response = await api.get<AdminAllSitesQueueResponse>("/v1/admin/queue");
      return response.data;
    },
    queryKey: queryKeys.admin.allSitesQueue(),
    refetchInterval: pollIntervalMs,
  });

  async function refresh() {
    const result = await query.refetch();
    return result.data ?? null;
  }

  const error =
    query.error instanceof Error
      ? query.error.message
      : query.error
        ? "admin_all_sites_queue_failed"
        : null;

  return {
    error,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isOfflinePaused: query.fetchStatus === "paused",
    sites: query.data?.sites ?? [],
    refresh,
  };
}
