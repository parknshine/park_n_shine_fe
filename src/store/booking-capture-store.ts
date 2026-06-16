import { create } from "zustand";
import type { UploadState } from "@/features/customer/types";

interface CaptureSession {
  flowKey: string | null;
  bookingId: string | null;
  signedToken: string | null;
  plateText: string;
  slotText: string;
  location: string;
  phone: string;
  plateState: UploadState | null;
  slotState: UploadState | null;
}

interface BookingCaptureStore extends CaptureSession {
  captureHasProgress: boolean;
  setCaptureHasProgress: (value: boolean) => void;
  save: (session: Partial<CaptureSession>) => void;
  clear: () => void;
}

const EMPTY: CaptureSession = {
  flowKey: null,
  bookingId: null,
  signedToken: null,
  plateText: "",
  slotText: "",
  location: "",
  phone: "",
  plateState: null,
  slotState: null,
};

export const useBookingCaptureStore = create<BookingCaptureStore>((set) => ({
  ...EMPTY,
  captureHasProgress: false,
  setCaptureHasProgress: (value) => set({ captureHasProgress: value }),
  save: (session) => set((state) => ({ ...state, ...session })),
  clear: () => set({ ...EMPTY, captureHasProgress: false }),
}));
