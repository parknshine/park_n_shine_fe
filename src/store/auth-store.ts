"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { wrapStorageSafely } from "@/lib/safe-storage";
import {
  clearAdminTokens,
  setAdminTokens,
} from "@/lib/admin-token-storage";
import type { User } from "@/types";
import type { MenuAccessMap } from "@/lib/menu-access";

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  role: "super_admin" | "admin" | null;
  menuAccess: MenuAccessMap | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setUser: (
    user: User,
    token: string,
    role: "super_admin" | "admin",
    menuAccess?: MenuAccessMap | null,
    refreshToken?: string | null,
  ) => void;
  setTokens: (token: string, refreshToken?: string | null) => void;
  clearAuth: () => void;
  updateUser: (partial: Partial<User>) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    immer((set) => ({
      // state
      user: null,
      token: null,
      refreshToken: null,
      role: null,
      menuAccess: null,
      isAuthenticated: false,

      // actions
      setUser: (user, token, role, menuAccess = null, refreshToken = null) =>
        set((state) => {
          setAdminTokens(token, refreshToken);
          state.user = user;
          state.token = token;
          state.refreshToken = refreshToken;
          state.role = role;
          state.menuAccess = menuAccess;
          state.isAuthenticated = true;
        }),

      setTokens: (token, refreshToken = null) =>
        set((state) => {
          setAdminTokens(token, refreshToken);
          state.token = token;
          if (refreshToken) state.refreshToken = refreshToken;
        }),

      clearAuth: () =>
        set((state) => {
          clearAdminTokens();
          state.user = null;
          state.token = null;
          state.refreshToken = null;
          state.role = null;
          state.menuAccess = null;
          state.isAuthenticated = false;
        }),

      updateUser: (partial) =>
        set((state) => {
          if (state.user) {
            Object.assign(state.user, partial);
          }
        }),
    })),
    {
      name: "auth",
      // Never let a full/unavailable localStorage throw out of a store action
      // (a QuotaExceededError inside a layout effect crashes to global-error).
      storage: createJSONStorage(() => wrapStorageSafely(window.localStorage)),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        role: state.role,
        menuAccess: state.menuAccess,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) setAdminTokens(state.token, state.refreshToken);
      },
    }
  )
);
