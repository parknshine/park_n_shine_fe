const STORAGE_KEY = "marketing-back-origin";

export function setMarketingBackOrigin(path: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, path);
}

export function getMarketingBackOrigin(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(STORAGE_KEY);
}
