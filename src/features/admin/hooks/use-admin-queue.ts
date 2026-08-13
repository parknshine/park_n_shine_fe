"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios-admin";
import { queryKeys } from "@/lib/query-keys";
import type { AdminQueueResponse } from "@/features/admin/types";

interface UseAdminQueueOptions {
  siteId: string;
  pollIntervalMs?: number;
  enabled?: boolean;
}

export function useAdminQueue({
  siteId,
  pollIntervalMs = 3_000,
  enabled = true,
}: UseAdminQueueOptions) {
  const query = useQuery({
    enabled,
    meta: { persist: true },
    queryFn: async () => {
      const response = await api.get<AdminQueueResponse>(
        `/v1/admin/sites/${siteId}/queue`
      );
      return response.data;
    },
    queryKey: queryKeys.admin.queue(siteId),
    refetchInterval: pollIntervalMs,
    refetchIntervalInBackground: true,
  });

  async function refresh() {
    const result = await query.refetch();
    return result.data ?? null;
  }

  const error =
    query.error instanceof Error
      ? query.error.message
      : query.error
        ? "admin_queue_failed"
        : null;

  return {
    error,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isOfflinePaused: query.fetchStatus === "paused",
    queue: query.data ?? null,
    refresh,
  };
}
