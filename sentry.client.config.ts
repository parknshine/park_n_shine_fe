import * as Sentry from "@sentry/nextjs";

const SENSITIVE_KEYS = /card|cvv|cvc|pan|pin|password|secret|token|key|auth/i;
const SENSITIVE_HEADERS = /authorization|cookie|x-[\w-]*token|x-[\w-]*key/i;

function scrubObject(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.test(k)) {
      out[k] = "[Filtered]";
    } else if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      out[k] = scrubObject(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? "development",
    sendDefaultPii: false,
    tracesSampleRate: 0.2,
    replaysOnErrorSampleRate: 0,
    replaysSessionSampleRate: 0,
    beforeSend(event) {
      if (event.request) {
        // Strip cookies and query string entirely
        event.request.cookies = undefined;
        event.request.query_string = undefined;

        // Scrub sensitive headers
        if (event.request.headers && typeof event.request.headers === "object") {
          for (const h of Object.keys(event.request.headers)) {
            if (SENSITIVE_HEADERS.test(h)) {
              (event.request.headers as Record<string, string>)[h] = "[Filtered]";
            }
          }
        }

        // Recursively scrub request body keys
        if (event.request.data && typeof event.request.data === "object") {
          event.request.data = scrubObject(event.request.data as Record<string, unknown>);
        }
      }
      return event;
    },
  });
}
