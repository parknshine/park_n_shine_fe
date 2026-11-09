/**
 * Plate and slot share the backend whitelist: letters, digits, space, hyphen.
 * OCR often inserts a dot or other punctuation (for example "F.6797 8B"),
 * which the confirm endpoint rejects. Drop those characters before sending.
 */
export function sanitizePlateOrSlot(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9 -]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 20);
}
