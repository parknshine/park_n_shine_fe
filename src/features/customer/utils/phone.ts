/**
 * Returns true if the phone string contains between 9 and 15 numeric digits
 * (after stripping spaces, dashes, and the + prefix).
 */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}

/**
 * Normalizes phone to format backend WhatsAppService expects:
 * strip non-digits and leading "+", keep leading "0" or "62" intact.
 * Backend handles: "0" → "62", "+" stripped. Does NOT handle "8xxx" without prefix.
 *   "081234567890"   → "081234567890"
 *   "+6281234567890" → "6281234567890"
 *   "6281234567890"  → "6281234567890"
 *   "81234567890"    → "081234567890"  (add 0 so backend converts correctly)
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("62") || digits.startsWith("0")) return digits;
  // bare number like "81234..." — add leading 0 so backend maps it to "62..."
  return "0" + digits;
}
