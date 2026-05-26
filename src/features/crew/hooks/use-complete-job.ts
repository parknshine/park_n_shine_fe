"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios-crew";
import { mutationKeys, queryKeys } from "@/lib/query-keys";

export function useCompleteJob(jobId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    meta: { persist: false },
    mutationFn: async () => {
      await api.post(`/v1/crew/jobs/${jobId}/complete`);
    },
    mutationKey: mutationKeys.crew.completeJob(jobId),
    onSuccess: () => {
      // Clear job + next-job cache so home page starts fresh
      queryClient.removeQueries({ queryKey: queryKeys.crew.job(jobId) });
      queryClient.removeQueries({ queryKey: queryKeys.crew.nextJob() });
      // Immediately refresh queue count so home page reflects the completed job
      void queryClient.invalidateQueries({ queryKey: queryKeys.crew.queue() });
    },
  });

  return {
    complete: () => mutation.mutateAsync(),
    error:
      mutation.error instanceof Error
        ? mutation.error.message
        : mutation.error
          ? "complete_failed"
          : null,
    isLoading: mutation.isPending,
  };
}
