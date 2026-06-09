"use client";

import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { OfflineBanner } from "@/components/shared";
import { PhotoUploadField } from "@/features/customer/components/photo-upload-field";
import { usePhotoUpload } from "@/features/customer/hooks/use-photo-upload";
import { useCompleteJob } from "@/features/crew/hooks";
import crewApi from "@/lib/axios-crew";
import type { MediaKind } from "@/types/media";
import { useTranslation } from "@/i18n";

interface AngleConfig {
  kind: MediaKind;
  label: string;
  id: string;
}

export function FinishPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const { t } = useTranslation("crew");

  const uploadUrl = `/v1/crew/jobs/${jobId}/media`;

  const frontUpload = usePhotoUpload({ uploadUrl, apiClient: crewApi });
  const backUpload  = usePhotoUpload({ uploadUrl, apiClient: crewApi });
  const leftUpload  = usePhotoUpload({ uploadUrl, apiClient: crewApi });
  const rightUpload = usePhotoUpload({ uploadUrl, apiClient: crewApi });

  const uploads = [frontUpload, backUpload, leftUpload, rightUpload];
  const allDone = uploads.every((u) => u.status === "success");
  const doneCount = uploads.filter((u) => u.status === "success").length;
  const isOfflinePaused = uploads.some((u) => u.isOfflinePaused);

  const { complete, isLoading } = useCompleteJob(jobId);
  const canFinish = allDone && !isLoading;

  function buttonLabel() {
    if (isLoading) {
      return (
        <>
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          {t("finish.completing")}
        </>
      );
    }
    if (allDone) {
      return t("finish.continueButton");
    }
    return t("finish.photoCount", { done: doneCount });
  }

  const AFTER_ANGLES: AngleConfig[] = [
    { kind: "after_front", label: t("job.photoKind.after_front"), id: "photo-after-front" },
    { kind: "after_back",  label: t("job.photoKind.after_back"),  id: "photo-after-back"  },
    { kind: "after_left",  label: t("job.photoKind.after_left"),  id: "photo-after-left"  },
    { kind: "after_right", label: t("job.photoKind.after_right"), id: "photo-after-right" },
  ];

  const uploadMap: Record<string, ReturnType<typeof usePhotoUpload>> = {
    after_front: frontUpload,
    after_back:  backUpload,
    after_left:  leftUpload,
    after_right: rightUpload,
  };

  const uploadLabels = {
    retry:     t("finish.uploadLabels.retry"),
    upload:    t("finish.uploadLabels.upload"),
    uploading: t("finish.uploadLabels.uploading"),
    retrying:  t("finish.uploadLabels.retrying"),
  };

  async function handleComplete() {
    try {
      await complete();
      router.replace("/crew/home");
    } catch {
      toast.error(t("finish.error"));
    }
  }

  return (
    <>
      <main className="mx-auto max-w-md px-4 pb-28 pt-4">
        <OfflineBanner visible={isOfflinePaused} />

        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-lg font-bold leading-tight text-foreground">
              {t("finish.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("finish.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {AFTER_ANGLES.map((angle) => {
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

      <div className="fixed bottom-5 left-0 right-0 z-30 border-t border-border bg-background px-4 pb-[env(safe-area-inset-bottom,16px)] pt-3">
        <div className="mx-auto max-w-md">
          <Button
            size="lg"
            variant="default"
            className="h-14 w-full rounded-xl text-base font-bold"
            disabled={!canFinish}
            onClick={handleComplete}
            aria-label={t("finish.completeAriaLabel")}
          >
            {buttonLabel()}
          </Button>
        </div>
      </div>
    </>
  );
}

export default FinishPage;
