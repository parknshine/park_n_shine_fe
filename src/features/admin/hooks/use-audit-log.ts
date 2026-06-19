"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios-admin";
import { queryKeys } from "@/lib/query-keys";
import type { AuditEntry } from "@/features/admin/types";

interface AuditLogFilters {
  action?: string;
  from?: string;
  to?: string;
  actor?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

interface AuditLogResponse {
  entries: AuditEntry[];
  totalCount: number;
}

export function useAuditLog(siteId: string, filters: AuditLogFilters = {}) {
  const params = new URLSearchParams();
  if (filters.action && filters.action !== "all") params.set("action", filters.action);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.actor) params.set("actor", filters.actor);
  if (filters.search) params.set("search", filters.search);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));

  const query = useQuery({
    enabled: true,
    queryKey: [...queryKeys.admin.auditLog(siteId), filters],
    queryFn: async () => {
      const response = await api.get<AuditLogResponse>(
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
    entries: query.data?.entries ?? [],
    totalCount: query.data?.totalCount ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error,
  };
}
