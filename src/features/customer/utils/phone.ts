/**
 * Returns true if the phone string contains between 9 and 15 numeric digits
 * (after stripping spaces, dashes, and the + prefix).
 */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}
