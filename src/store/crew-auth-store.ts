"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { wrapStorageSafely } from "@/lib/safe-storage";

interface CrewAuthState {
  crewId: string | null;
  crewName: string | null;
  siteId: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
}

interface CrewAuthActions {
  setCrewSession: (crewId: string, crewName: string, siteId: string) => void;
  clearCrewSession: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useCrewAuthStore = create<CrewAuthState & CrewAuthActions>()(
  persist(
    immer((set) => ({
      crewId: null,
      crewName: null,
      siteId: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setHasHydrated: (v) =>
        set((state) => {
          state._hasHydrated = v;
        }),

      setCrewSession: (crewId, crewName, siteId) =>
        set((state) => {
          state.crewId = crewId;
          state.crewName = crewName;
          state.siteId = siteId;
          state.isAuthenticated = true;
        }),

      clearCrewSession: () =>
        set((state) => {
          state.crewId = null;
          state.crewName = null;
          state.siteId = null;
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
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
