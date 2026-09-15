import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const isDev = process.env.NODE_ENV !== "production";

// Firebase boots a hidden iframe on <authDomain>/__/auth/iframe to run the
// popup/redirect resolver, so the CSP has to follow whichever project is configured.
const firebaseAuthOrigin = `https://${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "parknshine-4beb1.firebaseapp.com"}`;

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  allowedDevOrigins: ["192.168.1.105"],
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://apis.google.com https://app.midtrans.com https://app.sandbox.midtrans.com`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://res.cloudinary.com https://midtrans-website.al-mp-id-p.cdn.gtflabs.io https://storage.googleapis.com https://lh3.googleusercontent.com https://cdnjs.cloudflare.com https://*.tile.openstreetmap.org https://api.sandbox.midtrans.com https://api.midtrans.com blob:",
              `connect-src 'self'${isDev ? " ws: http://localhost:* http://127.0.0.1:* http://192.168.1.105:* ws://192.168.1.105:*" : ""} https://park-n-shine-fe.vercel.app https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebaseinstallations.googleapis.com https://api.sandbox.midtrans.com https://api.midtrans.com https://nominatim.openstreetmap.org https://*.ingest.us.sentry.io ${firebaseAuthOrigin} ` + (process.env.NEXT_PUBLIC_API_URL ?? ""),
              `frame-src https://app.sandbox.midtrans.com https://app.midtrans.com https://accounts.google.com https://parknshine-4beb1.firebaseapp.com https://auth.parknshine.net https://park-n-shine-fe.vercel.app ${firebaseAuthOrigin}`,
              "object-src 'none'",
              "base-uri 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
  sourcemaps: {
    disable: true,
  },
});
