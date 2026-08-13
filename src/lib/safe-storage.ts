interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * Wraps a Storage-like object so read/write failures (e.g. iOS silently
 * evicting localStorage under low disk space, or a QuotaExceededError) never
 * throw out of the caller — they degrade to a no-op instead of crashing
 * whatever action triggered the write (e.g. a login mutation's onSuccess).
 */
export function wrapStorageSafely(storage: StorageLike): StorageLike {
  return {
    getItem(key) {
      try {
        return storage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem(key, value) {
      try {
        storage.setItem(key, value);
      } catch {
        // Storage full or unavailable — keep running in-memory only.
      }
    },
    removeItem(key) {
      try {
        storage.removeItem(key);
      } catch {
        // Storage full or unavailable — keep running in-memory only.
      }
    },
  };
}
