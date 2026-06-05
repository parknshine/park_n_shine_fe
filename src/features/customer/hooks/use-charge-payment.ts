"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { isAxiosError } from "axios";
import { queryKeys } from "@/lib/query-keys";
import type { PaymentInstructions } from "@/features/customer/types";

export function useChargePayment(bookingId: string, signedToken: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (paymentMethod: string) => {
      const response = await api.post<PaymentInstructions>(
        `/v1/bookings/${bookingId}/charge`,
        { paymentMethod },
        { headers: { "X-Booking-Token": signedToken } },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.customer.booking(bookingId),
      });
    },
  });

  console.log("mutation", mutation);

  return {
    charge: mutation.mutate,
    isCharging: mutation.isPending,
    error: isAxiosError(mutation.error)
      ? (mutation.error.response?.data?.error ?? mutation.error.message)
      : mutation.error instanceof Error
        ? mutation.error.message
        : null,
  };
}
