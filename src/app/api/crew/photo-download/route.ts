import { type NextRequest, NextResponse } from "next/server";
import { resolve } from "node:path";

// Allowlist of storage hostnames this proxy may fetch from.
// Prevents SSRF — the client supplies the URL so we must restrict its reach.
const ALLOWED_HOSTS = new Set([
  "storage.googleapis.com",
  "res.cloudinary.com",
  "storage.cloud.google.com",
]);

function isAllowedUrl(raw: string): boolean {
  try {
    const { protocol, hostname } = new URL(raw);
    if (protocol !== "https:") return false;
    // Allow exact match or subdomain of an allowlisted host
    return [...ALLOWED_HOSTS].some(
      (h) => hostname === h || hostname.endsWith(`.${h}`),
    );
  } catch {
    return false;
  }
}

// Sanitize to ASCII filename-safe characters; strip path separators.
function safeFilename(raw: string): string {
  return raw.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 100) || "photo.jpg";
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const url = searchParams.get("url") ?? "";
  const filename = safeFilename(searchParams.get("filename") ?? "photo.jpg");

  // --- dev-only local filesystem fallback ---
  // Path traversal risk: only enabled outside production, and reads are
  // restricted to the configured upload directory.
  if (process.env.NODE_ENV !== "production" && !url.startsWith("http")) {
    try {
      const { existsSync } = await import("node:fs");
      const { readFile } = await import("node:fs/promises");
      // NOSONAR: /tmp is only used in dev when UPLOAD_DIR is unset; path traversal is prevented below
      const uploadDir = resolve(process.env.UPLOAD_DIR ?? "/tmp/park-n-shine-uploads"); // NOSONAR
      const target = resolve(url);
      if (!target.startsWith(uploadDir)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (!existsSync(target)) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const buffer = await readFile(target);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "image/jpeg",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store",
        },
      });
    } catch {
      return NextResponse.json({ error: "Failed to read file" }, { status: 502 });
    }
  }

  // --- production: HTTPS fetch from allowlisted storage hosts only ---
  if (!isAllowedUrl(url)) {
    return NextResponse.json({ error: "URL not allowed" }, { status: 400 });
  }

  try {
    const res = await fetch(url, { redirect: "manual" });
    // Reject redirects to prevent redirect-based SSRF
    if (res.status >= 300 && res.status < 400) {
      return NextResponse.json({ error: "Redirects not allowed" }, { status: 400 });
    }
    if (!res.ok) throw new Error(`Upstream returned ${res.status}`);

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 502 });
  }
}
