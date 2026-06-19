"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OfflineBanner } from "@/components/shared";
import { PhotoUploadField } from "@/features/customer/components/photo-upload-field";
import { usePhotoUpload } from "@/features/customer/hooks/use-photo-upload";
import crewApi from "@/lib/axios-crew";
import type { MediaKind } from "@/types/media";
import { useTranslation } from "@/i18n";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

interface AngleConfig {
  kind: MediaKind;
  label: string;
  id: string;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function BeforePhotosPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const { t } = useTranslation("crew");

  const ANGLES: AngleConfig[] = [
    {
      kind: "before_front" as const,
      label: t("job.photoKind.before_front"),
      id: "photo-before-front",
    },
    {
      kind: "before_back" as const,
      label: t("job.photoKind.before_back"),
      id: "photo-before-back",
    },
    {
      kind: "before_left" as const,
      label: t("job.photoKind.before_left"),
      id: "photo-before-left",
    },
    {
      kind: "before_right" as const,
      label: t("job.photoKind.before_right"),
      id: "photo-before-right",
    },
  ];

  const uploadLabels = {
    retry: t("beforePhotos.uploadLabels.retry"),
    upload: t("beforePhotos.uploadLabels.upload"),
    uploading: t("beforePhotos.uploadLabels.uploading"),
    retrying: t("beforePhotos.uploadLabels.retrying"),
  };

  const uploadUrl = `/v1/crew/jobs/${jobId}/media`;

  const frontUpload = usePhotoUpload({ uploadUrl, apiClient: crewApi });
  const backUpload = usePhotoUpload({ uploadUrl, apiClient: crewApi });
  const leftUpload = usePhotoUpload({ uploadUrl, apiClient: crewApi });
  const rightUpload = usePhotoUpload({ uploadUrl, apiClient: crewApi });

  const uploadMap: Record<string, ReturnType<typeof usePhotoUpload>> = {
    before_front: frontUpload,
    before_back: backUpload,
    before_left: leftUpload,
    before_right: rightUpload,
  };

  const uploads = [frontUpload, backUpload, leftUpload, rightUpload];
  const allDone = uploads.every((u) => u.status === "success");
  const doneCount = uploads.filter((u) => u.status === "success").length;
  const isOfflinePaused = uploads.some((u) => u.isOfflinePaused);

  return (
    <>
      {/* Scrollable body — leave room for sticky CTA (~88px) */}
      <main className='mx-auto max-w-md px-4 pb-28 pt-4'>
        <OfflineBanner visible={isOfflinePaused} />

        {/* Page header */}
        <h1 className='text-lg font-semibold text-foreground'>
          {t("beforePhotos.title")}
        </h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          {t("beforePhotos.subtitle")}
        </p>

        {/* Photo tips */}
        <div className='mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800'>
          <p className='font-semibold'>{t("beforePhotos.guidelineTitle")}</p>
          <ul className='mt-1.5 space-y-1 pl-3'>
            {(
              [
                "guidelineTip1",
                "guidelineTip2",
                "guidelineTip3",
                "guidelineTip4",
              ] as const
            ).map((key) => (
              <li key={key} className='flex gap-1.5'>
                <span className='shrink-0'>•</span>
                <span>{t(`beforePhotos.${key}`)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Photo list */}
        <div className='mt-5 flex flex-col gap-3'>
          {ANGLES.map((angle) => {
            const upload = uploadMap[angle.kind];
            return (
              <PhotoUploadField
                key={angle.kind}
                id={angle.id}
                label={angle.label}
                kind={angle.kind}
                state={upload}
                labels={uploadLabels}
                onSelect={(file, kind) => {
                  upload.uploadPhoto({ file, kind });
                }}
                onRetry={
                  upload.status === "failed" || upload.status === "success"
                    ? () => upload.reset()
                    : undefined
                }
              />
            );
          })}
        </div>
      </main>

      {/* Sticky CTA */}
      <div className='fixed bottom-5 left-0 right-0 z-30 border-t border-border bg-background px-4 pb-[env(safe-area-inset-bottom,16px)] pt-3'>
        <div className='mx-auto max-w-md'>
          <Button
            size='lg'
            variant='default'
            className='h-14 w-full rounded-xl text-base font-bold'
            disabled={!allDone}
            onClick={() => router.replace(`/crew/jobs/${jobId}/wash`)}
            suffix={<ArrowRight className='h-5 w-5' />}
            aria-label={
              allDone
                ? t("beforePhotos.continueAriaLabel")
                : t("beforePhotos.countAriaLabel", { done: doneCount })
            }
          >
            {allDone
              ? t("beforePhotos.continueButton")
              : t("beforePhotos.photoCount", { done: doneCount })}
          </Button>
        </div>
      </div>
    </>
  );
}

export default BeforePhotosPage;
