"use client";

import { startTransition, Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { AppShell, OfflineBanner } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OcrEditField } from "@/features/customer/components/ocr-edit-field";
import { PhotoUploadField } from "@/features/customer/components/photo-upload-field";
import { useBookingStatus, usePhotoUpload, usePublicSettings } from "@/features/customer/hooks";
import { isValidPhone } from "@/features/customer/utils/phone";
import { useTranslation } from "@/i18n";

export default function CapturePage() {
  return (
    <Suspense>
      <CaptureContent />
    </Suspense>
  );
}

function CaptureContent() {
  const router = useRouter();
  const { qrId } = useParams<{ qrId: string }>();
  const { t } = useTranslation("customer");

  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const token = searchParams.get("token");

  const [plateText, setPlateText] = useState("");
  const [slotText, setSlotText] = useState("");
  const [phone, setPhone] = useState("");

  const { loyaltyEnabled } = usePublicSettings();

  const { booking } = useBookingStatus({
    bookingId: bookingId ?? "",
    signedToken: token ?? "",
    pollIntervalMs: Infinity,
    enabled: !!bookingId && !!token,
  });

  const siteName = booking?.siteName ?? null;

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

  // Toast on upload errors
  useEffect(() => {
    if (plateUpload.error) toast.error(plateUpload.error);
  }, [plateUpload.error]);

  useEffect(() => {
    if (slotUpload.error) toast.error(slotUpload.error);
  }, [slotUpload.error]);

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
    slotText.trim().length > 0 &&
    (phone === "" || isValidPhone(phone));

  function handleContinue() {
    const params = new URLSearchParams({
      bookingId: bookingId ?? "",
      token: token ?? "",
      phone: phone.trim(),
      plate: plateText.trim().toUpperCase(),
      slot: slotText.trim().toUpperCase(),
    });
    router.push(`/q/${qrId}/confirm?${params.toString()}`);
  }

  const uploadLabels = {
    retry:     t("booking.capture.uploadLabels.retry"),
    upload:    t("booking.capture.uploadLabels.upload"),
    uploading: t("booking.capture.uploadLabels.uploading"),
    retrying:  t("booking.capture.uploadLabels.retrying"),
  };

  const isOfflinePaused = plateUpload.isOfflinePaused || slotUpload.isOfflinePaused;

  return (
    <AppShell surface="customer">
      <div className="space-y-5">
        <OfflineBanner visible={isOfflinePaused} />

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("booking.step", { current: 1, total: 2 })}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">
            {t("booking.capture.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("booking.capture.subtitle")}
          </p>
        </div>

        <div className="space-y-3">
          <PhotoUploadField
            id="plate-photo"
            kind="plate"
            label={t("booking.capture.platePhotoLabel")}
            hint={t("booking.capture.platePhotoGuideline")}
            state={plateUpload}
            labels={uploadLabels}
            onSelect={(file, kind) => plateUpload.uploadPhoto({ file, kind })}
            onRetry={plateUpload.reset}
          />
          {plateUpload.status === "success" && (
            <OcrEditField
              id="plate-text"
              label={t("booking.capture.plateOcrLabel")}
              value={plateText}
              onChange={setPlateText}
              placeholder={t("booking.capture.platePlaceholder")}
            />
          )}

          <PhotoUploadField
            id="slot-photo"
            kind="slot"
            label={t("booking.capture.slotPhotoLabel")}
            hint={t("booking.capture.slotPhotoGuideline")}
            state={slotUpload}
            labels={uploadLabels}
            onSelect={(file, kind) => slotUpload.uploadPhoto({ file, kind })}
            onRetry={slotUpload.reset}
          />
          {slotUpload.status === "success" && (
            <OcrEditField
              id="slot-text"
              label={t("booking.capture.slotOcrLabel")}
              value={slotText}
              onChange={setSlotText}
              placeholder={t("booking.capture.slotPlaceholder")}
            />
          )}

          <div className="space-y-1.5 rounded-lg border border-border bg-card p-4 shadow-sm">
            <label className="text-sm font-medium text-foreground">
              {t("booking.capture.locationLabel")}
            </label>
            <Select disabled value={siteName ?? undefined}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={t("booking.capture.locationDisabledPlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
                {siteName && (
                  <SelectItem value={siteName}>{siteName}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 rounded-lg border border-border bg-card p-4 shadow-sm">
            <label
              htmlFor="phone"
              className="text-sm font-medium text-foreground"
            >
              {t("booking.capture.phoneLabel")}
            </label>
            <Input
              id="phone"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder={t("booking.capture.phonePlaceholder")}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            {loyaltyEnabled && (
              <p className="text-xs text-muted-foreground mt-1">
                Nomor HP akan digunakan untuk program loyalti Park N Shine
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {t("booking.capture.phoneHelper")}
            </p>
          </div>
        </div>

        <div className="pt-1">
          <Button
            size="lg"
            className="w-full rounded-full"
            disabled={!canContinue}
            suffix={<ArrowRight className="h-4 w-4" />}
            onClick={handleContinue}
          >
            {t("action.next", { ns: "common" })}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
