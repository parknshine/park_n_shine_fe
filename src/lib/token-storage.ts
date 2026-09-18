import { wrapStorageSafely } from "@/lib/safe-storage";

function storage() {
  if (typeof window === "undefined") return null;
  return wrapStorageSafely(window.localStorage);
}

export function createTokenStorage(accessKey: string, refreshKey: string) {
  return {
    getAccessToken(): string | null {
      return storage()?.getItem(accessKey) ?? null;
    },
    getRefreshToken(): string | null {
      return storage()?.getItem(refreshKey) ?? null;
    },
    setTokens(accessToken: string, refreshToken?: string | null): void {
      const s = storage();
      if (!s) return;
      s.setItem(accessKey, accessToken);
      if (refreshToken) s.setItem(refreshKey, refreshToken);
    },
    clearTokens(): void {
      const s = storage();
      if (!s) return;
      s.removeItem(accessKey);
      s.removeItem(refreshKey);
    },
  };
}

export function unwrapEnvelopeData(data: unknown): unknown {
  if (
    data &&
    typeof data === "object" &&
    "success" in data &&
    "data" in data &&
    (data as { data: unknown }).data !== undefined
  ) {
    return (data as { data: unknown }).data;
  }
  return data;
}
