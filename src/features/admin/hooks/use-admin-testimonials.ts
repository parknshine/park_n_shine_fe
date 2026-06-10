"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios-admin";
import { queryKeys, mutationKeys } from "@/lib/query-keys";
import type {
  AdminTestimonial,
  CreateTestimonialPayload,
  UpdateTestimonialPayload,
} from "@/features/admin/types";

export function useAdminTestimonials() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.admin.testimonials(),
    queryFn: async () => {
      const res = await api.get<{ testimonials: AdminTestimonial[] }>("/v1/admin/testimonials");
      return res.data.testimonials;
    },
  });

  const createMutation = useMutation({
    mutationKey: mutationKeys.admin.createTestimonial(),
    mutationFn: async (payload: CreateTestimonialPayload) => {
      const res = await api.post<{ testimonial: AdminTestimonial }>(
        "/v1/admin/testimonials",
        payload,
      );
      return res.data.testimonial;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.testimonials() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateTestimonialPayload }) => {
      const res = await api.patch<{ testimonial: AdminTestimonial }>(
        `/v1/admin/testimonials/${id}`,
        payload,
      );
      return res.data.testimonial;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.testimonials() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/v1/admin/testimonials/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.testimonials() });
    },
  });

  return {
    testimonials: query.data ?? [],
    isLoading: query.isLoading,
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    update: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    remove: deleteMutation.mutateAsync,
    isRemoving: deleteMutation.isPending,
  };
}
