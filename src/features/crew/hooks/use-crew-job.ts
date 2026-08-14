"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import api from "@/lib/axios-crew";
import { queryKeys } from "@/lib/query-keys";
import type { CrewJob } from "@/features/crew/types";

export function useCrewJob(
  jobId: string,
  options?: Pick<UseQueryOptions<CrewJob | null>, "refetchInterval">,
) {
  const jobQuery = useQuery<CrewJob | null>({
    enabled: !!jobId,
    queryFn: async () => {
      const response = await api.get<CrewJob>(`/v1/crew/jobs/${jobId}`);
      return response.data;
    },
    queryKey: queryKeys.crew.job(jobId),
    staleTime: 30_000,
    refetchInterval: options?.refetchInterval,
  });

  let error: string | null = null;
  if (jobQuery.error) {
    error =
      jobQuery.error instanceof Error
        ? jobQuery.error.message
        : "job_fetch_failed";
  }

  return {
    error,
    isLoading: jobQuery.isLoading,
    job: jobQuery.data ?? null,
  };
}
