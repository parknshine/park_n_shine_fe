import { useQuery } from "@tanstack/react-query";
import crewApi from "@/lib/axios-crew";
import { queryKeys } from "@/lib/query-keys";

export interface CrewMonthlyStats {
  period: string;
  avgRating: number | null;
  jobsCompleted: number;
  tips: {
    amount: number;
    count: number;
  };
}

export function useCrewMonthlyStats() {
  return useQuery({
    queryKey: queryKeys.crew.monthlyStats(),
    queryFn: async () => {
      const res = await crewApi.get<CrewMonthlyStats>(
        "/v1/crew/me/stats/monthly",
      );
      return res.data;
    },
    // Always refetch on mount so stats are fresh after navigating back from
    // completing a job — invalidateQueries() while the query is inactive (no
    // observer on the finish page) only marks it stale, and the global default
    // refetchOnMount: false would otherwise suppress the refetch on home mount.
    refetchOnMount: "always",
    staleTime: 60_000,
  });
}
