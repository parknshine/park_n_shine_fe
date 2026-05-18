"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { mutationKeys, queryKeys } from "@/lib/query-keys";
import type { CrewLoginPayload, CrewSession } from "@/features/crew/types";

export function useCrewSession() {
  const queryClient = useQueryClient();
  const sessionQuery = useQuery<CrewSession | null>({
    enabled: false,
    initialData: null,
    queryFn: async () => queryClient.getQueryData(queryKeys.crew.session()) ?? null,
    queryKey: queryKeys.crew.session(),
    staleTime: Infinity,
  });

  const mutation = useMutation({
    meta: { persist: false },
    mutationFn: async (payload: CrewLoginPayload) => {
      const response = await api.post<CrewSession>("/v1/crew/sessions", payload);
      return response.data;
    },
    mutationKey: mutationKeys.crew.login(),
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.crew.session(), session);
    },
  });

  function login(payload: CrewLoginPayload) {
    return mutation.mutateAsync(payload);
  }

  function clearSession() {
    queryClient.removeQueries({ queryKey: queryKeys.crew.session() });
  }

  const error =
    mutation.error instanceof Error
      ? mutation.error.message
      : mutation.error
        ? "crew_login_failed"
        : null;

  return {
    clearSession,
    error,
    isLoading: mutation.isPending,
    isOfflinePaused: mutation.isPaused,
    login,
    session: sessionQuery.data ?? null,
  };
}
