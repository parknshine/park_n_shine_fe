"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { queryKeys } from "@/lib/query-keys";
import type {
  BookingStatus,
  BookingStatusEvent,
  CustomerBooking,
  PaymentInstructions,
} from "@/features/customer/types";

// Statuses that are meaningful to the customer — matches every step the
// booking status timeline renders (see booking-status-timeline.tsx STEPS),
// so each step can show the crew's real transition timestamp instead of
// falling back to an earlier step's time.
const CUSTOMER_VISIBLE_STATUSES = new Set<BookingStatus>([
  "PAID",
  "ASSIGNED",
  "LOCATED",
  "IN_PROGRESS",
  "READY",
  "CLOSED",
  "EXPIRED",
  "CANCELLED",
]);

export function toCustomerStatusHistory(
  timeline: { status: BookingStatus; timestamp: string; reason?: string | null }[],
): BookingStatusEvent[] {
  return timeline
    .filter((t) => CUSTOMER_VISIBLE_STATUSES.has(t.status))
    .map((t) => ({
      status: t.status,
      changedAt: t.timestamp,
      labelKey: `booking.status.${t.status.toLowerCase()}`,
      reason: t.reason ?? null,
    }));
}

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
    queryFn: async () => {
      const response = await api.get<{
        bookingId: string;
        status: CustomerBooking["status"];
        plate?: string | null;
        slot?: string | null;
        phone?: string | null;
        price?: number;
        siteName: string;
        siteAddress?: string | null;
        paymentMethod?: string | null;
        paymentInstructions?: PaymentInstructions | null;
        startedAt?: string | null;
        completedSteps?: number;
        hasRated?: boolean;
        refundedAmount?: number;
        media?: { id: string; kind: string; url: string; ocrText?: string | null }[];
        timeline?: { status: CustomerBooking["status"]; timestamp: string; reason?: string | null }[];
      }>(`/v1/bookings/${bookingId}`, {
        headers: { "X-Booking-Token": signedToken },
      });
      const d = response.data;
      const booking: CustomerBooking = {
        id: d.bookingId ?? bookingId,
        signedToken,
        status: d.status,
        siteName: d.siteName,
        siteAddress: d.siteAddress ?? null,
        plateText: d.plate ?? null,
        slotText: d.slot ?? null,
        phone: d.phone ?? null,
        priceAmount: d.price,
        paymentMethod: d.paymentMethod ?? null,
        paymentInstructions: d.paymentInstructions ?? null,
        media: (d.media ?? []).map((m) => ({
          id: m.id,
          kind: m.kind as import("@/types/media").MediaKind,
          url: m.url,
          ocrText: m.ocrText ?? null,
        })),
        startedAt: d.startedAt ?? null,
        completedSteps: d.completedSteps ?? 0,
        hasRated: d.hasRated ?? false,
        refundedAmount: d.refundedAmount ?? 0,
        statusHistory: toCustomerStatusHistory(d.timeline ?? []),
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
