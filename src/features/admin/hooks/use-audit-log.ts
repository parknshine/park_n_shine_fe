"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios-admin";
import { queryKeys } from "@/lib/query-keys";
import type { AuditEntry } from "@/features/admin/types";

interface AuditLogFilters {
  action?: string;
  from?: string;
  to?: string;
}

export function useAuditLog(siteId: string, filters: AuditLogFilters = {}) {
  const params = new URLSearchParams();
  if (filters.action && filters.action !== "all") params.set("action", filters.action);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);

  const query = useQuery({
    enabled: !!siteId,
    queryKey: [...queryKeys.admin.auditLog(siteId), filters],
    queryFn: async () => {
      const response = await api.get<AuditEntry[]>(
        `/v1/admin/sites/${siteId}/audit-log?${params.toString()}`
      );
      return response.data;
    },
  });

  let error: string | null = null;
  if (query.error instanceof Error) {
    error = query.error.message;
  } else if (query.error) {
    error = "audit_log_fetch_failed";
  }

  return {
    entries: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error,
  };
}
