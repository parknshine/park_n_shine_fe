"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios-admin";

interface AuditActor {
  actor: string;
  label: string;
}

export function useAuditActors(siteId: string) {
  const query = useQuery({
    queryKey: ["admin", "audit-actors", siteId],
    queryFn: async () => {
      const response = await api.get<AuditActor[]>(
        `/v1/admin/sites/${siteId}/audit-actors`
      );
      return response.data;
    },
  });

  return {
    actors: query.data ?? [],
    isLoading: query.isLoading,
  };
}
