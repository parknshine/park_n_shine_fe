"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios-admin";
import { mutationKeys, queryKeys } from "@/lib/query-keys";
import type {
  ReassignBookingPayload,
  RefundPayload,
  StatusOverridePayload,
} from "@/features/admin/types";
import type { CustomerBooking } from "@/features/customer/types";

export function useBookingActions(bookingId: string) {
  const queryClient = useQueryClient();

  const refundMutation = useMutation({
    meta: { persist: false },
    mutationFn: async (payload: RefundPayload) => {
      const response = await api.post<CustomerBooking>(
        `/v1/admin/bookings/${bookingId}/refund`,
        payload
      );
      return response.data;
    },
    mutationKey: mutationKeys.admin.refund(bookingId),
    onSuccess: () => {
      void queryClient.refetchQueries({ queryKey: queryKeys.admin.booking(bookingId) });
      void queryClient.refetchQueries({ queryKey: ["admin", "audit-log"] });
      void queryClient.refetchQueries({ queryKey: ["admin", "report"] });
      void queryClient.refetchQueries({ queryKey: ["admin", "report-bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["customer", "booking", bookingId] });
    },
  });

  const overrideStatusMutation = useMutation({
    meta: { persist: false },
    mutationFn: async (payload: StatusOverridePayload) => {
      const response = await api.post<CustomerBooking>(
        `/v1/admin/bookings/${bookingId}/status-override`,
        payload
      );
      return response.data;
    },
    mutationKey: mutationKeys.admin.overrideStatus(bookingId),
    onSuccess: () => {
      void queryClient.refetchQueries({ queryKey: queryKeys.admin.booking(bookingId) });
      void queryClient.refetchQueries({ queryKey: ["admin", "audit-log"] });
      void queryClient.refetchQueries({ queryKey: ["admin", "report"] });
      void queryClient.refetchQueries({ queryKey: ["admin", "report-bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["customer", "booking", bookingId] });
    },
  });

  const reassignMutation = useMutation({
    meta: { persist: false },
    mutationFn: async (payload: ReassignBookingPayload) => {
      const response = await api.post<CustomerBooking>(
        `/v1/admin/bookings/${bookingId}/reassign`,
        payload
      );
      return response.data;
    },
    mutationKey: mutationKeys.admin.reassign(bookingId),
    onSuccess: () => {
      void queryClient.refetchQueries({ queryKey: queryKeys.admin.booking(bookingId) });
      void queryClient.refetchQueries({ queryKey: ["admin", "audit-log"] });
      void queryClient.refetchQueries({ queryKey: ["admin", "report"] });
      void queryClient.refetchQueries({ queryKey: ["admin", "report-bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["customer", "booking", bookingId] });
    },
  });

  const setNotificationSentMutation = useMutation({
    meta: { persist: false },
    mutationFn: async (sent: boolean) => {
      const response = await api.post<{ bookingId: string; notificationSentAt: string | null }>(
        `/v1/admin/bookings/${bookingId}/notification-sent`,
        { sent }
      );
      return response.data;
    },
    mutationKey: mutationKeys.admin.setNotificationSent(bookingId),
    onSuccess: () => {
      void queryClient.refetchQueries({ queryKey: queryKeys.admin.booking(bookingId) });
      void queryClient.refetchQueries({ queryKey: ["admin", "audit-log"] });
      void queryClient.refetchQueries({ queryKey: ["admin", "report-bookings"] });
    },
  });

  const error =
    refundMutation.error instanceof Error
      ? refundMutation.error.message
      : overrideStatusMutation.error instanceof Error
        ? overrideStatusMutation.error.message
        : reassignMutation.error instanceof Error
          ? reassignMutation.error.message
          : setNotificationSentMutation.error instanceof Error
            ? setNotificationSentMutation.error.message
            : refundMutation.error ||
                overrideStatusMutation.error ||
                reassignMutation.error ||
                setNotificationSentMutation.error
              ? "booking_action_failed"
              : null;

  return {
    error,
    isOfflinePaused:
      refundMutation.isPaused ||
      overrideStatusMutation.isPaused ||
      reassignMutation.isPaused ||
      setNotificationSentMutation.isPaused,
    isSubmitting:
      refundMutation.isPending ||
      overrideStatusMutation.isPending ||
      reassignMutation.isPending ||
      setNotificationSentMutation.isPending,
    overrideStatus: overrideStatusMutation.mutateAsync,
    reassign: reassignMutation.mutateAsync,
    refund: refundMutation.mutateAsync,
    setNotificationSent: setNotificationSentMutation.mutateAsync,
    isSettingNotificationSent: setNotificationSentMutation.isPending,
  };
}
