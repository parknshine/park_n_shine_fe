"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { AppShell } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { OcrEditField } from "@/features/customer/components/ocr-edit-field";
import { PhotoUploadField } from "@/features/customer/components/photo-upload-field";
import { usePhotoUpload } from "@/features/customer/hooks";
import { isValidPhone } from "@/features/customer/utils/phone";
import type {
  CreateBookingPayload,
  CustomerBooking,
} from "@/features/customer/types";

export default function BookCapturePage() {
  const router = useRouter();
  const { qrId } = useParams<{ qrId: string }>();

  const [plateText, setPlateText] = useState("");
  const [slotText, setSlotText] = useState("");
  const [phone, setPhone] = useState("");

  const hasCreatedRef = useRef(false);

  const createMutation = useMutation({
    meta: { persist: false },
    mutationFn: async () => {
      const payload: CreateBookingPayload = { qrId, locale: "id-ID" };
      const response = await api.post<CustomerBooking>("/v1/bookings", payload);
      return response.data;
    },
    mutationKey: ["customer", "booking", "create", "v2"] as const,
  });

  const bookingId = createMutation.data?.id ?? null;
  const signedToken = createMutation.data?.signedToken ?? null;

  useEffect(() => {
    if (!hasCreatedRef.current) {
      hasCreatedRef.current = true;
      createMutation.mutate();
    }
    return () => {
      // Reset on unmount so React Strict Mode remount re-fires the mutation
      hasCreatedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const plateUpload = usePhotoUpload({
    bookingId: bookingId ?? "",
    signedToken: signedToken ?? undefined,
  });
  const slotUpload = usePhotoUpload({
    bookingId: bookingId ?? "",
    signedToken: signedToken ?? undefined,
  });

  useEffect(() => {
    if (plateUpload.media?.ocrText) {
      const text = plateUpload.media.ocrText;
      startTransition(() => setPlateText(text));
    }
  }, [plateUpload.media?.ocrText]);

  useEffect(() => {
    if (slotUpload.media?.ocrText) {
      const text = slotUpload.media.ocrText;
      startTransition(() => setSlotText(text));
    }
  }, [slotUpload.media?.ocrText]);

  const canContinue =
    !!bookingId &&
    plateUpload.status === "success" &&
    slotUpload.status === "success" &&
    plateText.trim().length > 0 &&
    slotText.trim().length > 0 &&
    isValidPhone(phone);

  function handleContinue() {
    if (!bookingId || !signedToken) return;
    const params = new URLSearchParams({
      bookingId,
      token: signedToken,
      phone: phone.trim(),
      plate: plateText.trim().toUpperCase(),
      slot: slotText.trim().toUpperCase(),
    });
    router.push(`/q/${qrId}/book/confirm?${params.toString()}`);
  }

  if (createMutation.isPending || (!bookingId && !createMutation.isError)) {
    return (
      <AppShell surface="customer">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Menyiapkan booking...</p>
        </div>
      </AppShell>
    );
  }

  if (createMutation.isError) {
    return (
      <AppShell surface="customer">
        <div className="space-y-4 pt-10 text-center">
          <p className="text-sm text-destructive">
            Gagal membuat booking. Silakan coba lagi.
          </p>
          <Button
            onClick={() => {
              hasCreatedRef.current = false;
              createMutation.mutate();
            }}
          >
            Coba Lagi
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell surface="customer">
      <div className="space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Langkah 1 dari 2
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">
            Foto Kendaraan
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ambil foto plat nomor dan slot parkir mobilmu.
          </p>
        </div>

        <div className="space-y-4">
          <PhotoUploadField
            id="plate-photo"
            kind="plate"
            label="Foto Plat Nomor"
            state={plateUpload}
            onSelect={(file, kind) => plateUpload.uploadPhoto({ file, kind })}
            onRetry={plateUpload.reset}
          />
          {plateUpload.status === "success" && (
            <OcrEditField
              id="plate-text"
              label="Nomor Plat (perbaiki jika ada yang salah)"
              value={plateText}
              onChange={setPlateText}
              placeholder="contoh: B 1234 SKJ"
            />
          )}

          <PhotoUploadField
            id="slot-photo"
            kind="slot"
            label="Foto Slot Parkir"
            state={slotUpload}
            onSelect={(file, kind) => slotUpload.uploadPhoto({ file, kind })}
            onRetry={slotUpload.reset}
          />
          {slotUpload.status === "success" && (
            <OcrEditField
              id="slot-text"
              label="Nomor Slot (perbaiki jika ada yang salah)"
              value={slotText}
              onChange={setSlotText}
              placeholder="contoh: P2-G15"
            />
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="phone"
              className="text-sm font-medium text-foreground"
            >
              Nomor HP
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>

        <Button
          size="lg"
          className="w-full rounded-full"
          disabled={!canContinue}
          suffix={<ArrowRight className="h-4 w-4" />}
          onClick={handleContinue}
        >
          Lanjut
        </Button>
      </div>
    </AppShell>
  );
}
