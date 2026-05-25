"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { queryKeys } from "@/lib/query-keys";
import type { WalkInQueueResponse } from "@/features/admin/types";

interface UseWalkInQueueOptions {
  pollIntervalMs?: number;
  enabled?: boolean;
}

export function useWalkInQueue({
  pollIntervalMs = 10_000,
  enabled = true,
}: UseWalkInQueueOptions = {}) {
  const query = useQuery({
    enabled,
    queryFn: async () => {
      const response = await api.get<WalkInQueueResponse>("/v1/admin/queue/walkin");
      return response.data;
    },
    queryKey: queryKeys.admin.walkInQueue(),
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
        ? "walkin_queue_failed"
        : null;

  return {
    error,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    queue: query.data ?? null,
    refresh,
  };
}
