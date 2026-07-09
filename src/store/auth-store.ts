"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { User } from "@/types";
import type { MenuAccessMap } from "@/lib/menu-access";

interface AuthState {
  user: User | null;
  token: string | null;
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
  ) => void;
  clearAuth: () => void;
  updateUser: (partial: Partial<User>) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    immer((set) => ({
      // state
      user: null,
      token: null,
      role: null,
      menuAccess: null,
      isAuthenticated: false,

      // actions
      setUser: (user, token, role, menuAccess = null) =>
        set((state) => {
          state.user = user;
          state.token = token;
          state.role = role;
          state.menuAccess = menuAccess;
          state.isAuthenticated = true;
        }),

      clearAuth: () =>
        set((state) => {
          state.user = null;
          state.token = null;
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
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        menuAccess: state.menuAccess,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
