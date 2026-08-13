import { describe, expect, test } from "bun:test";
import { buildE164, isValidPhone, normalizePhone, splitStoredPhone } from "./phone";

describe("isValidPhone", () => {
  test("valid 12-digit Indonesian number", () => {
    expect(isValidPhone("081234567890")).toBe(true);
  });

  test("valid number with spaces", () => {
    expect(isValidPhone("0812 3456 7890")).toBe(true);
  });

  test("valid number with +62 prefix", () => {
    expect(isValidPhone("+6281234567890")).toBe(true);
  });

  test("valid number with dashes", () => {
    expect(isValidPhone("0812-3456-7890")).toBe(true);
  });

  test("rejects empty string", () => {
    expect(isValidPhone("")).toBe(false);
  });

  test("rejects fewer than 9 digits", () => {
    expect(isValidPhone("08123456")).toBe(false);
  });

  test("rejects more than 15 digits", () => {
    expect(isValidPhone("0812345678901234")).toBe(false);
  });

  test("rejects letters-only string", () => {
    expect(isValidPhone("abcdefghij")).toBe(false);
  });

  test("rejects invalid E.164 number even when digit count is sufficient", () => {
    expect(isValidPhone("+62000000000")).toBe(false);
  });
});

describe("splitStoredPhone", () => {
  test("splits a stored Indonesian number into ID + national number", () => {
    expect(splitStoredPhone("6281234567890")).toEqual({
      countryCode: "ID",
      nationalNumber: "81234567890",
    });
  });

  test("splits a stored Singapore number into SG + national number", () => {
    expect(splitStoredPhone("6591234567")).toEqual({
      countryCode: "SG",
      nationalNumber: "91234567",
    });
  });

  test("defaults to ID with empty national number for empty string", () => {
    expect(splitStoredPhone("")).toEqual({
      countryCode: "ID",
      nationalNumber: "",
    });
  });

  test("defaults to ID with empty national number for null", () => {
    expect(splitStoredPhone(null)).toEqual({
      countryCode: "ID",
      nationalNumber: "",
    });
  });

  test("falls back to ID with the raw digits when the number can't be parsed", () => {
    expect(splitStoredPhone("1234567")).toEqual({
      countryCode: "ID",
      nationalNumber: "1234567",
    });
  });
});

describe("buildE164", () => {
  test("strips a leading trunk 0 from an Indonesian national number", () => {
    expect(buildE164("ID", "081234567890")).toBe("+6281234567890");
  });

  test("builds an Indonesian E.164 number from a bare national number", () => {
    expect(buildE164("ID", "81234567890")).toBe("+6281234567890");
  });

  test("builds a Singapore E.164 number", () => {
    expect(buildE164("SG", "91234567")).toBe("+6591234567");
  });

  test("returns empty string for empty input", () => {
    expect(buildE164("ID", "")).toBe("");
  });

  test("round-trips the leading-zero Indonesian case through splitStoredPhone and normalizePhone", () => {
    const e164 = buildE164("ID", "081234567890");
    const normalized = normalizePhone(e164);
    expect(normalized).toBe("6281234567890");
    expect(splitStoredPhone(normalized)).toEqual({
      countryCode: "ID",
      nationalNumber: "81234567890",
    });
  });

  test("round-trips the Singapore case through splitStoredPhone and normalizePhone", () => {
    const e164 = buildE164("SG", "91234567");
    const normalized = normalizePhone(e164);
    expect(normalized).toBe("6591234567");
    expect(splitStoredPhone(normalized)).toEqual({
      countryCode: "SG",
      nationalNumber: "91234567",
    });
  });
});
