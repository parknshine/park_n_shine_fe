"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { wrapStorageSafely } from "@/lib/safe-storage";
import {
  clearCrewTokens,
  setCrewTokens,
} from "@/lib/crew-token-storage";

interface CrewAuthState {
  crewId: string | null;
  crewName: string | null;
  siteId: string | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
}

interface CrewAuthActions {
  setCrewSession: (
    crewId: string,
    crewName: string,
    siteId: string,
    token?: string | null,
    refreshToken?: string | null,
  ) => void;
  setTokens: (token: string, refreshToken?: string | null) => void;
  clearCrewSession: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useCrewAuthStore = create<CrewAuthState & CrewAuthActions>()(
  persist(
    immer((set) => ({
      crewId: null,
      crewName: null,
      siteId: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setHasHydrated: (v) =>
        set((state) => {
          state._hasHydrated = v;
        }),

      setCrewSession: (crewId, crewName, siteId, token = null, refreshToken = null) =>
        set((state) => {
          if (token) setCrewTokens(token, refreshToken);
          state.crewId = crewId;
          state.crewName = crewName;
          state.siteId = siteId;
          if (token) state.token = token;
          if (refreshToken) state.refreshToken = refreshToken;
          state.isAuthenticated = true;
        }),

      setTokens: (token, refreshToken = null) =>
        set((state) => {
          setCrewTokens(token, refreshToken);
          state.token = token;
          if (refreshToken) state.refreshToken = refreshToken;
        }),

      clearCrewSession: () =>
        set((state) => {
          clearCrewTokens();
          state.crewId = null;
          state.crewName = null;
          state.siteId = null;
          state.token = null;
          state.refreshToken = null;
          state.isAuthenticated = false;
        }),
    })),
    {
      name: "crew-auth",
      storage: createJSONStorage(() => wrapStorageSafely(window.localStorage)),
      partialize: (state) => ({
        crewId: state.crewId,
        crewName: state.crewName,
        siteId: state.siteId,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) setCrewTokens(state.token, state.refreshToken);
        state?.setHasHydrated(true);
      },
    }
  )
);
