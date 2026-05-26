"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios-crew";
import { mutationKeys } from "@/lib/query-keys";
import type { VerifyPlatePayload } from "@/features/crew/types";

export function useVerifyPlate(jobId: string) {
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    meta: { persist: false },
    mutationFn: async (payload: VerifyPlatePayload) => {
      await api.post(`/v1/crew/jobs/${jobId}/verify`, payload);
    },
    mutationKey: mutationKeys.crew.verifyPlate(jobId),
    onError: (err) => {
      setError(err instanceof Error ? err.message : "verify_failed");
    },
    onMutate: () => {
      setError(null);
    },
  });

  function verify(payload: VerifyPlatePayload) {
    return mutation.mutateAsync(payload);
  }

  return {
    error,
    isLoading: mutation.isPending,
    verify,
  };
}
