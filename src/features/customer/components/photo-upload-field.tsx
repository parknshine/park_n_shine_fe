"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/shared";
import { useTranslation } from "@/i18n";
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
  labels,
}: PhotoUploadFieldProps) {
  const { t } = useTranslation("customer");
  const resolvedLabels = labels ?? {
    retry: t("upload.retry"),
    upload: t("upload.select"),
    uploading: t("upload.uploading"),
    retrying: t("upload.retrying"),
  };
  const isBusy = state.status === "uploading" || state.status === "retrying";
  const actionLabel =
    state.status === "uploading"
      ? resolvedLabels.uploading
      : state.status === "retrying"
        ? resolvedLabels.retrying
        : resolvedLabels.upload;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const prevUrlRef = useRef<string | null>(null);

  // Clear preview when upload is reset to idle (e.g. after onRetry)
  useEffect(() => {
    if (state.status === "idle") {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = null;
      }
      setPreviewUrl(null);
    }
  }, [state.status]);

  // Revoke object URL on unmount
  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    };
  }, []);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    const url = URL.createObjectURL(file);
    prevUrlRef.current = url;
    setPreviewUrl(url);
    onSelect(file, kind);
    // Reset value so same file can be re-selected (e.g. retake same photo)
    event.target.value = "";
  }

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-foreground">
          {label}
        </label>
        <Button
          asChild
          size="sm"
          variant={state.status === "success" ? "ghost" : "outline"}
        >
          <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-1.5">
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
        onChange={handleFileChange}
      />

      {previewUrl && (
        <div className="relative mt-3 overflow-hidden rounded-md">
          <img
            src={previewUrl}
            alt={label}
            className="h-44 w-full object-cover"
          />
          {isBusy && (
            <>
              <div className="absolute inset-0 bg-black/20" />
              <div className="scan-line absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_3px_var(--primary)]" />
            </>
          )}
          {state.status === "success" && (
            <div className="absolute right-2 bottom-2 rounded-full bg-green-500 p-1 shadow-sm">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
      )}

      {isBusy && (
        <ProgressBar
          value={state.progress}
          label={state.status}
          className="mt-3"
        />
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
              {resolvedLabels.retry}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
