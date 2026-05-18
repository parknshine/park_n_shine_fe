import { ProgressBar, StatusBadge } from "@/components/shared";
import type { BeforePhotoRequirement } from "@/features/crew/types";

interface BeforePhotoGridProps {
  photos: BeforePhotoRequirement[];
  labels?: {
    complete: string;
    required: string;
  };
}

export function BeforePhotoGrid({
  photos,
  labels = {
    complete: "crew.photos.complete",
    required: "crew.photos.required",
  },
}: BeforePhotoGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {photos.map((photo) => (
        <div key={photo.kind} className="rounded-lg border border-border p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">
              {photo.labelKey}
            </p>
            <StatusBadge tone={photo.isComplete ? "success" : "warning"}>
              {photo.isComplete ? labels.complete : labels.required}
            </StatusBadge>
          </div>
          <ProgressBar value={photo.progress} />
        </div>
      ))}
    </div>
  );
}
