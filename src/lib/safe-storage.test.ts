import { describe, it, expect } from "bun:test";
import { wrapStorageSafely } from "./safe-storage";

describe("wrapStorageSafely", () => {
  it("swallows a QuotaExceededError thrown by the underlying storage on setItem", () => {
    const underlying = {
      getItem: () => null,
      setItem: () => {
        throw new DOMException("Quota exceeded", "QuotaExceededError");
      },
      removeItem: () => {},
    };

    const safe = wrapStorageSafely(underlying);

    expect(() => safe.setItem("crew-auth", "{}")).not.toThrow();
  });

  it("returns null instead of throwing when the underlying storage.getItem fails", () => {
    const underlying = {
      getItem: () => {
        throw new Error("storage unavailable");
      },
      setItem: () => {},
      removeItem: () => {},
    };

    const safe = wrapStorageSafely(underlying);

    expect(safe.getItem("crew-auth")).toBeNull();
  });

  it("delegates successful reads and writes to the underlying storage unchanged", () => {
    const store = new Map<string, string>();
    const underlying = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    };

    const safe = wrapStorageSafely(underlying);
    safe.setItem("k", "v");
    expect(safe.getItem("k")).toBe("v");
    safe.removeItem("k");
    expect(safe.getItem("k")).toBeNull();
  });
});
