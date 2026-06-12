"use client";

import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import customerApi from "@/lib/axios-customer";
import { mutationKeys } from "@/lib/query-keys";
import {
  CUSTOMER_TOKEN_KEY,
  CUSTOMER_REFRESH_KEY,
  useCustomerAuthStore,
} from "@/store/customer-auth-store";
import type { Customer } from "@/types";

interface SessionResponse {
  token: string;
  refreshToken: string;
  customer: Customer;
}

interface EmailCredentials {
  email: string;
  password: string;
}

// Map raw Firebase auth error codes to i18n keys the UI can translate.
function mapFirebaseError(error: unknown): string {
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code: unknown }).code)
      : "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "auth.errors.invalidCredentials";
    case "auth/email-already-in-use":
      return "auth.errors.emailInUse";
    case "auth/weak-password":
      return "auth.errors.weakPassword";
    case "auth/invalid-email":
      return "auth.errors.invalidEmail";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "auth.errors.popupClosed";
    case "auth/too-many-requests":
      return "auth.errors.tooManyRequests";
    default:
      return "auth.errors.generic";
  }
}

export function useCustomerAuth() {
  const router = useRouter();
  const setCustomer = useCustomerAuthStore((s) => s.setCustomer);
  const clearCustomer = useCustomerAuthStore((s) => s.clearCustomer);

  // Exchange a signed-in Firebase user for our app session and persist it.
  const startSession = useCallback(
    async (user: FirebaseUser): Promise<Customer> => {
      const idToken = await user.getIdToken();
      const { data } = await customerApi.post<SessionResponse>(
        "/v1/auth/session",
        { idToken }
      );
      localStorage.setItem(CUSTOMER_TOKEN_KEY, data.token);
      localStorage.setItem(CUSTOMER_REFRESH_KEY, data.refreshToken);
      setCustomer(data.customer);
      return data.customer;
    },
    [setCustomer]
  );

  const loginMutation = useMutation({
    meta: { persist: false },
    mutationKey: mutationKeys.customer.session(),
    mutationFn: async ({ email, password }: EmailCredentials) => {
      try {
        const { user } = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        return startSession(user);
      } catch (error) {
        throw new Error(mapFirebaseError(error));
      }
    },
  });

  const registerMutation = useMutation({
    meta: { persist: false },
    mutationKey: mutationKeys.customer.session(),
    mutationFn: async ({ email, password }: EmailCredentials) => {
      try {
        const { user } = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        return startSession(user);
      } catch (error) {
        throw new Error(mapFirebaseError(error));
      }
    },
  });

  const googleMutation = useMutation({
    meta: { persist: false },
    mutationKey: mutationKeys.customer.session(),
    mutationFn: async () => {
      try {
        const { user } = await signInWithPopup(auth, googleProvider);
        return startSession(user);
      } catch (error) {
        throw new Error(mapFirebaseError(error));
      }
    },
  });

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(CUSTOMER_REFRESH_KEY);
    try {
      if (refreshToken) {
        await customerApi.post("/v1/auth/logout", { refreshToken });
      }
    } catch {
      // best-effort server-side revoke
    }
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_REFRESH_KEY);
    clearCustomer();
    await auth.signOut().catch(() => {});
    router.replace("/login");
  }, [clearCustomer, router]);

  const pending =
    loginMutation.isPending ||
    registerMutation.isPending ||
    googleMutation.isPending;

  return {
    loginEmail: loginMutation.mutateAsync,
    registerEmail: registerMutation.mutateAsync,
    loginGoogle: googleMutation.mutateAsync,
    startSession,
    logout,
    isSubmitting: pending,
  };
}
