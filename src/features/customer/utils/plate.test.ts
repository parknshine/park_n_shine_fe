import { describe, expect, test } from "bun:test";
import { sanitizePlateOrSlot } from "./plate";

describe("sanitizePlateOrSlot", () => {
  test("turns an OCR dot into a space", () => {
    expect(sanitizePlateOrSlot("F.6797 8B")).toBe("F 6797 8B");
  });

  test("uppercases and collapses whitespace", () => {
    expect(sanitizePlateOrSlot("  b  1234   abc ")).toBe("B 1234 ABC");
  });

  test("keeps hyphens used in slot numbers", () => {
    expect(sanitizePlateOrSlot("p2-g15")).toBe("P2-G15");
  });

  test("drops markup and other characters the backend rejects", () => {
    expect(sanitizePlateOrSlot("B<script>1234")).toBe("B SCRIPT 1234");
  });

  test("caps the value at 20 characters", () => {
    expect(sanitizePlateOrSlot("ABCDEFGHIJKLMNOPQRSTUVWXYZ")).toBe(
      "ABCDEFGHIJKLMNOPQRST",
    );
  });
});