"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import customerApi from "@/lib/axios-customer";
import { queryKeys } from "@/lib/query-keys";

export interface CustomerBookingSummary {
  id: string;
  reference: string | null;
  plate: string | null;
  status: string;
  price: number;
  rating: number | null;
  createdAt: string;
  paidAt: string | null;
  completedAt: string | null;
  closedAt: string | null;
  bookingToken: string;
  paymentMethod: string | null;
  refundedAmount: number;
  site: { name: string; address: string | null } | null;
}

interface BookingsPage {
  items: CustomerBookingSummary[];
  nextCursor: string | null;
}

export function useCustomerBookings(enabled = true, skipAuthRedirect = false) {
  return useInfiniteQuery({
    queryKey: queryKeys.customer.bookings(),
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const url = pageParam
        ? `/v1/me/bookings?cursor=${pageParam}`
        : "/v1/me/bookings";
      const { data } = await customerApi.get<BookingsPage>(url, { skipAuthRedirect });
      return data;
    },
    getNextPageParam: (lastPage: BookingsPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled,
    refetchOnMount: "always",
    staleTime: 0,
  });
}
