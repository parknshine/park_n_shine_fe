"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios-crew";
import { API_ERROR_CODES } from "@/lib/api-error";
import { mutationKeys, queryKeys } from "@/lib/query-keys";
import { useCrewAuthStore } from "@/store/crew-auth-store";
import type { CrewLoginPayload, CrewSession } from "@/features/crew/types";

/**
 * Confirms whether the httpOnly crew-token cookie still has a live server
 * session, without relying on the (possibly evicted) local auth store.
 * Never throws — a missing/expired session resolves to null.
 */
export async function fetchCrewSession(
  client: Pick<typeof api, "get">,
): Promise<CrewSession | null> {
  try {
    const response = await client.get<CrewSession>("/v1/crew/sessions/current");
    return response.data;
  } catch {
    return null;
  }
}

export function useCrewSession() {
  const queryClient = useQueryClient();
  const store = useCrewAuthStore();

  const session: CrewSession | null = store.isAuthenticated
    ? {
        id: store.crewId!,
        crewId: store.crewId!,
        crewName: store.crewName!,
        siteId: store.siteId!,
        expiresAt: "",
        token: "",
      }
    : null;

  const mutation = useMutation({
    meta: { persist: false },
    mutationFn: async (payload: CrewLoginPayload) => {
      const response = await api.post<CrewSession>("/v1/crew/sessions", payload);
      return response.data;
    },
    mutationKey: mutationKeys.crew.login(),
    onSuccess: (data) => {
      // Wipe crew-scoped cache from any previous shift BEFORE auth flips, so
      // stale job/queue snapshots never flash during the login → home transition.
      queryClient.removeQueries({ queryKey: ["crew"] });
      store.setCrewSession(data.crewId, data.crewName, data.siteId);
      queryClient.setQueryData(queryKeys.crew.session(), data);
    },
  });

  function login(payload: CrewLoginPayload) {
    return mutation.mutateAsync(payload);
  }

  async function clearSession() {
    // Invalidate the server-side cookie BEFORE clearing local state. Otherwise
    // CrewShell's recoverSession effect (which fires the moment the local
    // session goes null) can race this call, find the cookie still valid, and
    // silently re-authenticate the crew right after they logged out.
    await api.delete("/v1/crew/sessions/current").catch(() => {});
    store.clearCrewSession();
    queryClient.removeQueries({ queryKey: ["crew"] });
  }

  /**
   * Called when the local auth store looks logged-out (e.g. localStorage was
   * evicted by the OS under low device storage) but the httpOnly crew-token
   * cookie may still be valid server-side. Restores the store from the server
   * instead of forcing a redirect to login. Returns whether a session was
   * recovered.
   */
  async function recoverSession(): Promise<boolean> {
    const data = await fetchCrewSession(api);
    if (!data) return false;
    queryClient.removeQueries({ queryKey: ["crew"] });
    store.setCrewSession(data.crewId, data.crewName, data.siteId);
    queryClient.setQueryData(queryKeys.crew.session(), data);
    return true;
  }

  function getErrorKey(err: unknown): string | null {
    if (!err) return null;
    const code = (err as { code?: string }).code;
    if (code === API_ERROR_CODES.CREW_INVALID_CREDENTIALS) return "login.errors.invalidCredentials";
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
    recoverSession,
    session,
  };
}
