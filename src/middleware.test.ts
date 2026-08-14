import { afterEach, describe, expect, test } from "bun:test";
import { NextRequest } from "next/server";
import {
  SUBDOMAIN_CONFIG,
  detectSubdomain,
  isPathAllowed,
  middleware,
} from "./middleware";

describe("detectSubdomain", () => {
  test("detects app subdomain", () => {
    expect(detectSubdomain("app.park-shine.sg")).toBe("app");
  });

  test("detects crew subdomain", () => {
    expect(detectSubdomain("crew.park-shine.sg")).toBe("crew");
  });

  test("detects admin subdomain", () => {
    expect(detectSubdomain("admin.park-shine.sg")).toBe("admin");
  });

  test("returns null for bare localhost", () => {
    expect(detectSubdomain("localhost")).toBeNull();
  });

  test("returns null for localhost with port", () => {
    expect(detectSubdomain("localhost:3000")).toBeNull();
  });

  test("returns null for unknown subdomain", () => {
    expect(detectSubdomain("foo.park-shine.sg")).toBeNull();
  });

  test("detects app subdomain with port", () => {
    expect(detectSubdomain("app.park-shine.sg:3000")).toBe("app");
  });

  test("returns null for apex domain without subdomain", () => {
    expect(detectSubdomain("park-shine.sg")).toBeNull();
  });
});

describe("isPathAllowed", () => {
  const appPrefixes = SUBDOMAIN_CONFIG.app.allowedPrefixes;
  const crewPrefixes = SUBDOMAIN_CONFIG.crew.allowedPrefixes;
  const adminPrefixes = SUBDOMAIN_CONFIG.admin.allowedPrefixes;

  test("allows root / for app", () => {
    expect(isPathAllowed("/", appPrefixes)).toBe(true);
  });

  test("allows /q/* for app", () => {
    expect(isPathAllowed("/q/abc123", appPrefixes)).toBe(true);
  });

  test("allows /booking/* for app", () => {
    expect(isPathAllowed("/booking/123/status", appPrefixes)).toBe(true);
  });

  test("blocks /crew/ on app subdomain", () => {
    expect(isPathAllowed("/crew/home", appPrefixes)).toBe(false);
  });

  test("blocks /admin on app subdomain", () => {
    expect(isPathAllowed("/admin", appPrefixes)).toBe(false);
  });

  test("allows /crew/* for crew subdomain", () => {
    expect(isPathAllowed("/crew/home", crewPrefixes)).toBe(true);
  });

  test("allows /crew/jobs/123/verify for crew subdomain", () => {
    expect(isPathAllowed("/crew/jobs/123/verify", crewPrefixes)).toBe(true);
  });

  test("blocks /q/* on crew subdomain", () => {
    expect(isPathAllowed("/q/abc", crewPrefixes)).toBe(false);
  });

  test("allows /admin exact path for admin subdomain", () => {
    expect(isPathAllowed("/admin", adminPrefixes)).toBe(true);
  });

  test("allows /admin/* for admin subdomain", () => {
    expect(isPathAllowed("/admin/users", adminPrefixes)).toBe(true);
  });

  test("allows /dashboard for admin subdomain", () => {
    expect(isPathAllowed("/dashboard", adminPrefixes)).toBe(true);
  });

  test("allows /dashboard/* for admin subdomain", () => {
    expect(isPathAllowed("/dashboard/overview", adminPrefixes)).toBe(true);
  });

  test("allows /reports for admin subdomain", () => {
    expect(isPathAllowed("/reports", adminPrefixes)).toBe(true);
  });

  test("allows /reports/* for admin subdomain", () => {
    expect(isPathAllowed("/reports/monthly", adminPrefixes)).toBe(true);
  });

  test("allows /audit for admin subdomain", () => {
    expect(isPathAllowed("/audit", adminPrefixes)).toBe(true);
  });

  test("allows /audit/* for admin subdomain", () => {
    expect(isPathAllowed("/audit/logs", adminPrefixes)).toBe(true);
  });

  test("allows /settings for admin subdomain", () => {
    expect(isPathAllowed("/settings", adminPrefixes)).toBe(true);
  });

  test("allows /settings/* for admin subdomain", () => {
    expect(isPathAllowed("/settings/profile", adminPrefixes)).toBe(true);
  });

  test("blocks /crew/ on admin subdomain", () => {
    expect(isPathAllowed("/crew/home", adminPrefixes)).toBe(false);
  });

  // Admin prefix boundary tests
  test("blocks /admintools on admin subdomain (prefix boundary)", () => {
    expect(isPathAllowed("/admintools", adminPrefixes)).toBe(false);
  });

  test("blocks /adminstration on admin subdomain (prefix boundary)", () => {
    expect(isPathAllowed("/adminstration", adminPrefixes)).toBe(false);
  });
});

