"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhotoUploadField } from "@/features/customer/components/photo-upload-field";
import { usePhotoUpload } from "@/features/customer/hooks/use-photo-upload";
import type { MediaKind } from "@/types/media";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

interface AngleConfig {
  kind: MediaKind;
  label: string;
  id: string;
}

const ANGLES: AngleConfig[] = [
  { kind: "front", label: "Depan",    id: "photo-front" },
  { kind: "back",  label: "Belakang", id: "photo-back"  },
  { kind: "left",  label: "Kiri",     id: "photo-left"  },
  { kind: "right", label: "Kanan",    id: "photo-right" },
];

const UPLOAD_LABELS = {
  retry:     "Coba lagi",
  upload:    "Ambil Foto",
  uploading: "Mengunggah…",
  retrying:  "Mencoba ulang…",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function BeforePhotosPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();

  const uploadUrl = `/v1/crew/jobs/${jobId}/media`;

  const frontUpload = usePhotoUpload({ uploadUrl });
  const backUpload  = usePhotoUpload({ uploadUrl });
  const leftUpload  = usePhotoUpload({ uploadUrl });
  const rightUpload = usePhotoUpload({ uploadUrl });

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
          Foto Kondisi Kendaraan
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ambil 4 foto sebelum mulai cuci.
        </p>

        {/* 2×2 photo grid */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {ANGLES.map((angle) => {
            const upload = uploadMap[angle.kind];
            return (
              <PhotoUploadField
                key={angle.kind}
                id={angle.id}
                label={angle.label}
                kind={angle.kind}
                state={upload}
                labels={UPLOAD_LABELS}
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
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background px-4 pb-[env(safe-area-inset-bottom,16px)] pt-3">
        <div className="mx-auto max-w-md">
          <Button
            size="lg"
            variant="default"
            className="h-14 w-full rounded-xl text-base font-bold"
            disabled={!allDone}
            onClick={() => router.replace(`/crew/jobs/${jobId}/checklist`)}
            suffix={<ArrowRight className="h-5 w-5" />}
            aria-label={allDone ? "Lanjut ke checklist" : `${doneCount} dari 4 foto diambil`}
          >
            {allDone ? "Lanjut" : `${doneCount}/4 Foto Diambil`}
          </Button>
        </div>
      </div>
    </>
  );
}

export default BeforePhotosPage;
