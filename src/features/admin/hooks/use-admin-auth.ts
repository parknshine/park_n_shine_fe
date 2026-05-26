"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/axios-admin";
import { mutationKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";

interface AdminLoginPayload {
  email: string;
  password: string;
}

interface AdminLoginResponse {
  token: string;
  refreshToken: string;
  email: string;
  sites: Array<{ id: string; name: string }>;
}

export function useAdminAuth() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setSites = useUIStore((s) => s.setSites);
  const setActiveSiteId = useUIStore((s) => s.setActiveSiteId);

  const loginMutation = useMutation({
    meta: { persist: false },
    mutationKey: mutationKeys.admin.login(),
    mutationFn: async (payload: AdminLoginPayload) => {
      const response = await api.post<AdminLoginResponse>(
        "/v1/admin/sessions",
        payload
      );
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("admin-token", data.token);
      localStorage.setItem("admin-refresh-token", data.refreshToken);
      localStorage.setItem("admin-sites", JSON.stringify(data.sites));
      setUser(
        { id: data.email, email: data.email, name: "Admin" },
        data.token
      );
      setSites(data.sites);
      if (data.sites.length > 0) {
        setActiveSiteId(data.sites[0].id);
      }
      router.replace("/dashboard");
    },
  });

  function logout() {
    localStorage.removeItem("admin-token");
    localStorage.removeItem("admin-refresh-token");
    localStorage.removeItem("admin-sites");
    clearAuth();
    router.replace("/admin/login");
  }

  const error =
    loginMutation.error instanceof Error
      ? loginMutation.error.message
      : loginMutation.error
        ? "admin_login_failed"
        : null;

  return {
    login: loginMutation.mutateAsync,
    logout,
    isSubmitting: loginMutation.isPending,
    error,
  };
}
