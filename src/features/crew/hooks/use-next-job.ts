"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios-crew";
import { mutationKeys, queryKeys } from "@/lib/query-keys";
import type {
  CrewJob,
  JobPreview,
  RejectionReason,
} from "@/features/crew/types";

export async function previewNextJob(): Promise<JobPreview | null> {
  const response = await api.get<JobPreview | null>(
    "/v1/crew/jobs/next-preview",
  );
  return response.data ?? null;
}

export function useNextJob() {
  const queryClient = useQueryClient();

  const jobQuery = useQuery<CrewJob | null>({
    queryKey: queryKeys.crew.nextJob(),
    queryFn: async () => {
      const response = await api.get<CrewJob | null>("/v1/crew/jobs/active");
      return response.data ?? null;
    },
    staleTime: Infinity,
  });

  const waitStatusQuery = useQuery<{ waitUntil: number | null }>({
    queryKey: queryKeys.crew.waitStatus(),
    queryFn: async () => {
      const response = await api.get<{ waitUntil: number | null }>(
        "/v1/crew/jobs/wait-status",
      );
      return response.data;
    },
    staleTime: 30_000,
  });

  const claimMutation = useMutation({
    meta: { persist: false },
    mutationFn: async (bookingId?: string) => {
      const response = await api.post<CrewJob | null>(
        "/v1/crew/jobs/next",
        bookingId ? { bookingId } : {},
      );
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

  const rejectMutation = useMutation({
    meta: { persist: false },
    mutationFn: async ({
      bookingId,
      reason,
      note,
    }: {
      bookingId: string;
      reason: RejectionReason;
      note?: string;
    }) => {
      await api.post("/v1/crew/jobs/reject", {
        bookingId,
        reason,
        note: note?.trim() || undefined,
      });
    },
  });

  const requestWaitMutation = useMutation({
    meta: { persist: false },
    mutationFn: async ({
      bookingId,
      minutes,
    }: {
      bookingId: string;
      minutes: 10 | 30;
    }) => {
      const response = await api.post<{ ok: boolean; waitUntil: number }>(
        "/v1/crew/jobs/request-wait",
        { bookingId, minutes },
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.crew.waitStatus(), {
        waitUntil: data.waitUntil,
      });
    },
  });

  const cancelWaitMutation = useMutation({
    meta: { persist: false },
    mutationFn: async () => {
      await api.delete("/v1/crew/jobs/wait");
    },
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.crew.waitStatus(), {
        waitUntil: null,
      });
    },
  });

  function claimNextJob(bookingId?: string) {
    return claimMutation.mutateAsync(bookingId);
  }

  function rejectJob(
    bookingId: string,
    reason: RejectionReason,
    note?: string,
  ) {
    return rejectMutation.mutateAsync({ bookingId, reason, note });
  }

  function requestWait(bookingId: string, minutes: 10 | 30) {
    return requestWaitMutation.mutateAsync({ bookingId, minutes });
  }

  function cancelWait() {
    return cancelWaitMutation.mutateAsync();
  }

  const job = jobQuery.data ?? null;
  const claimError = claimMutation.error;
  const activeJobError = jobQuery.error;
  let error: string | null = null;
  if (claimError instanceof Error) error = claimError.message;
  else if (claimError) error = "claim_job_failed";
  else if (activeJobError instanceof Error) {
    // Surface active-job fetch failures instead of silently rendering as
    // "no active job" — a transient/auth failure here otherwise looks
    // identical to a crew member genuinely having no job.
    console.error("[useNextJob] active job fetch failed", activeJobError);
    error = activeJobError.message;
  } else if (activeJobError) {
    error = "active_job_fetch_failed";
  }

  return {
    claimNextJob,
    rejectJob,
    requestWait,
    cancelWait,
    waitUntil: waitStatusQuery.data?.waitUntil ?? null,
    isWaitStatusLoading: waitStatusQuery.isLoading,
    error,
    hasNoJob:
      !jobQuery.isLoading &&
      !job &&
      claimMutation.isSuccess &&
      !claimMutation.data,
    isLoading: jobQuery.isLoading || claimMutation.isPending,
    isNewlyClaimed: claimMutation.isSuccess && !!claimMutation.data,
    isOfflinePaused: claimMutation.isPaused,
    job,
  };
}
