import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { Customer } from "@/types";

// Token storage keys — shared with axios-customer interceptor.
export const CUSTOMER_TOKEN_KEY = "pns_token";
export const CUSTOMER_REFRESH_KEY = "pns_refresh";

interface CustomerAuthState {
  customer: Customer | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
}

interface CustomerAuthActions {
  setCustomer: (customer: Customer) => void;
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
      isAuthenticated: false,
      _hasHydrated: false,

      setCustomer: (customer) =>
        set((state) => {
          state.customer = customer;
          state.isAuthenticated = true;
        }),

      updateCustomer: (partial) =>
        set((state) => {
          if (state.customer) {
            Object.assign(state.customer, partial);
          }
        }),

      clearCustomer: () =>
        set((state) => {
          state.customer = null;
          state.isAuthenticated = false;
        }),

      setHasHydrated: (value) =>
        set((state) => {
          state._hasHydrated = value;
        }),
    })),
    {
      name: "customer-auth",
      partialize: (state) => ({
        customer: state.customer,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
