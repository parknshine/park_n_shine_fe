import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const isDev = process.env.NODE_ENV !== "production";

// Firebase boots a hidden iframe on <authDomain>/__/auth/iframe to run the
// popup/redirect resolver, so the CSP has to follow whichever project is configured.
const firebaseAuthOrigin = `https://${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "parknshine-4beb1.firebaseapp.com"}`;

// When the backend has no TLS, an HTTPS deployment cannot call it directly —
// the browser blocks it as mixed content. Setting API_PROXY_TARGET (server-only)
// plus NEXT_PUBLIC_API_URL=/api routes those calls through this app instead.
const apiProxyTarget = process.env.API_PROXY_TARGET?.replace(/\/+$/, "");

// Only absolute origins are valid CSP sources; a relative base ("/api") is 'self'.
const publicApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
const apiConnectSrc = /^https?:\/\//.test(publicApiUrl) ? ` ${publicApiUrl}` : "";

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
  async rewrites() {
    if (!apiProxyTarget) return [];
    return [
      { source: "/api/v1/:path*", destination: `${apiProxyTarget}/v1/:path*` },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          // Firebase Google popup talks to this window via window.opener.
          // `same-origin` breaks that and surfaces as a silent popup close.
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://apis.google.com https://www.gstatic.com https://www.google.com https://app.midtrans.com https://app.sandbox.midtrans.com`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://res.cloudinary.com https://midtrans-website.al-mp-id-p.cdn.gtflabs.io https://storage.googleapis.com https://lh3.googleusercontent.com https://cdnjs.cloudflare.com https://*.tile.openstreetmap.org https://api.sandbox.midtrans.com https://api.midtrans.com blob:",
              `connect-src 'self'${isDev ? " ws: http://localhost:* http://127.0.0.1:* http://192.168.1.105:* ws://192.168.1.105:*" : ""} https://park-n-shine-fe.vercel.app https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebaseinstallations.googleapis.com https://www.googleapis.com https://apis.google.com https://accounts.google.com https://api.sandbox.midtrans.com https://api.midtrans.com https://nominatim.openstreetmap.org https://*.ingest.us.sentry.io ${firebaseAuthOrigin}${apiConnectSrc}`,
              `frame-src https://app.sandbox.midtrans.com https://app.midtrans.com https://accounts.google.com https://apis.google.com https://www.google.com https://*.firebaseapp.com https://*.google.com https://parknshine-4beb1.firebaseapp.com https://parknshine-9c1c1.firebaseapp.com https://auth.parknshine.net https://park-n-shine-fe.vercel.app ${firebaseAuthOrigin}`,
              "object-src 'none'",
              "base-uri 'self'",
              "frame-ancestors 'none'",
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
