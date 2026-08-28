import { wrapStorageSafely } from "./safe-storage";

const STORAGE_KEY = "png_guest_active_booking";

// Terminal booking statuses — once reached, a guest has nothing left to
// resume (matches BookingStatus in park-n-shine-api/src/domain/booking/BookingEntity.ts).
const TERMINAL_STATUSES = new Set(["CLOSED", "CANCELLED", "EXPIRED"]);

export interface GuestBookingPointer {
  bookingId: string;
  token: string;
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function defaultStorage(): StorageLike {
  return wrapStorageSafely(window.localStorage);
}

// Points a guest (not logged in, so no /v1/me/bookings history) back to the
// one booking they most recently had a live token for — e.g. after they
// close the browser mid-payment and come back later. Only bookingId+token
// are stored; the server's live status always decides whether it's still
// worth showing (see isGuestBookingResumable).
export function saveGuestBookingPointer(
  pointer: GuestBookingPointer,
  storage: StorageLike = defaultStorage(),
): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(pointer));
}

export function getGuestBookingPointer(
  storage: StorageLike = defaultStorage(),
): GuestBookingPointer | null {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.bookingId === "string" && typeof parsed?.token === "string") {
      return { bookingId: parsed.bookingId, token: parsed.token };
    }
    return null;
  } catch {
    return null;
  }
}

export function clearGuestBookingPointer(
  storage: StorageLike = defaultStorage(),
): void {
  storage.removeItem(STORAGE_KEY);
}

export function isGuestBookingResumable(status: string): boolean {
  return !TERMINAL_STATUSES.has(status);
}
