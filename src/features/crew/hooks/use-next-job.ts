"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios-crew";
import { mutationKeys, queryKeys } from "@/lib/query-keys";
import type { CrewJob } from "@/features/crew/types";

export function useNextJob() {
  const queryClient = useQueryClient();

  // Auto-fetch on mount — recovers active job after refresh/relog
  const jobQuery = useQuery<CrewJob | null>({
    queryKey: queryKeys.crew.nextJob(),
    queryFn: async () => {
      const response = await api.get<CrewJob | null>("/v1/crew/jobs/active");
      return response.data ?? null;
    },
    staleTime: Infinity,
    meta: { persist: false },
  });

  const mutation = useMutation({
    meta: { persist: false },
    mutationFn: async () => {
      const response = await api.post<CrewJob | null>("/v1/crew/jobs/next");
      return response.data;
    },
    mutationKey: mutationKeys.crew.nextJob(),
    onSuccess: (job) => {
      queryClient.setQueryData(queryKeys.crew.nextJob(), job);
      if (job) {
        queryClient.setQueryData(queryKeys.crew.job(job.id), job);
      }
    },
  });

  function claimNextJob() {
    return mutation.mutateAsync();
  }

  const job = jobQuery.data ?? null;
  const error =
    mutation.error instanceof Error
      ? mutation.error.message
      : mutation.error
        ? "claim_job_failed"
        : null;

  return {
    claimNextJob,
    error,
    hasNoJob: !jobQuery.isLoading && !job && mutation.isSuccess && !mutation.data,
    isLoading: jobQuery.isLoading || mutation.isPending,
    isNewlyClaimed: mutation.isSuccess && !!mutation.data,
    isOfflinePaused: mutation.isPaused,
    job,
  };
}
