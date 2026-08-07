"use client";

import { useAdminReportBookings } from "./use-admin-report-bookings";

const NOTIFICATION_REQUESTS_LIMIT = 5;
const NOTIFICATION_REQUESTS_POLL_MS = 60_000;

// Only bookings that reached PAID or later are worth a WhatsApp notification —
// DRAFT/PENDING never paid, EXPIRED/CANCELLED never will.
const NOTIFIABLE_STATUSES = ["PAID", "ASSIGNED", "IN_PROGRESS", "READY", "CLOSED"];

export function useAdminNotificationRequests() {
  const { bookings, total, isLoading } = useAdminReportBookings(
    undefined,
    "",
    "",
    { hasPhone: true, statuses: NOTIFIABLE_STATUSES, notificationSent: false },
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
