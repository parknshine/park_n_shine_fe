import { describe, expect, test } from "bun:test";
import { isValidPhone } from "./phone";

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
});
