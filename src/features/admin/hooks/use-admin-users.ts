"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios-admin";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "admin";
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateAdminUserPayload {
  email: string;
  name: string;
  password: string;
  role: "super_admin" | "admin";
}

interface UpdateAdminUserPayload {
  name?: string;
  email?: string;
  role?: "super_admin" | "admin";
}

const USERS_KEY = ["admin", "users"] as const;

export function useAdminUsers() {
  return useQuery<AdminUser[]>({
    queryKey: USERS_KEY,
    queryFn: async () => {
      const res = await api.get<AdminUser[]>("/v1/admin/users");
      return res.data;
    },
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateAdminUserPayload) => {
      const res = await api.post<AdminUser>("/v1/admin/users", payload);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateAdminUserPayload & { id: string }) => {
      const res = await api.patch<AdminUser>(`/v1/admin/users/${id}`, payload);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useDeactivateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/v1/admin/users/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useResetAdminPassword() {
  return useMutation({
    mutationFn: async ({ id, newPassword }: { id: string; newPassword: string }) => {
      await api.post(`/v1/admin/users/${id}/reset-password`, { newPassword });
    },
  });
}
