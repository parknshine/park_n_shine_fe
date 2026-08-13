import { describe, expect, test } from "bun:test";
import { isValidPhone, splitStoredPhone } from "./phone";

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
