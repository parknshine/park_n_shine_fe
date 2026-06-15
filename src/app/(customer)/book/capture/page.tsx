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
import { OcrEditField } from "@/features/customer/components/ocr-edit-field";
import { PhotoUploadField } from "@/features/customer/components/photo-upload-field";
import { usePhotoUpload, usePublicSettings, usePublicSites } from "@/features/customer/hooks";
import { isValidPhone } from "@/features/customer/utils/phone";
import type { CustomerBooking } from "@/features/customer/types";
import { useTranslation } from "@/i18n";
import { useUIStore } from "@/store/ui-store";
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

function WalkInCaptureContent() {
  const router = useRouter();
  const { t } = useTranslation("customer");
  const locale = useUIStore((s) => s.locale);

  const searchParams = useSearchParams();
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const loc = searchParams.get("loc");

  const { sites, isLoading: isSitesLoading } = usePublicSites();
  const { loyaltyEnabled } = usePublicSettings();

  const [plateText, setPlateText] = useState("");
  const [slotText, setSlotText] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");

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

  const bookingId = createMutation.data?.id ?? null;
  const signedToken = createMutation.data?.signedToken ?? null;

  useEffect(() => {
    if (!hasCreatedRef.current) {
      hasCreatedRef.current = true;
      createMutation.mutate();
    }
    return () => {
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
    location.length > 0 &&
    (phone === "" || isValidPhone(phone));

  function handleContinue() {
    if (!bookingId || !signedToken) return;
    const selectedSite = sites.find((s) => s.id === location);
    const params = new URLSearchParams({
      bookingId,
      token: signedToken,
      lat: lat ?? "",
      lng: lng ?? "",
      loc: selectedSite?.name ?? loc ?? "",
      addr: selectedSite?.address ?? "",
      siteId: selectedSite?.id ?? "",
      phone: phone.trim(),
      plate: plateText.trim().toUpperCase(),
      slot: slotText.trim().toUpperCase(),
    });
    router.push(`/book/confirm?${params.toString()}`);
  }

  useEffect(() => {
    if (createMutation.isError) toast.error(t("booking.capture.errorCreate"));
  }, [createMutation.isError, t]);

  if (createMutation.isPending || (!bookingId && !createMutation.isError)) {
    return (
      <AppShell surface='customer'>
        <div className='flex min-h-[60vh] flex-col items-center justify-center gap-3'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
          <p className='text-sm text-muted-foreground' suppressHydrationWarning>
            {t("state.preparing", { ns: "common" })}
          </p>
        </div>
      </AppShell>
    );
  }

  if (createMutation.isError) {
    return (
      <AppShell surface='customer'>
        <div className='space-y-4 pt-10 text-center'>
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
    <AppShell surface='customer'>
      <div className='space-y-5'>
        <OfflineBanner visible={isOfflinePaused} />

        <div className='flex items-start gap-3'>
          {/* <button
            type="button"
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground"
            onClick={() => router.back()}
            aria-label={t("action.back", { ns: "common" })}
          >
            <ArrowLeft className="h-4 w-4" />
          </button> */}

          <div className='min-w-0 flex-1'>
            <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
              {t("booking.step", { current: 1, total: 2 })}
            </p>
            <h1 className='mt-1 text-2xl font-bold leading-tight text-foreground'>
              {t("booking.capture.title")}
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              {t("booking.capture.subtitle")}
            </p>
          </div>
        </div>

        <div className='space-y-3'>
          <PhotoUploadField
            id='plate-photo'
            kind='plate'
            label={t("booking.capture.platePhotoLabel")}
            hint={t("booking.capture.platePhotoGuideline")}
            state={plateUpload}
            onSelect={(file, kind) => plateUpload.uploadPhoto({ file, kind })}
            onRetry={plateUpload.reset}
          />
          {plateUpload.status === "success" && (
            <OcrEditField
              id='plate-text'
              label={t("booking.capture.plateOcrLabel")}
              value={plateText}
              onChange={setPlateText}
              placeholder={t("booking.capture.platePlaceholder")}
            />
          )}

          <PhotoUploadField
            id='slot-photo'
            kind='slot'
            label={t("booking.capture.slotPhotoLabel")}
            hint={t("booking.capture.slotPhotoGuideline")}
            state={slotUpload}
            onSelect={(file, kind) => slotUpload.uploadPhoto({ file, kind })}
            onRetry={slotUpload.reset}
          />
          {slotUpload.status === "success" && (
            <OcrEditField
              id='slot-text'
              label={t("booking.capture.slotOcrLabel")}
              value={slotText}
              onChange={setSlotText}
              placeholder={t("booking.capture.slotPlaceholder")}
            />
          )}

          <div className='space-y-1.5 rounded-lg border border-border bg-card p-4 shadow-sm'>
            <label className='text-sm font-medium text-foreground'>
              {t("booking.capture.locationLabel")}
            </label>
            <Select
              value={location}
              onValueChange={setLocation}
              disabled={isSitesLoading}
            >
              <SelectTrigger className='w-full'>
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
            <p className='text-xs text-muted-foreground'>
              {t("booking.capture.locationHelper")}
            </p>
          </div>

          <div className='space-y-1.5 rounded-lg border border-border bg-card p-4 shadow-sm'>
            <label
              htmlFor='phone'
              className='text-sm font-medium text-foreground'
            >
              {t("booking.capture.phoneLabel")}
            </label>
            <Input
              id='phone'
              type='text'
              inputMode='numeric'
              pattern='[0-9]*'
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder={t("booking.capture.phonePlaceholder")}
              className='w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            />
            {loyaltyEnabled && (
              <p className="text-xs text-muted-foreground mt-1">
                Nomor HP akan digunakan untuk program loyalti Park N Shine
              </p>
            )}
            <p className='text-xs text-muted-foreground'>
              {t("booking.capture.phoneHelper")}
            </p>
          </div>
        </div>

        <div className='pt-1'>
          <Button
            size='lg'
            className='w-full rounded-full'
            disabled={!canContinue}
            suffix={<ArrowRight className='h-4 w-4' />}
            onClick={handleContinue}
          >
            {t("action.next", { ns: "common" })}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
