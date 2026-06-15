"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios-crew";
import { API_ERROR_CODES } from "@/lib/api-error";
import { mutationKeys, queryKeys } from "@/lib/query-keys";
import type { CrewLoginPayload, CrewSession } from "@/features/crew/types";

export function useCrewSession() {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery<CrewSession | null>({
    enabled: false,
    placeholderData: null,
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
      localStorage.setItem("crew-token", session.token);
      queryClient.setQueryData(queryKeys.crew.session(), session);
    },
  });

  function login(payload: CrewLoginPayload) {
    return mutation.mutateAsync(payload);
  }

  function clearSession() {
    localStorage.removeItem("crew-token");
    queryClient.removeQueries({ queryKey: ["crew"] });
    api.delete("/v1/crew/sessions/current").catch(() => {});
  }

  function getErrorKey(err: unknown): string | null {
    if (!err) return null;
    const code = (err as { code?: string }).code;
    if (code === API_ERROR_CODES.CREW_INVALID_SHIFT_CODE) return "login.errors.shiftCodeInvalid";
    if (code === API_ERROR_CODES.CREW_INVALID_PIN) return "login.errors.pinInvalid";
    return "login.errors.default";
  }

  const errorKey = getErrorKey(mutation.error);

  return {
    clearSession,
    errorKey,
    isLoading: mutation.isPending,
    isOfflinePaused: mutation.isPaused,
    login,
    session: sessionQuery.data ?? null,
  };
}
