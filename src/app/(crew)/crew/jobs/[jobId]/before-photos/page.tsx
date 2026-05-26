"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    { kind: "front" as const, label: t("job.photoKind.front"), id: "photo-front" },
    { kind: "back"  as const, label: t("job.photoKind.back"),  id: "photo-back"  },
    { kind: "left"  as const, label: t("job.photoKind.left"),  id: "photo-left"  },
    { kind: "right" as const, label: t("job.photoKind.right"), id: "photo-right" },
  ];

  const uploadLabels = {
    retry:     t("beforePhotos.uploadLabels.retry"),
    upload:    t("beforePhotos.uploadLabels.upload"),
    uploading: t("beforePhotos.uploadLabels.uploading"),
    retrying:  t("beforePhotos.uploadLabels.retrying"),
  };

  const uploadUrl = `/v1/crew/jobs/${jobId}/media`;

  const frontUpload = usePhotoUpload({ uploadUrl, apiClient: crewApi });
  const backUpload  = usePhotoUpload({ uploadUrl, apiClient: crewApi });
  const leftUpload  = usePhotoUpload({ uploadUrl, apiClient: crewApi });
  const rightUpload = usePhotoUpload({ uploadUrl, apiClient: crewApi });

  const uploadMap: Record<string, ReturnType<typeof usePhotoUpload>> = {
    front: frontUpload,
    back:  backUpload,
    left:  leftUpload,
    right: rightUpload,
  };

  const uploads = [frontUpload, backUpload, leftUpload, rightUpload];
  const allDone = uploads.every((u) => u.status === "success");
  const doneCount = uploads.filter((u) => u.status === "success").length;

  return (
    <>
      {/* Scrollable body — leave room for sticky CTA (~88px) */}
      <main className="mx-auto max-w-md px-4 pb-28 pt-4">

        {/* Page header */}
        <h1 className="text-lg font-semibold text-foreground">
          {t("beforePhotos.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("beforePhotos.subtitle")}
        </p>

        {/* Photo list */}
        <div className="mt-5 flex flex-col gap-3">
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
                  void upload.uploadPhoto({ file, kind });
                }}
                onRetry={
                  upload.status === "failed"
                    ? () => upload.reset()
                    : undefined
                }
              />
            );
          })}
        </div>
      </main>

      {/* Sticky CTA */}
      <div className="fixed bottom-5 left-0 right-0 z-30 border-t border-border bg-background px-4 pb-[env(safe-area-inset-bottom,16px)] pt-3">
        <div className="mx-auto max-w-md">
          <Button
            size="lg"
            variant="default"
            className="h-14 w-full rounded-xl text-base font-bold"
            disabled={!allDone}
            onClick={() => router.replace(`/crew/jobs/${jobId}/checklist`)}
            suffix={<ArrowRight className="h-5 w-5" />}
            aria-label={allDone ? t("beforePhotos.continueAriaLabel") : t("beforePhotos.countAriaLabel", { done: doneCount })}
          >
            {allDone ? t("beforePhotos.continueButton") : t("beforePhotos.photoCount", { done: doneCount })}
          </Button>
        </div>
      </div>
    </>
  );
}

export default BeforePhotosPage;
