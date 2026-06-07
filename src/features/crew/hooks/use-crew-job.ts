"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios-crew";
import { queryKeys } from "@/lib/query-keys";
import type { CrewJob } from "@/features/crew/types";

export function useCrewJob(jobId: string) {
  const jobQuery = useQuery<CrewJob | null>({
    enabled: !!jobId,
    queryFn: async () => {
      const response = await api.get<CrewJob>(`/v1/crew/jobs/${jobId}`);
      return response.data;
    },
    queryKey: queryKeys.crew.job(jobId),
    staleTime: 30_000,
  });

  const error =
    jobQuery.error instanceof Error
      ? jobQuery.error.message
      : jobQuery.error
        ? "job_fetch_failed"
        : null;

  return {
    error,
    isLoading: jobQuery.isLoading,
    job: jobQuery.data ?? null,
  };
}
