"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { queryKeys } from "@/lib/query-keys";

export interface PublicSite {
  id: string;
  name: string;
  address: string;
}

export function usePublicSites() {
  const query = useQuery({
    queryKey: queryKeys.customer.sites(),
    queryFn: async () => {
      const res = await api.get<PublicSite[]>("/v1/sites");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    sites: query.data ?? [],
    isLoading: query.isLoading,
  };
}
