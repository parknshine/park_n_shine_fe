"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios-admin";
import { queryKeys } from "@/lib/query-keys";
import type { AdminReport } from "@/features/admin/types";

export function useAdminReport(siteId: string, from: string, to: string) {
  const isEnabled = !!siteId && !!from && !!to;

  const query = useQuery({
    enabled: isEnabled,
    queryKey: queryKeys.admin.report(siteId, from, to),
    queryFn: async () => {
      const response = await api.get<AdminReport>(
        `/v1/admin/reports/summary?siteId=${siteId}&from=${from}&to=${to}`
      );
      return response.data;
    },
  });

  const error =
    query.error instanceof Error
      ? query.error.message
      : query.error
        ? "report_fetch_failed"
        : null;

  return {
    report: query.data ?? null,
    isLoading: query.isLoading,
    error,
  };
}
