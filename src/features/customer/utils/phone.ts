import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js";

/**
 * Returns true if the phone string is a valid phone number.
 * For E.164 format (starts with +), uses libphonenumber-js.
 * For local formats without +, falls back to digit-count check.
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  if (phone.startsWith("+")) {
    try {
      return isValidPhoneNumber(phone);
    } catch {
      return false;
    }
  }
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}

/**
 * Normalizes phone to the format the backend WhatsAppService expects.
 * For E.164 (starts with +): strips the + sign, returns digits only.
 * For local Indonesian formats: keeps existing behavior.
 *   "081234567890"   → "081234567890"
 *   "+6281234567890" → "6281234567890"
 *   "6281234567890"  → "6281234567890"
 *   "81234567890"    → "081234567890"  (bare number — add 0 for backend)
 */
export function normalizePhone(phone: string): string {
  if (!phone) return "";
  if (phone.startsWith("+")) {
    return phone.slice(1).replace(/\D/g, "");
  }
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  return digits;
}

export interface SplitPhone {
  countryCode: CountryCode;
  nationalNumber: string;
}

/**
 * Splits a stored digits-only phone number (the shape normalizePhone()
 * produces) back into a country code and national number, for
 * pre-filling a country-selector input. Falls back to Indonesia when the
 * number can't be parsed (matches the app's prior Indonesia-only default).
 */
export function splitStoredPhone(
  phone: string | null | undefined,
): SplitPhone {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return { countryCode: "ID", nationalNumber: "" };

  const parsed = parsePhoneNumberFromString(`+${digits}`);
  if (parsed?.country) {
    return { countryCode: parsed.country, nationalNumber: parsed.nationalNumber };
  }

  if (digits.startsWith("62")) {
    return { countryCode: "ID", nationalNumber: digits.slice(2) };
  }
  return { countryCode: "ID", nationalNumber: digits };
}

/**
 * Builds an E.164 phone number from a selected country and the raw
 * national-number input a user typed (e.g. Indonesian users habitually
 * type a leading trunk "0", as in "081234567890"). Uses libphonenumber-js
 * to parse the input in the context of the selected country so trunk
 * prefixes and formatting are handled correctly instead of being naively
 * concatenated onto the dial code.
 */
export function buildE164(countryCode: CountryCode, nationalInput: string): string {
  const trimmed = nationalInput.trim();
  if (!trimmed) return "";
  const parsed = parsePhoneNumberFromString(trimmed, countryCode);
  if (parsed) return parsed.number;
  return `+${getCountryCallingCode(countryCode)}${trimmed.replace(/\D/g, "")}`;
}

export interface DialCodeOption {
  countryCode: CountryCode;
  dialCode: string;
  flag: string;
  name: string;
  isPriority: boolean;
}

const PRIORITY_CODES: CountryCode[] = ["ID", "SG", "MY", "AU", "US", "GB"];

function toFlag(code: string): string {
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + (c.codePointAt(0) ?? 65) - 65))
    .join("");
}

let _dialCodeCache: DialCodeOption[] | null = null;

/**
 * Returns a sorted list of country dial code options.
 * Priority countries appear first, remaining sorted alphabetically by name.
 * Result is cached after first call.
 */
export function getDialCodeOptions(): DialCodeOption[] {
  if (_dialCodeCache) return _dialCodeCache;
  const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
  const all = getCountries().map((code) => ({
    countryCode: code,
    dialCode: `+${getCountryCallingCode(code)}`,
    flag: toFlag(code),
    name: displayNames.of(code) ?? code,
    isPriority: PRIORITY_CODES.includes(code),
  }));
  const priority = PRIORITY_CODES
    .map((c) => all.find((o) => o.countryCode === c))
    .filter((o): o is DialCodeOption => !!o);
  const rest = all
    .filter((o) => !PRIORITY_CODES.includes(o.countryCode))
    .sort((a, b) => a.name.localeCompare(b.name));
  _dialCodeCache = [...priority, ...rest];
  return _dialCodeCache;
}
