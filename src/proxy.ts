import { NextRequest, NextResponse } from "next/server";

export const SUBDOMAIN_CONFIG = {
  app: {
    allowedPrefixes: ["/", "/q", "/booking", "/book"] as const,
    defaultPath: "/",
  },
  crew: {
    allowedPrefixes: ["/crew"] as const,
    defaultPath: "/crew/home",
  },
  admin: {
    allowedPrefixes: [
      "/admin",
      "/dashboard",
      "/reports",
      "/audit",
      "/settings",
      "/crew-members",
      "/email",
      "/inbox",
      "/profile",
      "/sites",
      "/testimonials",
      "/users",
    ] as const,
    defaultPath: "/admin/login",
  },
  www: {
    allowedPrefixes: ["/"] as const,
    defaultPath: "/",
  },
} as const;

type Subdomain = keyof typeof SUBDOMAIN_CONFIG;

/**
 * Extract the subdomain from a host header value.
 * Returns null for localhost, bare domains, or unrecognised subdomains.
 */
export function detectSubdomain(host: string): Subdomain | null {
  // Strip port if present (e.g. "app.park-shine.sg:443" -> "app.park-shine.sg")
  const hostname = host.split(":")[0];
  const parts = hostname.split(".");

  // Root domain (e.g. "park-shine.sg") — treat as landing page, pass through
  if (parts.length < 3) return null;

  const sub = parts[0];
  if (sub in SUBDOMAIN_CONFIG) return sub as Subdomain;

  return null;
}

/**
 * Check whether a pathname is covered by any of the allowed prefixes.
 * The prefix "/" is treated as an exact match only to avoid matching everything.
 */
export function isPathAllowed(
  path: string,
  allowedPrefixes: readonly string[]
): boolean {
  return allowedPrefixes.some((prefix) => {
    if (prefix === "/") return path === "/";
    const bare = prefix.replace(/\/$/, "");
    return path === bare || path.startsWith(bare + "/");
  });
}

/**
 * Verify an HS256 JWT token using Web Crypto (Node.js Runtime compatible).
 * Validates signature and expiration. Returns false if token is invalid or expired.
 */
async function verifyHs256(token: string, secret: string): Promise<boolean> {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split(".");
    if (!headerB64 || !payloadB64 || !signatureB64) return false;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const sig = Uint8Array.from(
      atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0)
    );

    const valid = await crypto.subtle.verify("HMAC", key, sig, data);
    if (!valid) return false;

    const payload = JSON.parse(
      atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"))
    ) as { exp?: number };
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return false;

    return true;
  } catch {
    return false;
  }
}

const ADMIN_PROTECTED = /^\/admin(?:\/.*)?$/;
const CREW_PROTECTED = /^\/crew(?:\/.*)?$/;
const PUBLIC_PATHS = new Set(["/admin/login", "/admin", "/crew/login", "/crew"]);

/**
 * Cookie-based JWT verification for admin and crew routes.
 * Only active when NEXT_PUBLIC_COOKIE_AUTH=true (Phase 6 feature flag).
 */
async function verifyCookieAuth(req: NextRequest): Promise<NextResponse | null> {
  // Feature flag — only active when NEXT_PUBLIC_COOKIE_AUTH=true
  if (process.env.NEXT_PUBLIC_COOKIE_AUTH !== "true") return null;

  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.has(pathname)) return null;

  if (ADMIN_PROTECTED.test(pathname)) {
    const token = req.cookies.get("admin-token")?.value;
    const secret = process.env.ADMIN_JWT_SECRET;
    if (!secret || !token || !(await verifyHs256(token, secret))) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  if (CREW_PROTECTED.test(pathname)) {
    const token = req.cookies.get("crew-token")?.value;
    const secret = process.env.CREW_JWT_SECRET;
    if (!secret || !token || !(await verifyHs256(token, secret))) {
      return NextResponse.redirect(new URL("/crew/login", req.url));
    }
  }

  return null;
}

export async function proxy(req: NextRequest): Promise<NextResponse> {
  // Check cookie-based JWT auth first (Phase 6 feature flag)
  const cookieAuthResponse = await verifyCookieAuth(req);
  if (cookieAuthResponse) return cookieAuthResponse;

  const host = req.headers.get("host") ?? "";
  const { pathname } = req.nextUrl;

  const subdomain = detectSubdomain(host);

  // Dev mode or unknown subdomain — pass through without enforcement
  if (!subdomain) return NextResponse.next();

  const surface = SUBDOMAIN_CONFIG[subdomain];

  if (isPathAllowed(pathname, surface.allowedPrefixes)) {
    return NextResponse.next();
  }

  // Redirect to this subdomain's default path (stay on current subdomain)
  const url = req.nextUrl.clone();
  url.pathname = surface.defaultPath;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|icons|manifest.webmanifest|sw.js|favicon.ico|api/|v1/).*)",
  ],
};
