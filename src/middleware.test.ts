import { describe, expect, test } from "bun:test";
import { SUBDOMAIN_CONFIG, detectSubdomain, isPathAllowed } from "./middleware";

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
