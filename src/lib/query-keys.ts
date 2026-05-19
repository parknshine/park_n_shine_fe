export const queryKeys = {
  admin: {
    queue: (siteId: string) => ["admin", "queue", siteId] as const,
  },
  crew: {
    session: () => ["crew", "session"] as const,
    job: (jobId: string) => ["crew", "job", jobId] as const,
    nextJob: () => ["crew", "jobs", "next"] as const,
  },
  customer: {
    booking: (bookingId: string) => ["customer", "booking", bookingId] as const,
  },
} as const;

export const mutationKeys = {
  admin: {
    overrideStatus: (bookingId: string) =>
      ["admin", "booking", bookingId, "status-override"] as const,
    reassign: (bookingId: string) =>
      ["admin", "booking", bookingId, "reassign"] as const,
    refund: (bookingId: string) =>
      ["admin", "booking", bookingId, "refund"] as const,
  },
  crew: {
    checklist: (jobId: string) => ["crew", "job", jobId, "checklist"] as const,
    login: () => ["crew", "sessions"] as const,
    media: (jobId: string) => ["crew", "job", jobId, "media"] as const,
    nextJob: () => ["crew", "jobs", "next"] as const,
    verifyPlate: (jobId: string) => ["crew", "job", jobId, "verify"] as const,
  },
  customer: {
    confirmPayment: (bookingId: string) =>
      ["customer", "booking", bookingId, "confirm"] as const,
    createBooking: () => ["customer", "booking", "create"] as const,
    media: (bookingId: string) =>
      ["customer", "booking", bookingId, "media"] as const,
    rate: (bookingId: string) =>
      ["customer", "booking", bookingId, "rate"] as const,
  },
} as const;