describe("middleware cookie auth gating (NEXT_PUBLIC_COOKIE_AUTH)", () => {
  const originalFlag = process.env.NEXT_PUBLIC_COOKIE_AUTH;
  const originalSecret = process.env.CREW_JWT_SECRET;

  afterEach(() => {
    if (originalFlag === undefined) delete process.env.NEXT_PUBLIC_COOKIE_AUTH;
    else process.env.NEXT_PUBLIC_COOKIE_AUTH = originalFlag;
    if (originalSecret === undefined) delete process.env.CREW_JWT_SECRET;
    else process.env.CREW_JWT_SECRET = originalSecret;
  });

  function crewHomeRequest() {
    return new NextRequest("http://localhost:3000/crew/home");
  }

  test("skips cookie verification when flag is not 'true'", async () => {
    process.env.NEXT_PUBLIC_COOKIE_AUTH = "false";
    process.env.CREW_JWT_SECRET = "dev-crew-secret";
    const res = await middleware(crewHomeRequest());
    expect(res.headers.get("location")).toBeNull();
  });

  test("skips cookie verification when flag is unset", async () => {
    delete process.env.NEXT_PUBLIC_COOKIE_AUTH;
    process.env.CREW_JWT_SECRET = "dev-crew-secret";
    const res = await middleware(crewHomeRequest());
    expect(res.headers.get("location")).toBeNull();
  });

  test("redirects /crew/home without cookie when flag is 'true'", async () => {
    process.env.NEXT_PUBLIC_COOKIE_AUTH = "true";
    process.env.CREW_JWT_SECRET = "dev-crew-secret";
    const res = await middleware(crewHomeRequest());
    expect(res.headers.get("location")).toBe(
      "http://localhost:3000/crew/login",
    );
  });

  // Signs an HS256 JWT the same way the API's hono/jwt sign() does
  // (base64url, no padding) so the middleware is tested against a real token.
  function signCrewToken(secret: string, exp: number): string {
    const b64url = (s: string) =>
      Buffer.from(s)
        .toString("base64")
        .replaceAll("+", "-")
        .replaceAll("/", "_")
        .replace(/=+$/, "");
    const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = b64url(
      JSON.stringify({ crewId: "c1", shiftId: "s1", siteId: "site1", exp }),
    );
    const sig = require("node:crypto")
      .createHmac("sha256", secret)
      .update(`${header}.${payload}`)
      .digest("base64")
      .replaceAll("+", "-")
      .replaceAll("/", "_")
      .replace(/=+$/, "");
    return `${header}.${payload}.${sig}`;
  }

  test("allows /crew/home with a valid crew-token cookie when flag is 'true'", async () => {
    process.env.NEXT_PUBLIC_COOKIE_AUTH = "true";
    process.env.CREW_JWT_SECRET = "dev-crew-secret";
    const token = signCrewToken(
      "dev-crew-secret",
      Math.floor(Date.now() / 1000) + 3600,
    );
    const req = new NextRequest("http://localhost:3000/crew/home", {
      headers: { cookie: `crew-token=${token}` },
    });
    const res = await middleware(req);
    expect(res.headers.get("location")).toBeNull();
  });

  test("redirects /crew/home with an expired crew-token cookie when flag is 'true'", async () => {
    process.env.NEXT_PUBLIC_COOKIE_AUTH = "true";
    process.env.CREW_JWT_SECRET = "dev-crew-secret";
    const token = signCrewToken(
      "dev-crew-secret",
      Math.floor(Date.now() / 1000) - 60,
    );
    const req = new NextRequest("http://localhost:3000/crew/home", {
      headers: { cookie: `crew-token=${token}` },
    });
    const res = await middleware(req);
    expect(res.headers.get("location")).toBe(
      "http://localhost:3000/crew/login",
    );
  });
});
