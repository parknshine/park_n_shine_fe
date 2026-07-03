/**
 * Helpers for inspecting auth errors thrown by `useCustomerAuth`.
 *
 * `mapFirebaseError` (in `use-customer-auth.ts`) maps raw Firebase error codes
 * to i18n keys and throws them as `Error.message`. This couples the error's
 * identity to its display text, which is fragile: renaming a locale key or
 * changing the mapper silently breaks any branch that compares against the key.
 *
 * The functions below centralise the known equality checks so the fragile
 * coupling lives in exactly one place and is documented. If `mapFirebaseError`
 * is later refactored to throw structured errors (e.g. `{ code, i18nKey }`),
 * update only this module to branch on the stable `code` instead.
 */

/**
 * i18n keys that indicate an action-code link (password reset / email verify)
 * is unusable — already consumed, expired, or tampered with. When the reset
 * flow receives one of these it switches to the "request a new link" state
 * rather than showing a generic error toast.
 */
const INVALID_ACTION_CODE_KEYS: ReadonlySet<string> = new Set([
  "auth.errors.invalidActionCode",
  "auth.errors.expiredActionCode",
]);

/** Fallback i18n key for unknown auth errors. */
export const GENERIC_AUTH_ERROR_KEY = "auth.errors.generic";

/**
 * Returns the i18n key carried by an auth error, or the generic fallback when
 * the error has no usable message. Use this to resolve the toast copy.
 */
export function getAuthErrorKey(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : GENERIC_AUTH_ERROR_KEY;
}

/** True when the error indicates an unusable action-code link. */
export function isInvalidActionCodeError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return INVALID_ACTION_CODE_KEYS.has(error.message);
}
