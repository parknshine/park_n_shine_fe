"use client";

import { Camera, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/shared";
import type { UploadState } from "@/features/customer/types";
import type { MediaKind } from "@/types/media";

interface PhotoUploadFieldProps {
  id: string;
  label: string;
  kind: MediaKind;
  state: UploadState;
  onSelect: (file: File, kind: MediaKind) => void;
  onRetry?: () => void;
  labels?: {
    retry: string;
    upload: string;
    uploading: string;
    retrying: string;
  };
}

export function PhotoUploadField({
  id,
  label,
  kind,
  state,
  onSelect,
  onRetry,
  labels = {
    retry: "customer.upload.retry",
    upload: "customer.upload.select",
    uploading: "customer.upload.uploading",
    retrying: "customer.upload.retrying",
  },
}: PhotoUploadFieldProps) {
  const isBusy = state.status === "uploading" || state.status === "retrying";
  const actionLabel =
    state.status === "uploading"
      ? labels.uploading
      : state.status === "retrying"
        ? labels.retrying
        : labels.upload;

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-foreground">
          {label}
        </label>
        <Button asChild size="sm" variant="outline">
          <label htmlFor={id} className="inline-flex items-center gap-1.5">
            <Camera className="h-4 w-4 shrink-0" />
            {actionLabel}
          </label>
        </Button>
      </div>

      <input
        id={id}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        disabled={isBusy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onSelect(file, kind);
          }
        }}
      />

      {state.status !== "idle" && (
        <ProgressBar
          value={state.progress}
          label={state.status}
          className="mt-4"
        />
      )}

      {state.media?.ocrText && (
        <p className="mt-3 text-sm text-muted-foreground">
          {state.media.ocrText}
        </p>
      )}

      {state.error && (
        <div className="mt-3 flex items-center justify-between gap-3 text-sm text-destructive">
          <span>{state.error}</span>
          {onRetry && (
            <Button
              size="sm"
              variant="ghost"
              prefix={<RotateCcw className="h-4 w-4" />}
              onClick={onRetry}
            >
              {labels.retry}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
