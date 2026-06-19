"use client";

import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios-crew";
import { mutationKeys } from "@/lib/query-keys";

export function useDoneWashing(jobId: string) {
  const mutation = useMutation({
    meta: { persist: false },
    mutationFn: async () => {
      await api.post(`/v1/crew/jobs/${jobId}/done-washing`);
    },
    mutationKey: mutationKeys.crew.completeJob(`done-washing:${jobId}`),
  });

  return {
    doneWashing: () => mutation.mutateAsync(),
    isLoading: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : mutation.error ? "done_washing_failed" : null,
  };
}
