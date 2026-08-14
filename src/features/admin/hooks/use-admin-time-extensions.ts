"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios-admin";
import { queryKeys } from "@/lib/query-keys";
import type { AdminTimeExtensionRequestsResponse } from "@/features/admin/types";

export function useAdminTimeExtensionRequests(pollIntervalMs = 3_000) {
  const query = useQuery({
    meta: { persist: true },
    queryFn: async () => {
      const response = await api.get<AdminTimeExtensionRequestsResponse>(
        "/v1/admin/time-extension-requests",
      );
      return response.data;
    },
    queryKey: queryKeys.admin.timeExtensionRequests(),
    refetchInterval: pollIntervalMs,
    refetchIntervalInBackground: true,
  });

  const error =
    query.error instanceof Error
      ? query.error.message
      : query.error
        ? "admin_time_extension_requests_failed"
        : null;

  return {
    error,
    requests: query.data?.requests ?? [],
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isOfflinePaused: query.fetchStatus === "paused",
  };
}
