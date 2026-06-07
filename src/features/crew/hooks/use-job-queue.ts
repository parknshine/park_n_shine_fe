"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios-crew";
import { queryKeys } from "@/lib/query-keys";

const POLL_INTERVAL_MS = 15_000; // refresh every 15 seconds while crew is on home page

interface JobQueueData {
  count: number;
}

/**
 * Polls the backend for the number of PAID bookings waiting at this crew's site.
 * Automatically refetches every 15 seconds so the crew sees new jobs without
 * having to manually tap "Claim".
 */
export function useJobQueue() {
  const query = useQuery<JobQueueData>({
    queryKey: queryKeys.crew.queue(),
    queryFn: async () => {
      const response = await api.get<JobQueueData>("/v1/crew/jobs/queue");
      return response.data;
    },
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: false, // pause polling when tab is not focused
    refetchOnMount: "always",
    staleTime: POLL_INTERVAL_MS - 1_000,
  });

  const count = query.data?.count ?? 0;

  return {
    count,
    hasJob: count > 0,
    isLoading: query.isLoading,
    lastChecked: query.dataUpdatedAt,
  };
}
