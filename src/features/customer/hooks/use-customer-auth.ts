"use client";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  confirmPasswordReset,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import customerApi from "@/lib/axios-customer";
import { mutationKeys } from "@/lib/query-keys";
import { useCustomerAuthStore } from "@/store/customer-auth-store";
import { clearGuestBookingPointer } from "@/lib/guest-booking-pointer";
import type { Customer } from "@/types";

interface SessionResponse {
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
    case "auth/too-many-requests":
      return "auth.errors.tooManyRequests";
    case "auth/user-disabled":
      return "auth.errors.userDisabled";
    case "auth/account-exists-with-different-credential":
      return "auth.errors.accountExistsDifferentProvider";
    case "auth/network-request-failed":
      return "auth.errors.networkError";
    case "auth/invalid-action-code":
      return "auth.errors.invalidActionCode";
    case "auth/expired-action-code":
      return "auth.errors.expiredActionCode";
    default:
      return "auth.errors.generic";
  }
}

export function useCustomerAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
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
      // Drop customer-scoped cache from any previous session BEFORE auth flips,
      // so stale snapshots (e.g. a since-closed "active" booking) never render
      // during the login → home transition.
      await queryClient.resetQueries({ queryKey: ["customer"] });
      setCustomer(data.customer);
      return data.customer;
    },
    [queryClient, setCustomer]
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

  const sendPasswordResetMutation = useMutation({
    meta: { persist: false },
    mutationFn: async (email: string) => {
      try {
        await sendPasswordResetEmail(auth, email, {
          url: `${globalThis.location.origin}/login`,
        });
      } catch (error) {
        throw new Error(mapFirebaseError(error));
      }
    },
  });

  const resetPasswordMutation = useMutation({
    meta: { persist: false },
    mutationFn: async ({
      oobCode,
      newPassword,
    }: {
      oobCode: string;
      newPassword: string;
    }) => {
      try {
        await confirmPasswordReset(auth, oobCode, newPassword);
      } catch (error) {
        throw new Error(mapFirebaseError(error));
      }
    },
  });

  // Popup-first Google sign-in. Falls back to redirect only when the browser
  // blocks popups (or popups are unsupported), since redirect requires authDomain
  // to match the app origin to round-trip the credential. Returns the customer on
  // popup success, or null when a redirect was started (completion happens on the
  // page reload via checkGoogleRedirect) or the user dismissed the popup.
  const loginGoogle = useCallback(async (): Promise<Customer | null> => {
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      return startSession(user);
    } catch (error) {
      const code =
        typeof error === "object" && error && "code" in error
          ? String((error as { code: unknown }).code)
          : "";
      // Popup unavailable -> fall back to full-page redirect.
      if (
        code === "auth/popup-blocked" ||
        code === "auth/operation-not-supported-in-this-environment"
      ) {
        sessionStorage.setItem("google-redirect-pending", "1");
        await signInWithRedirect(auth, googleProvider);
        return null;
      }
      // User closed the popup or a newer attempt superseded it -> silent cancel.
      if (
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request"
      ) {
        return null;
      }
      throw new Error(mapFirebaseError(error));
    }
  }, [startSession]);

  // Completes a redirect-based sign-in after returning from the OAuth provider.
  // Only runs when loginGoogle previously started a redirect (guarded by the flag).
  const checkGoogleRedirect = useCallback(async (): Promise<Customer | null> => {
    if (!sessionStorage.getItem("google-redirect-pending")) return null;
    sessionStorage.removeItem("google-redirect-pending");
    try {
      const result = await getRedirectResult(auth);
      if (!result) return null;
      return startSession(result.user);
    } catch (error) {
      throw new Error(mapFirebaseError(error));
    }
  }, [startSession]);

  const logout = useCallback(async () => {
    try {
      await customerApi.post("/v1/auth/logout");
    } catch {
      // best-effort server-side revoke
    }
    clearCustomer();
    // A shared device could otherwise resurface this account's booking to
    // whoever uses the site as a guest next.
    clearGuestBookingPointer();
    // Cache is not tied to auth state — without this, bookings from the old
    // session keep feeding components (e.g. NotificationPermissionPrompt).
    queryClient.removeQueries({ queryKey: ["customer"] });
    await auth.signOut().catch(() => {});
    router.replace("/login");
  }, [clearCustomer, queryClient, router]);

  return {
    loginEmail: loginMutation.mutateAsync,
    registerEmail: registerMutation.mutateAsync,
    sendPasswordReset: sendPasswordResetMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    loginGoogle,
    checkGoogleRedirect,
    startSession,
    logout,
    isSubmitting:
      loginMutation.isPending ||
      registerMutation.isPending ||
      sendPasswordResetMutation.isPending ||
      resetPasswordMutation.isPending,
  };
}
