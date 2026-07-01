import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes without conflicts */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Display-safe short form of a booking UUID: #XXXXXXXX-XXXX-XXXX */
export function shortId(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}-${id.slice(8, 12).toUpperCase()}-${id.slice(12, 16).toUpperCase()}`;
}

/**
 * Preferred booking display code: the human-readable reference (e.g.
 * #PS-01-202607001) when assigned, otherwise the short form of the internal id.
 */
export function bookingRef(reference: string | null | undefined, id: string): string {
  return reference ?? shortId(id);
}
