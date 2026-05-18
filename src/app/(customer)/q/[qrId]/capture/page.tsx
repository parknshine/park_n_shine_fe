"use client";

import { startTransition, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { parseAsString, useQueryStates } from "nuqs";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { OcrEditField } from "@/features/customer/components/ocr-edit-field";
import { PhotoUploadField } from "@/features/customer/components/photo-upload-field";
import { usePhotoUpload } from "@/features/customer/hooks";

export default function CapturePage() {
  const router = useRouter();
  const { qrId } = useParams<{ qrId: string }>();
  const [{ bookingId, token }] = useQueryStates({
    bookingId: parseAsString,
    token: parseAsString,
  });

  const [plateText, setPlateText] = useState("");
  const [slotText, setSlotText] = useState("");

  const plateUpload = usePhotoUpload({
    bookingId: bookingId ?? "",
    signedToken: token ?? undefined,
  });
  const slotUpload = usePhotoUpload({
    bookingId: bookingId ?? "",
    signedToken: token ?? undefined,
  });

  // Redirect if required params are missing
  useEffect(() => {
    if (!bookingId || !token) {
      router.replace(`/q/${qrId}`);
    }
  }, [bookingId, token, router, qrId]);

  // Pre-fill OCR result when plate upload completes
  useEffect(() => {
    if (plateUpload.media?.ocrText) {
      const text = plateUpload.media.ocrText;
      startTransition(() => setPlateText(text));
    }
  }, [plateUpload.media?.ocrText]);

  // Pre-fill OCR result when slot upload completes
  useEffect(() => {
    if (slotUpload.media?.ocrText) {
      const text = slotUpload.media.ocrText;
      startTransition(() => setSlotText(text));
    }
  }, [slotUpload.media?.ocrText]);

  const canContinue =
    plateUpload.status === "success" &&
    slotUpload.status === "success" &&
    plateText.trim().length > 0 &&
    slotText.trim().length > 0;

  function handleContinue() {
    const params = new URLSearchParams({
      bookingId: bookingId ?? "",
      token: token ?? "",
      plate: plateText.trim().toUpperCase(),
      slot: slotText.trim().toUpperCase(),
    });
    router.push(`/q/${qrId}/confirm?${params.toString()}`);
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
