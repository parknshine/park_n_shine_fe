"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { queryKeys } from "@/lib/query-keys";
import type { BookingStatus, CustomerBooking } from "@/features/customer/types";

// Statuses that are meaningful to the customer.
// Internal / crew-operational statuses are hidden from the timeline.
const CUSTOMER_VISIBLE_STATUSES = new Set<BookingStatus>([
  "PAID",
  "IN_PROGRESS",
  "READY",
  "CLOSED",
  "EXPIRED",
  "CANCELLED",
]);

interface UseBookingStatusOptions {
  bookingId: string;
  signedToken: string;
  pollIntervalMs?: number;
  enabled?: boolean;
}

export function useBookingStatus({
  bookingId,
  signedToken,
  pollIntervalMs = 5_000,
  enabled = true,
}: UseBookingStatusOptions) {
  const query = useQuery({
    enabled,
    meta: { persist: false },
    queryFn: async () => {
      const response = await api.get<{
        bookingId: string;
        status: CustomerBooking["status"];
        plate?: string | null;
        slot?: string | null;
        price?: number;
        siteName: string;
        timeline?: { status: CustomerBooking["status"]; timestamp: string }[];
      }>(`/v1/bookings/${bookingId}`, {
        headers: { "X-Booking-Token": signedToken },
      });
      const d = response.data;
      const booking: CustomerBooking = {
        id: d.bookingId ?? bookingId,
        signedToken,
        status: d.status,
        siteName: d.siteName,
        plateText: d.plate ?? null,
        slotText: d.slot ?? null,
        priceAmount: d.price,
        media: [],
        statusHistory: (d.timeline ?? [])
          .filter((t) => CUSTOMER_VISIBLE_STATUSES.has(t.status))
          .map((t) => ({
            status: t.status,
            changedAt: t.timestamp,
            labelKey: `booking.status.${t.status.toLowerCase()}`,
          })),
      };
      return booking;
    },
    queryKey: queryKeys.customer.booking(bookingId),
    refetchInterval: pollIntervalMs,
  });

  async function refresh() {
    const result = await query.refetch();
    return result.data ?? null;
  }

  const error =
    query.error instanceof Error
      ? query.error.message
      : query.error
        ? "booking_status_failed"
        : null;

  return {
    booking: query.data ?? null,
    error,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isOfflinePaused: query.fetchStatus === "paused",
    refresh,
  };
}
