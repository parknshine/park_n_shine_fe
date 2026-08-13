import { describe, it, expect } from "bun:test";
import { isReadablePhotoFile } from "./photo-file-validation";

function makeFile(bytes: number, type = "image/jpeg"): File {
  return new File([new Uint8Array(bytes)], "photo.jpg", { type });
}

describe("isReadablePhotoFile", () => {
  it("rejects a zero-byte file (camera failed to write it, e.g. device storage full)", () => {
    expect(isReadablePhotoFile(makeFile(0))).toBe(false);
  });

  it("accepts a normal non-empty image file", () => {
    expect(isReadablePhotoFile(makeFile(1024))).toBe(true);
  });
});
