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
import { PhotoUploadField } from "@/features/customer/components/photo-upload-field";
import { StepProgressBar } from "@/features/customer/components/step-progress-bar";
import { useBookingStatus, usePhotoUpload, usePublicSettings } from "@/features/customer/hooks";
import { isValidPhone, normalizePhone } from "@/features/customer/utils/phone";
import { useTranslation } from "@/i18n";
import { useBookingCaptureStore } from "@/store/booking-capture-store";
import { useCustomerAuthStore } from "@/store/customer-auth-store";

export default function CapturePage() {
  return (
    <Suspense>
      <CaptureContent />
    </Suspense>
  );
}

const QR_CAPTURE_FLOW = "qr-capture";

function CaptureContent() {
  const router = useRouter();
  const { qrId } = useParams<{ qrId: string }>();
  const { t } = useTranslation("customer");

  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const token = searchParams.get("token");

  const { save: saveCapture } = useBookingCaptureStore();
  const setCaptureHasProgress = useBookingCaptureStore((s) => s.setCaptureHasProgress);

  // Restore session if it matches the current bookingId (back-navigation)
  const [savedSession] = useState(() => {
    const urlBookingId = new URLSearchParams(globalThis.location?.search ?? "").get("bookingId");
    const s = useBookingCaptureStore.getState();
    return s.flowKey === QR_CAPTURE_FLOW && s.bookingId === urlBookingId ? s : null;
  });

  const [plateText, setPlateText] = useState(savedSession?.plateText ?? "");
  const [slotText, setSlotText] = useState(savedSession?.slotText ?? "");
  const profilePhone = useCustomerAuthStore((s) => s.customer?.phone ?? null);
  const [phone, setPhone] = useState(savedSession?.phone ?? "");
  const [useProfilePhone, setUseProfilePhone] = useState(
    !savedSession && !!profilePhone,
  );

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
    initialState: savedSession?.plateState ?? undefined,
  });
  const slotUpload = usePhotoUpload({
    bookingId: bookingId ?? "",
    signedToken: token ?? undefined,
    initialState: savedSession?.slotState ?? undefined,
  });

  useEffect(() => {
    if (plateUpload.status !== "idle" || slotUpload.status !== "idle") {
      setCaptureHasProgress(true);
    }
  }, [plateUpload.status, slotUpload.status, setCaptureHasProgress]);

  useEffect(() => {
    if (!bookingId || !token) router.replace(`/q/${qrId}`);
  }, [bookingId, token, router, qrId]);

  useEffect(() => {
    if (plateUpload.error) toast.error(plateUpload.error);
  }, [plateUpload.error]);

  useEffect(() => {
    if (slotUpload.error) toast.error(slotUpload.error);
  }, [slotUpload.error]);

  useEffect(() => {
    const text = plateUpload.media?.ocrText;
    if (text) startTransition(() => setPlateText(text));
  }, [plateUpload.media?.ocrText]);

  useEffect(() => {
    const text = slotUpload.media?.ocrText;
    if (text) startTransition(() => setSlotText(text));
  }, [slotUpload.media?.ocrText]);

  const effectivePhone = useProfilePhone ? (profilePhone ?? "") : phone;

  const canContinue =
    plateUpload.status === "success" &&
    slotUpload.status === "success" &&
    plateText.trim().length > 0 &&
    slotText.trim().length > 0 &&
    (effectivePhone === "" || isValidPhone(effectivePhone));

  function handleContinue() {
    const plate = plateText.trim().toUpperCase();
    const slot = slotText.trim().toUpperCase();
    saveCapture({
      flowKey: QR_CAPTURE_FLOW,
      bookingId,
      signedToken: token,
      plateText: plate,
      slotText: slot,
      location: "",
      phone: normalizePhone(effectivePhone),
      plateState: { progress: plateUpload.progress, status: plateUpload.status, error: plateUpload.error, media: plateUpload.media },
      slotState: { progress: slotUpload.progress, status: slotUpload.status, error: slotUpload.error, media: slotUpload.media },
    });
    const params = new URLSearchParams({
      bookingId: bookingId ?? "",
      token: token ?? "",
      phone: normalizePhone(effectivePhone),
      plate,
      slot,
    });
    router.push(`/q/${qrId}/confirm?${params.toString()}`);
  }

  const isOfflinePaused = plateUpload.isOfflinePaused || slotUpload.isOfflinePaused;

  return (
    <AppShell surface="customer" className="pt-0! px-0!">
      <StepProgressBar current={1} total={2} label={t("booking.step", { current: 1, total: 2 })} />

      <div className="space-y-4 px-4 pb-6">
        <OfflineBanner visible={isOfflinePaused} />

        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("booking.capture.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("booking.capture.subtitle")}
          </p>
        </div>

        {/* Plate photo + OCR */}
        <PhotoUploadField
          id="plate-photo"
          kind="plate"
          label={t("booking.capture.platePhotoLabel")}
          hint={t("booking.capture.platePhotoGuideline")}
          state={plateUpload}
          onSelect={(file, kind) => plateUpload.uploadPhoto({ file, kind })}
          onRetry={plateUpload.reset}
          ocrValue={plateText}
          onOcrChange={setPlateText}
          ocrLabel={t("booking.capture.plateOcrLabel")}
          ocrHint={t("booking.capture.plateOcrHint")}
          ocrPlaceholder={t("booking.capture.platePlaceholder")}
        />

        {/* Slot photo + OCR */}
        <PhotoUploadField
          id="slot-photo"
          kind="slot"
          label={t("booking.capture.slotPhotoLabel")}
          hint={t("booking.capture.slotPhotoGuideline")}
          state={slotUpload}
          onSelect={(file, kind) => slotUpload.uploadPhoto({ file, kind })}
          onRetry={slotUpload.reset}
          ocrValue={slotText}
          onOcrChange={setSlotText}
          ocrLabel={t("booking.capture.slotOcrLabel")}
          ocrHint={t("booking.capture.slotOcrHint")}
          ocrPlaceholder={t("booking.capture.slotPlaceholder")}
        />

        {/* Location */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm space-y-2">
          <label className="text-sm font-bold text-foreground">
            {t("booking.capture.locationLabel")}
          </label>
          <Select disabled value={siteName ?? undefined}>
            <SelectTrigger className="h-10 w-full rounded-lg border-border bg-[#eff8fe]">
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

        {/* Phone */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm space-y-2">
          <label htmlFor="phone" className="text-sm font-bold text-foreground">
            {t("booking.capture.phoneLabel")}
          </label>
          {profilePhone && (
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                id="use-profile-phone"
                checked={useProfilePhone}
                onChange={(e) => {
                  setUseProfilePhone(e.target.checked);
                  if (!e.target.checked) setPhone("");
                }}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              <span className="text-sm text-muted-foreground">
                {t("booking.capture.useProfilePhone", { phone: profilePhone })}
              </span>
            </label>
          )}
          <Input
            id="phone"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={useProfilePhone ? (profilePhone ?? "") : phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            placeholder={t("booking.capture.phonePlaceholder")}
            className="h-10 rounded-lg border-border bg-[#eff8fe]"
            readOnly={useProfilePhone}
          />
          {loyaltyEnabled && (
            <p className="text-xs text-muted-foreground">
              Nomor HP akan digunakan untuk program loyalti Park N Shine
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {t("booking.capture.phoneHelper")}
          </p>
        </div>

        {/* Continue */}
        <Button
          size="lg"
          className="w-full"
          disabled={!canContinue}
          suffix={<ArrowRight className="h-4 w-4" />}
          onClick={handleContinue}
        >
          {t("action.next", { ns: "common" })}
        </Button>
      </div>
    </AppShell>
  );
}
