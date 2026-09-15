"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { wrapStorageSafely } from "@/lib/safe-storage";
import {
  clearCustomerTokens,
  setCustomerTokens,
} from "@/lib/customer-token-storage";
import type { Customer } from "@/types";

interface CustomerAuthState {
  customer: Customer | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
}

interface CustomerAuthActions {
  setCustomer: (
    customer: Customer,
    token?: string | null,
    refreshToken?: string | null,
  ) => void;
  setTokens: (token: string, refreshToken?: string | null) => void;
  updateCustomer: (partial: Partial<Customer>) => void;
  clearCustomer: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useCustomerAuthStore = create<
  CustomerAuthState & CustomerAuthActions
>()(
  persist(
    immer((set) => ({
      customer: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setCustomer: (customer, token = null, refreshToken = null) =>
        set((state) => {
          if (token) setCustomerTokens(token, refreshToken);
          state.customer = customer;
          if (token) state.token = token;
          if (refreshToken) state.refreshToken = refreshToken;
          state.isAuthenticated = true;
        }),

      setTokens: (token, refreshToken = null) =>
        set((state) => {
          setCustomerTokens(token, refreshToken);
          state.token = token;
          if (refreshToken) state.refreshToken = refreshToken;
        }),

      updateCustomer: (partial) =>
        set((state) => {
          if (state.customer) {
            Object.assign(state.customer, partial);
          }
        }),

      clearCustomer: () =>
        set((state) => {
          clearCustomerTokens();
          state.customer = null;
          state.token = null;
          state.refreshToken = null;
          state.isAuthenticated = false;
        }),

      setHasHydrated: (value) =>
        set((state) => {
          state._hasHydrated = value;
        }),
    })),
    {
      name: "customer-auth",
      storage: createJSONStorage(() => wrapStorageSafely(window.localStorage)),
      partialize: (state) => ({
        customer: state.customer,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) setCustomerTokens(state.token, state.refreshToken);
        state?.setHasHydrated(true);
      },
    }
  )
);
