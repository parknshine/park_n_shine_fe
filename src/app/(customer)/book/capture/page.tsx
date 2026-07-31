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
import { PhotoGuidelinesPanel } from "@/features/customer/components/photo-guidelines-panel";
import { StepProgressBar } from "@/features/customer/components/step-progress-bar";
import { usePhotoUpload, usePublicSettings, usePublicSites } from "@/features/customer/hooks";
import { useSessionGuard } from "@/features/customer/hooks/use-session-guard";
import { SessionInvalidModal } from "@/features/customer/components/session-invalid-modal";
import { getDialCodeOptions, isValidPhone, normalizePhone } from "@/features/customer/utils/phone";
import type { CustomerBooking } from "@/features/customer/types";
import { useTranslation } from "@/i18n";
import { useUIStore } from "@/store/ui-store";
import { useBookingCaptureStore } from "@/store/booking-capture-store";
import { useCustomerAuthStore } from "@/store/customer-auth-store";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";

export default function WalkInCapturePage() {
  return (
    <Suspense>
      <WalkInCaptureContent />
    </Suspense>
  );
}

const WALKIN_FLOW_KEY = "walkin";

const DIAL_CODE_OPTIONS = getDialCodeOptions();

function isSitePastCutoff(cutoffTime: string | null): boolean {
  if (!cutoffTime) return false;
  const now = new Date();
  const [h, m] = cutoffTime.split(":").map(Number);
  const cutoff = new Date(now);
  cutoff.setHours(h, m, 0, 0);
  return now > cutoff;
}

