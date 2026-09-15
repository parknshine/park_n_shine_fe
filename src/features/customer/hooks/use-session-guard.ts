"use client";

import { useCallback, useState } from "react";
import customerApi from "@/lib/axios-customer";
import { useCustomerAuthStore } from "@/store/customer-auth-store";

// Guards booking creation for users who *appear* logged in (local store says
// isAuthenticated) but whose stored session token may have actually expired.
// Guests (isAuthenticated === false) are always allowed through unchanged.
export function useSessionGuard() {
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  const [sessionInvalid, setSessionInvalid] = useState(false);

  const ensureValidSession = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) return true;
    try {
      await customerApi.get("/v1/me/home", { skipAuthRedirect: true });
      return true;
    } catch {
      setSessionInvalid(true);
      return false;
    }
  }, [isAuthenticated]);

  return { sessionInvalid, ensureValidSession };
}
