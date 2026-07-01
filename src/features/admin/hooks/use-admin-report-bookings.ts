"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/axios-admin";
import { queryKeys } from "@/lib/query-keys";
import type { ReportBookingRow } from "@/features/admin/types";

export interface ReportBookingFilters {
  crewId?: string;
  statuses?: string[];
  refunded?: boolean;
  hasRating?: boolean;
  hasPhotos?: boolean;
  search?: string;
}

export interface ReportBookingsResponse {
  rows: ReportBookingRow[];
  total: number;
  page: number;
  limit: number;
}

export function useAdminReportBookings(
  siteId: string | undefined,
  from: string,
  to: string,
  filters?: ReportBookingFilters,
  page = 1,
  pageSize = 25,
) {
  const query = useQuery({
    enabled: true,
    placeholderData: keepPreviousData,
    queryKey: queryKeys.admin.reportBookings(siteId ?? "", from, to, filters, page, pageSize, filters?.search),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (siteId) params.set("siteId", siteId);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (filters?.crewId) params.set("crewId", filters.crewId);
      if (filters?.statuses?.length) params.set("statuses", filters.statuses.join(","));
      if (filters?.refunded !== undefined) params.set("refunded", String(filters.refunded));
      if (filters?.hasRating !== undefined) params.set("hasRating", String(filters.hasRating));
      if (filters?.hasPhotos !== undefined) params.set("hasPhotos", String(filters.hasPhotos));
      if (filters?.search) params.set("search", filters.search);
      params.set("page", String(page));
      params.set("limit", String(pageSize));
      const response = await api.get<ReportBookingsResponse>(`/v1/admin/reports/bookings?${params}`);
      return response.data;
    },
  });

  return {
    bookings: query.data?.rows ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
  };
}