function WalkInCaptureContent() {
  const router = useRouter();
  const { t } = useTranslation("customer");
  const locale = useUIStore((s) => s.locale);

  const searchParams = useSearchParams();
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const loc = searchParams.get("loc");
  const siteIdParam = searchParams.get("siteId");

  const { sites: unsortedSites, isLoading: isSitesLoading } = usePublicSites();
  const sites = [...unsortedSites].sort((a, b) => {
    const aUnavailable = a.intakePaused || isSitePastCutoff(a.cutoffTime);
    const bUnavailable = b.intakePaused || isSitePastCutoff(b.cutoffTime);
    return aUnavailable === bUnavailable ? 0 : aUnavailable ? 1 : -1;
  });
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
  const [countryCode, setCountryCode] = useState("ID");
  const selectedDialOption = DIAL_CODE_OPTIONS.find((d) => d.countryCode === countryCode);
  const dialCode = selectedDialOption?.dialCode ?? "+62";
  const [useProfilePhone, setUseProfilePhone] = useState(
    !savedSession && !!profilePhone,
  );

  const hasCreatedRef = useRef(false);
  const { sessionInvalid, ensureValidSession } = useSessionGuard();

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
      ensureValidSession().then((valid) => {
        if (valid) createMutation.mutate();
      });
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

  let effectivePhone = "";
  if (useProfilePhone) {
    effectivePhone = profilePhone ?? "";
  } else if (phone) {
    effectivePhone = `${dialCode}${phone}`;
  }

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
    const phoneForSave = useProfilePhone
      ? normalizePhone(profilePhone ?? "")
      : normalizePhone(`${dialCode}${phone}`);
    saveCapture({
      flowKey: WALKIN_FLOW_KEY,
      bookingId,
      signedToken,
      plateText: plate,
      slotText: slot,
      location,
      phone: phoneForSave,
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
      phone: phoneForSave,
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
      <>
        <SessionInvalidModal open={sessionInvalid} />
        <AppShell surface="customer">
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground" suppressHydrationWarning>
              {t("state.preparing", { ns: "common" })}
            </p>
          </div>
        </AppShell>
      </>
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
          ocrHint={t("booking.capture.plateOcrHint")}
          ocrPlaceholder={t("booking.capture.platePlaceholder")}
          guidelines={
            <PhotoGuidelinesPanel
              goodSrc="/images/guidelines/plate-good.webp"
              avoidExamples={[
                { src: "/images/guidelines/plate-good.webp", label: t("booking.capture.guidelines.avoidBlurry"), blur: true },
                { src: "/images/guidelines/plate-angled.webp", label: t("booking.capture.guidelines.avoidAngled") },
                { src: "/images/guidelines/plate-dark.webp", label: t("booking.capture.guidelines.avoidDark") },
              ]}
              checklistItems={[
                t("booking.capture.guidelines.plateChecklist_0"),
                t("booking.capture.guidelines.plateChecklist_1"),
                t("booking.capture.guidelines.plateChecklist_2"),
                t("booking.capture.guidelines.plateChecklist_3"),
              ]}
            />
          }
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
          guidelines={
            <PhotoGuidelinesPanel
              goodSrc="/images/guidelines/slot-good.webp"
              avoidExamples={[
                { src: "/images/guidelines/slot-good.webp", label: t("booking.capture.guidelines.avoidBlurry"), blur: true },
                { src: "/images/guidelines/slot-angled.webp", label: t("booking.capture.guidelines.avoidAngled") },
                { src: "/images/guidelines/slot-dark.webp", label: t("booking.capture.guidelines.avoidDark") },
              ]}
              checklistItems={[
                t("booking.capture.guidelines.slotChecklist_0"),
                t("booking.capture.guidelines.slotChecklist_1"),
                t("booking.capture.guidelines.slotChecklist_2"),
                t("booking.capture.guidelines.slotChecklist_3"),
              ]}
            />
          }
        />

        {/* Location — selectable (no QR) */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm space-y-2">
          <label className="text-sm font-bold text-foreground">
            {t("booking.capture.locationLabel")}
          </label>
          <Combobox
            options={sites.map((site) => {
              const unavailable = site.intakePaused || isSitePastCutoff(site.cutoffTime);
              const statusSuffix = site.intakePaused
                ? " (Sedang tutup)"
                : isSitePastCutoff(site.cutoffTime)
                  ? " (Sudah cutoff)"
                  : "";
              return { value: site.id, label: `${site.name}${statusSuffix}`, disabled: unavailable };
            })}
            value={location}
            onChange={setLocation}
            disabled={isSitesLoading}
            placeholder={
              isSitesLoading
                ? t("booking.capture.locationLoading")
                : t("booking.capture.locationPlaceholder")
            }
            searchPlaceholder={t("booking.capture.locationSearchPlaceholder", {
              defaultValue: "Cari mall…",
            })}
            emptyMessage={t("booking.capture.locationSearchEmpty", {
              defaultValue: "Mall tidak ditemukan.",
            })}
            className="h-10 w-full rounded-lg border-border bg-[#eff8fe]"
          />
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
          <div className="flex h-10 overflow-hidden rounded-lg border border-border bg-[#eff8fe]">
            <Select
              value={countryCode}
              onValueChange={setCountryCode}
              disabled={useProfilePhone}
            >
              <SelectTrigger className="h-full w-24 rounded-none border-0 border-r border-border bg-transparent px-2 shadow-none focus:ring-0">
                <span className="text-sm font-medium text-foreground">
                  {selectedDialOption?.flag} {dialCode}
                </span>
              </SelectTrigger>
              <SelectContent className="w-64">
                <SelectGroup>
                  <SelectLabel>Pilihan Utama</SelectLabel>
                  {DIAL_CODE_OPTIONS.filter((d) => d.isPriority).map((d) => (
                    <SelectItem key={d.countryCode} value={d.countryCode}>
                      {d.flag} {d.dialCode} — {d.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Semua Negara</SelectLabel>
                  {DIAL_CODE_OPTIONS.filter((d) => !d.isPriority).map((d) => (
                    <SelectItem key={d.countryCode} value={d.countryCode}>
                      {d.flag} {d.dialCode} — {d.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <input
              id="phone"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={useProfilePhone ? (profilePhone ?? "") : phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder={t("booking.capture.phonePlaceholder")}
              className="h-full flex-1 bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
              readOnly={useProfilePhone}
            />
          </div>
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
          className="w-full rounded-full border-0 bg-linear-to-b from-[#1db1f1] to-[#006289] font-extrabold text-[#eff8fe] shadow-[0_24px_30px_rgba(29,177,241,0.16)] hover:opacity-90"
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
