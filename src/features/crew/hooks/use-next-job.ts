"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios-crew";
import { mutationKeys, queryKeys } from "@/lib/query-keys";
import type { CrewJob } from "@/features/crew/types";

export function useNextJob() {
  const queryClient = useQueryClient();
  const jobQuery = useQuery<CrewJob | null>({
    enabled: false,
    initialData: null,
    meta: { persist: false },
    queryFn: async () => queryClient.getQueryData(queryKeys.crew.nextJob()) ?? null,
    queryKey: queryKeys.crew.nextJob(),
    staleTime: Infinity,
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

  const job = jobQuery.data;
  const error =
    mutation.error instanceof Error
      ? mutation.error.message
      : mutation.error
        ? "claim_job_failed"
        : null;

  return {
    claimNextJob,
    error,
    hasNoJob: mutation.isSuccess && !job,
    isLoading: mutation.isPending,
    isOfflinePaused: mutation.isPaused,
    job: job ?? null,
  };
}
