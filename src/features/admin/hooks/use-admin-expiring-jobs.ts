"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios-admin";
import { queryKeys } from "@/lib/query-keys";
import type { AdminExpiringJobsResponse } from "@/features/admin/types";

export function useAdminExpiringJobs(pollIntervalMs = 3_000) {
  const query = useQuery({
    queryFn: async () => {
      const response = await api.get<AdminExpiringJobsResponse>(
        "/v1/admin/expiring-jobs"
      );
      return response.data;
    },
    queryKey: queryKeys.admin.expiringJobs(),
    refetchInterval: pollIntervalMs,
    refetchIntervalInBackground: true,
  });

  const error =
    query.error instanceof Error
      ? query.error.message
      : query.error
        ? "admin_expiring_jobs_failed"
        : null;

  return {
    error,
    jobs: query.data?.jobs ?? [],
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isOfflinePaused: query.fetchStatus === "paused",
  };
}
