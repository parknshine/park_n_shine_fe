/**
 * Base URL for fetches that run on the server (route handlers, RSC).
 *
 * The browser may be pointed at the relative "/api" proxy prefix to avoid
 * mixed-content blocking, but `fetch` on the server cannot resolve a relative
 * URL — and it has no mixed-content restriction — so it talks to the backend
 * origin directly.
 */
export function serverApiBaseUrl(): string {
  const publicUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  const base = /^https?:\/\//.test(publicUrl)
    ? publicUrl
    : (process.env.API_PROXY_TARGET ?? "http://localhost:3001");
  return base.replace(/\/+$/, "");
}
