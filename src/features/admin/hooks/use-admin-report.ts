"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios-admin";
import { queryKeys } from "@/lib/query-keys";
import type { AdminReport } from "@/features/admin/types";

export function useAdminReport(siteId: string | undefined, from: string, to: string) {
  const query = useQuery({
    enabled: true,
    queryKey: queryKeys.admin.report(siteId ?? "", from, to),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (siteId) params.set("siteId", siteId);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const response = await api.get<AdminReport>(`/v1/admin/reports/summary?${params}`);
      return response.data;
    },
  });

  let error: string | null = null;
  if (query.error instanceof Error) {
    error = query.error.message;
  } else if (query.error) {
    error = "report_fetch_failed";
  }

  return {
    report: query.data ?? null,
    isLoading: query.isLoading,
    refetch: query.refetch,
    error,
  };
}
