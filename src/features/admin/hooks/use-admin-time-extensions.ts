"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios-admin";
import { queryKeys } from "@/lib/query-keys";
import type { AdminTimeExtensionRequestsResponse } from "@/features/admin/types";

// Stable empty array so `requests` keeps the same reference while the query is
// loading/undefined. Returning a fresh `[]` on every render causes downstream
// effects (e.g. the admin layout syncing notifications into the UI store) to
// loop infinitely — "Maximum update depth exceeded".
const EMPTY_REQUESTS: AdminTimeExtensionRequestsResponse["requests"] = [];

export function useAdminTimeExtensionRequests(pollIntervalMs = 3_000) {
  const query = useQuery({
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
    requests: query.data?.requests ?? EMPTY_REQUESTS,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isOfflinePaused: query.fetchStatus === "paused",
  };
}
