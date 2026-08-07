"use client";

import { useAdminReportBookings } from "./use-admin-report-bookings";

const NOTIFICATION_REQUESTS_LIMIT = 5;
const NOTIFICATION_REQUESTS_POLL_MS = 60_000;

export function useAdminNotificationRequests() {
  const { bookings, total, isLoading } = useAdminReportBookings(
    undefined,
    "",
    "",
    { hasPhone: true, notificationSent: false },
    1,
    NOTIFICATION_REQUESTS_LIMIT,
    NOTIFICATION_REQUESTS_POLL_MS,
  );

  return {
    requests: bookings,
    total,
    isLoading,
  };
}
