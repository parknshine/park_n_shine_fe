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
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "admin";
  sites: Array<{ id: string; name: string }>;
}

export function useAdminAuth() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setSites = useUIStore((s) => s.setSites);

  const loginMutation = useMutation({
    meta: { persist: false },
    mutationKey: mutationKeys.admin.login(),
    mutationFn: async (payload: AdminLoginPayload) => {
      const response = await api.post<AdminLoginResponse>("/v1/admin/sessions", payload);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("admin-sites", JSON.stringify(data.sites));
      setUser(
        { id: data.id, email: data.email, name: data.name, role: data.role },
        data.token,
        data.role,
      );
      setSites(data.sites);
      router.replace("/dashboard");
    },
  });

  function logout() {
    localStorage.removeItem("admin-sites");
    clearAuth();
    // Clear httpOnly cookies server-side then redirect
    api.delete("/v1/admin/sessions/current").catch(() => {}).finally(() => {
      router.replace("/admin/login");
    });
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
