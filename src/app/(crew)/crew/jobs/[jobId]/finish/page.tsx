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
import { useTranslation } from "@/i18n";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function FinishPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const { t } = useTranslation("crew");

  const uploadUrl = `/v1/crew/jobs/${jobId}/media`;
  const afterUpload = usePhotoUpload({ uploadUrl, apiClient: crewApi });
  const { complete, isLoading } = useCompleteJob(jobId);

  const photoUploaded = afterUpload.status === "success";
  const canFinish = photoUploaded && !isLoading;

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
      {/* Scrollable body — leave room for sticky CTA (~88px) */}
      <main className="mx-auto max-w-md px-4 pb-28 pt-4">

        <OfflineBanner visible={afterUpload.isOfflinePaused} />

        {/* Page header */}
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

        {/* After photo upload */}
        <PhotoUploadField
          id="after-photo"
          kind="after"
          label={t("finish.afterPhotoLabel")}
          state={afterUpload}
          labels={uploadLabels}
          onSelect={(file, kind) => {
            void afterUpload.uploadPhoto({ file, kind });
          }}
          onRetry={
            afterUpload.status === "failed"
              ? () => afterUpload.reset()
              : undefined
          }
        />
      </main>

      {/* Sticky CTA */}
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
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                {t("finish.completing")}
              </>
            ) : (
              t("finish.completeButton")
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

export default FinishPage;
