import { describe, it, expect } from "bun:test";
import {
  saveGuestBookingPointer,
  getGuestBookingPointer,
  clearGuestBookingPointer,
  isGuestBookingResumable,
} from "./guest-booking-pointer";

function makeFakeStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
  };
}

describe("guest booking pointer", () => {
  it("returns null when nothing has been saved", () => {
    const storage = makeFakeStorage();
    expect(getGuestBookingPointer(storage)).toBeNull();
  });

  it("round-trips a saved pointer", () => {
    const storage = makeFakeStorage();
    saveGuestBookingPointer({ bookingId: "bk_001", token: "tok_abc" }, storage);
    expect(getGuestBookingPointer(storage)).toEqual({
      bookingId: "bk_001",
      token: "tok_abc",
    });
  });

  it("returns null for malformed stored data instead of throwing", () => {
    const storage = makeFakeStorage();
    storage.setItem("png_guest_active_booking", "{not json");
    expect(getGuestBookingPointer(storage)).toBeNull();
  });

  it("removes the pointer on clear", () => {
    const storage = makeFakeStorage();
    saveGuestBookingPointer({ bookingId: "bk_001", token: "tok_abc" }, storage);
    clearGuestBookingPointer(storage);
    expect(getGuestBookingPointer(storage)).toBeNull();
  });
});

describe("isGuestBookingResumable", () => {
  it("is resumable while payment is still pending", () => {
    expect(isGuestBookingResumable("PENDING")).toBe(true);
  });

  it("is resumable while the crew is working the job", () => {
    expect(isGuestBookingResumable("IN_PROGRESS")).toBe(true);
  });

  it("is not resumable once closed", () => {
    expect(isGuestBookingResumable("CLOSED")).toBe(false);
  });

  it("is not resumable once cancelled", () => {
    expect(isGuestBookingResumable("CANCELLED")).toBe(false);
  });

  it("is not resumable once expired", () => {
    expect(isGuestBookingResumable("EXPIRED")).toBe(false);
  });
});
