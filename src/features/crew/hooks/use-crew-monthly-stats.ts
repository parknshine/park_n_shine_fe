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
      const res = await crewApi.get<CrewMonthlyStats>("/v1/crew/me/stats/monthly");
      return res.data;
    },
    staleTime: 60_000,
  });
}
