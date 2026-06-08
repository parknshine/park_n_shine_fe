import * as Sentry from "@sentry/nextjs";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: "production",
    tracesSampleRate: 0.2,
    replaysOnErrorSampleRate: 0,
    replaysSessionSampleRate: 0,
  });
}
