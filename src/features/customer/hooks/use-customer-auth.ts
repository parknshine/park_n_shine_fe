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
import { getCustomerRefreshToken } from "@/lib/customer-token-storage";
import { clearGuestBookingPointer } from "@/lib/guest-booking-pointer";
import type { Customer } from "@/types";

interface SessionResponse {
  customer: Customer;
  token?: string;
  refreshToken?: string;
}

function normalizeSessionResponse(
  data: SessionResponse | Customer | null | undefined,
): SessionResponse {
  if (!data || typeof data !== "object") {
    throw new Error("auth.errors.generic");
  }
  if ("customer" in data && data.customer) {
    return {
      customer: data.customer,
      token: data.token,
      refreshToken: data.refreshToken,
    };
  }
  if ("id" in data && "email" in data) {
    return { customer: data };
  }
  throw new Error("auth.errors.generic");
}

function firebaseErrorCode(error: unknown): string {
  return typeof error === "object" && error && "code" in error
    ? String((error as { code: unknown }).code)
    : "";
}

const GOOGLE_REDIRECT_FALLBACK_CODES = new Set([
  "auth/popup-blocked",
  "auth/operation-not-supported-in-this-environment",
  "auth/internal-error",
  "auth/web-storage-unsupported",
]);

interface EmailCredentials {
  email: string;
  password: string;
}

// Map raw Firebase auth error codes to i18n keys the UI can translate.
function mapFirebaseError(error: unknown): string {
  const code = firebaseErrorCode(error);
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
    case "auth/unauthorized-domain":
      return "auth.errors.unauthorizedDomain";
    case "auth/operation-not-allowed":
      return "auth.errors.googleNotEnabled";
    case "auth/internal-error":
      return "auth.errors.popupBlocked";
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
      const { data } = await customerApi.post<SessionResponse | Customer>(
        "/v1/auth/session",
        { idToken }
      );
      const session = normalizeSessionResponse(data);
      await queryClient.resetQueries({ queryKey: ["customer"] });
      setCustomer(session.customer, session.token, session.refreshToken);
      return session.customer;
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
      const code = firebaseErrorCode(error);
      // Popup unavailable, or Chrome blocking the firebaseapp.com iframe
      // (third-party cookies) — finish via redirect instead.
      if (GOOGLE_REDIRECT_FALLBACK_CODES.has(code)) {
        sessionStorage.setItem("google-redirect-pending", "1");
        await signInWithRedirect(auth, googleProvider);
        return null;
      }
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
      // The refresh token goes in the body: it is what the server revokes, and
      // the Authorization header carries the access token instead.
      const refreshToken = getCustomerRefreshToken();
      await customerApi.post(
        "/v1/auth/logout",
        refreshToken ? { refreshToken } : {}
      );
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
