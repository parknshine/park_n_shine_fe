export const queryKeys = {
  admin: {
    queue: (siteId: string) => ["admin", "queue", siteId] as const,
    allSitesQueue: () => ["admin", "queue", "all"] as const,
    escalations: () => ["admin", "escalations"] as const,
    booking: (bookingId: string) => ["admin", "booking", bookingId] as const,
    report: (siteId: string, from: string, to: string) =>
      ["admin", "report", siteId, from, to] as const,
    reportBookings: (siteId: string, from: string, to: string, filters?: object, page?: number, pageSize?: number) =>
      ["admin", "report-bookings", siteId, from, to, filters ?? {}, page ?? 1, pageSize ?? 25] as const,
    auditLog: (siteId: string) => ["admin", "audit-log", siteId] as const,
    settings: () => ["admin", "settings"] as const,
    sites: () => ["admin", "sites"] as const,
    site: (siteId: string) => ["admin", "sites", siteId] as const,
    qrCodes: (siteId: string) => ["admin", "sites", siteId, "qr-codes"] as const,
    crew: () => ["admin", "crew"] as const,
    shifts: (siteId: string) => ["admin", "sites", siteId, "shifts"] as const,
    testimonials: () => ["admin", "testimonials"] as const,
    tipCrewSummary: (period: string) => ["admin", "tips", "crew-summary", period] as const,
    disbursements: () => ["admin", "disbursements"] as const,
  },
  crew: {
    session: () => ["crew", "session"] as const,
    job: (jobId: string) => ["crew", "job", jobId] as const,
    nextJob: () => ["crew", "jobs", "next"] as const,
    queue: () => ["crew", "jobs", "queue"] as const,
    waitStatus: () => ["crew", "jobs", "wait-status"] as const,
    monthlyStats: () => ["crew", "monthly-stats"] as const,
  },
  customer: {
    booking: (bookingId: string) => ["customer", "booking", bookingId] as const,
    sites: () => ["customer", "sites"] as const,
    settings: () => ["customer", "settings"] as const,
  },
  testimonials: {
    public: () => ["testimonials"] as const,
  },
} as const;

export const mutationKeys = {
  admin: {
    login: () => ["admin", "sessions"] as const,
    overrideStatus: (bookingId: string) =>
      ["admin", "booking", bookingId, "status-override"] as const,
    reassign: (bookingId: string) =>
      ["admin", "booking", bookingId, "reassign"] as const,
    refund: (bookingId: string) =>
      ["admin", "booking", bookingId, "refund"] as const,
    saveSettings: () => ["admin", "settings", "save"] as const,
    createSite: () => ["admin", "sites", "create"] as const,
    updateSite: (siteId: string) => ["admin", "sites", siteId, "update"] as const,
    generateQr: (siteId: string) => ["admin", "sites", siteId, "qr", "generate"] as const,
    rotateQr: (qrId: string) => ["admin", "qr", qrId, "rotate"] as const,
    createCrew: () => ["admin", "crew", "create"] as const,
    updateCrew: (crewId: string) => ["admin", "crew", crewId, "update"] as const,
    deleteCrew: () => ["admin", "crew", "delete"] as const,
    createShift: (siteId: string) => ["admin", "sites", siteId, "shifts", "create"] as const,
    updateShiftCrew: (shiftId: string) => ["admin", "shifts", shiftId, "crew"] as const,
    closeShift: (shiftId: string) => ["admin", "shifts", shiftId, "close"] as const,
    createTestimonial: () => ["admin", "testimonials", "create"] as const,
    updateTestimonial: (id: string) => ["admin", "testimonials", id, "update"] as const,
    deleteTestimonial: (id: string) => ["admin", "testimonials", id, "delete"] as const,
    createDisbursement: () => ["admin", "disbursements", "create"] as const,
  },
  crew: {
    checklist: (jobId: string) => ["crew", "job", jobId, "checklist"] as const,
    completeJob: (jobId: string) => ["crew", "job", jobId, "complete"] as const,
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
    resumePayment: (bookingId: string) =>
      ["customer", "booking", bookingId, "resume-payment"] as const,
    tip: (bookingId: string) => ["customer", "tip", bookingId] as const,
  },
} as const;
