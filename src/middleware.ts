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

export function middleware(req: NextRequest): NextResponse {
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
