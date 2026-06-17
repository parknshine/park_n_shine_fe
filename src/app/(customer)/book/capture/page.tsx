"use client";

export const dynamic = "force-dynamic";

import { startTransition, Suspense, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { AppShell, OfflineBanner } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { PhotoUploadField } from "@/features/customer/components/photo-upload-field";
import { StepProgressBar } from "@/features/customer/components/step-progress-bar";
import { usePhotoUpload, usePublicSettings, usePublicSites } from "@/features/customer/hooks";
import { isValidPhone, normalizePhone } from "@/features/customer/utils/phone";
import type { CustomerBooking } from "@/features/customer/types";
import { useTranslation } from "@/i18n";
import { useUIStore } from "@/store/ui-store";
import { useBookingCaptureStore } from "@/store/booking-capture-store";
import { useCustomerAuthStore } from "@/store/customer-auth-store";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function WalkInCapturePage() {
  return (
    <Suspense>
      <WalkInCaptureContent />
    </Suspense>
  );
}

const WALKIN_FLOW_KEY = "walkin";

function WalkInCaptureContent() {
  const router = useRouter();
  const { t } = useTranslation("customer");
  const locale = useUIStore((s) => s.locale);

  const searchParams = useSearchParams();
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const loc = searchParams.get("loc");
  const siteIdParam = searchParams.get("siteId");

  const { sites, isLoading: isSitesLoading } = usePublicSites();
  const { loyaltyEnabled } = usePublicSettings();

  const { clear: clearCapture, save: saveCapture } = useBookingCaptureStore();
  const setCaptureHasProgress = useBookingCaptureStore((s) => s.setCaptureHasProgress);

  const profilePhone = useCustomerAuthStore((s) => s.customer?.phone ?? null);

  // Read store state once at mount via lazy initializer to avoid ref-during-render error
  const [savedSession] = useState(() => {
    const s = useBookingCaptureStore.getState();
    return s.flowKey === WALKIN_FLOW_KEY && s.bookingId ? s : null;
  });
  const hasSession = !!savedSession;

  const [plateText, setPlateText] = useState(savedSession?.plateText ?? "");
  const [slotText, setSlotText] = useState(savedSession?.slotText ?? "");
  const [location, setLocation] = useState(savedSession?.location ?? siteIdParam ?? "");
  const [phone, setPhone] = useState(savedSession?.phone ?? "");
  const [useProfilePhone, setUseProfilePhone] = useState(
    !savedSession && !!profilePhone,
  );

  const hasCreatedRef = useRef(false);

  const createMutation = useMutation({
    meta: { persist: false },
    mutationFn: async () => {
      const response = await api.post<CustomerBooking>("/v1/bookings", {
        locale: locale === "en" ? "en-US" : "id-ID",
      });
      return response.data;
    },
    mutationKey: ["customer", "booking", "create", "walkin"] as const,
  });

  const bookingId = savedSession?.bookingId ?? createMutation.data?.id ?? null;
  const signedToken = savedSession?.signedToken ?? createMutation.data?.signedToken ?? null;

  useEffect(() => {
    if (hasSession) return; // Restored session — skip creating new booking
    if (!hasCreatedRef.current) {
      hasCreatedRef.current = true;
      createMutation.mutate();
    }
    return () => {
      hasCreatedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear old session when a fresh booking is created
  useEffect(() => {
    if (createMutation.data?.id) clearCapture();
  }, [createMutation.data?.id, clearCapture]);

  const plateUpload = usePhotoUpload({
    bookingId: bookingId ?? "",
    signedToken: signedToken ?? undefined,
    initialState: savedSession?.plateState ?? undefined,
  });
  const slotUpload = usePhotoUpload({
    bookingId: bookingId ?? "",
    signedToken: signedToken ?? undefined,
    initialState: savedSession?.slotState ?? undefined,
  });

  useEffect(() => {
    if (plateUpload.status !== "idle" || slotUpload.status !== "idle") {
      setCaptureHasProgress(true);
    }
  }, [plateUpload.status, slotUpload.status, setCaptureHasProgress]);

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
    !!bookingId &&
    plateUpload.status === "success" &&
    slotUpload.status === "success" &&
    plateText.trim().length > 0 &&
    slotText.trim().length > 0 &&
    location.length > 0 &&
    (effectivePhone === "" || isValidPhone(effectivePhone));

  function handleContinue() {
    if (!bookingId || !signedToken) return;
    const plate = plateText.trim().toUpperCase();
    const slot = slotText.trim().toUpperCase();
    saveCapture({
      flowKey: WALKIN_FLOW_KEY,
      bookingId,
      signedToken,
      plateText: plate,
      slotText: slot,
      location,
      phone: normalizePhone(effectivePhone),
      plateState: { progress: plateUpload.progress, status: plateUpload.status, error: plateUpload.error, media: plateUpload.media },
      slotState: { progress: slotUpload.progress, status: slotUpload.status, error: slotUpload.error, media: slotUpload.media },
    });
    const selectedSite = sites.find((s) => s.id === location);
    const params = new URLSearchParams({
      bookingId,
      token: signedToken,
      lat: lat ?? "",
      lng: lng ?? "",
      loc: selectedSite?.name ?? loc ?? "",
      addr: selectedSite?.address ?? "",
      siteId: selectedSite?.id ?? "",
      phone: normalizePhone(effectivePhone),
      plate,
      slot,
    });
    router.push(`/book/confirm?${params.toString()}`);
  }

  useEffect(() => {
    if (createMutation.isError) toast.error(t("booking.capture.errorCreate"));
  }, [createMutation.isError, t]);

  if (createMutation.isPending || (!bookingId && !createMutation.isError)) {
    return (
      <AppShell surface="customer">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground" suppressHydrationWarning>
            {t("state.preparing", { ns: "common" })}
          </p>
        </div>
      </AppShell>
    );
  }

  if (createMutation.isError) {
    return (
      <AppShell surface="customer">
        <div className="space-y-4 pt-10 text-center">
          <Button
            onClick={() => {
              hasCreatedRef.current = false;
              createMutation.mutate();
            }}
          >
            {t("action.retry", { ns: "common" })}
          </Button>
        </div>
      </AppShell>
    );
  }

  const isOfflinePaused =
    plateUpload.isOfflinePaused || slotUpload.isOfflinePaused;

  return (
    <AppShell surface="customer" className="pt-0! px-0!">
      <StepProgressBar current={1} total={2} label={t("booking.step", { current: 1, total: 2 })} />

      <div className="space-y-4 px-4 pb-6">
        <OfflineBanner visible={isOfflinePaused} />

        <div>
          <h1 className="text-2xl font-bold leading-tight text-foreground">
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
          ocrHint={t("booking.capture.ocrHint")}
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
          ocrHint={t("booking.capture.ocrHint")}
          ocrPlaceholder={t("booking.capture.slotPlaceholder")}
        />

        {/* Location — selectable (no QR) */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm space-y-2">
          <label className="text-sm font-bold text-foreground">
            {t("booking.capture.locationLabel")}
          </label>
          <Select value={location} onValueChange={setLocation} disabled={isSitesLoading}>
            <SelectTrigger className="h-10 w-full rounded-lg border-border bg-[#eff8fe]">
              <SelectValue
                placeholder={
                  isSitesLoading
                    ? t("booking.capture.locationLoading")
                    : t("booking.capture.locationPlaceholder")
                }
              />
            </SelectTrigger>
            <SelectContent>
              {sites.map((site) => (
                <SelectItem key={site.id} value={site.id}>
                  {site.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {t("booking.capture.locationHelper")}
          </p>
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
            value={useProfilePhone ? profilePhone : phone}
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
