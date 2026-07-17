"use client";

import { useAdminReportBookings } from "./use-admin-report-bookings";

const REFUNDS_NEEDED_LIMIT = 5;
const REFUNDS_NEEDED_POLL_MS = 60_000;

export function useAdminRefundsNeeded() {
  const { bookings, total, isLoading } = useAdminReportBookings(
    undefined,
    "",
    "",
    { needsRefund: true },
    1,
    REFUNDS_NEEDED_LIMIT,
    REFUNDS_NEEDED_POLL_MS,
  );

  return {
    refunds: bookings,
    total,
    isLoading,
  };
}
