import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { mutationKeys } from "@/lib/query-keys";
import type { TipPaymentMethod, TipPaymentResponse } from "@/features/customer/types/tip";

interface UseTipPaymentOptions {
  bookingId: string;
  token: string;
}

export function useTipPayment({ bookingId, token }: UseTipPaymentOptions) {
  return useMutation({
    mutationKey: mutationKeys.customer.tip(bookingId),
    mutationFn: async (payload: { amount: number; paymentMethod: TipPaymentMethod }) => {
      const response = await api.post<TipPaymentResponse>(
        `/v1/bookings/${bookingId}/tip`,
        payload,
        { headers: { "X-Booking-Token": token } },
      );
      return response.data;
    },
  });
}
