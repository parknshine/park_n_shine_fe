import * as Sentry from "@sentry/nextjs";

const SENSITIVE_KEYS = /card|cvv|cvc|pan|pin|password|secret|token|key|auth/i;

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? "development",
    tracesSampleRate: 0.2,
    replaysOnErrorSampleRate: 0,
    replaysSessionSampleRate: 0,
    beforeSend(event) {
      if (event.request?.data && typeof event.request.data === "object") {
        const sanitized: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(event.request.data as Record<string, unknown>)) {
          sanitized[k] = SENSITIVE_KEYS.test(k) ? "[Filtered]" : v;
        }
        event.request.data = sanitized;
      }
      return event;
    },
  });
}
