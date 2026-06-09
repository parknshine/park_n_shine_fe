"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle, ImageIcon, RotateCcw, Trash2 } from "lucide-react";
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
    gallery?: string;
    retake?: string;
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
}: Readonly<PhotoUploadFieldProps>) {
  const { t } = useTranslation("customer");
  const defaults = {
    retry: t("upload.retry"),
    upload: t("upload.select"),
    uploading: t("upload.uploading"),
    retrying: t("upload.retrying"),
    gallery: t("upload.gallery"),
    retake: t("upload.retake"),
  };
  const resolvedLabels = labels ? { ...defaults, ...labels } : defaults;
  const isBusy = state.status === "uploading" || state.status === "retrying";
  const hasPhoto = !!state.status && state.status !== "idle";

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const prevUrlRef = useRef<string | null>(null);

  // Derive display URL — hide preview when status resets to idle without calling setState
  const displayUrl = state.status === "idle" ? null : previewUrl;

  // Only revoke the object URL on idle — no setState needed
  useEffect(() => {
    if (state.status === "idle" && prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = null;
    }
  }, [state.status]);

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
    event.target.value = "";
  }

  let uploadingLabel: string | null = null;
  if (state.status === "uploading") uploadingLabel = resolvedLabels.uploading;
  else if (state.status === "retrying") uploadingLabel = resolvedLabels.retrying;

  return (
    <div className="rounded-lg border border-border p-4 space-y-3 bg-card shadow-sm">
      <label className="text-sm font-semibold text-foreground">{label}</label>

      {/* Hidden inputs */}
      <input
        id={`${id}-camera`}
        type='file'
        accept='image/*'
        capture='environment'
        className='sr-only'
        disabled={isBusy}
        onChange={handleFileChange}
      />
      <input
        id={`${id}-gallery`}
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={isBusy}
        onChange={handleFileChange}
      />

      {/* Empty state — show two pick options */}
      {!hasPhoto && (
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline" className="flex-1">
            <label htmlFor={`${id}-camera`} className="cursor-pointer gap-1.5">
              <Camera className="h-4 w-4 shrink-0" />
              {resolvedLabels.upload}
            </label>
          </Button>
          <Button asChild size="sm" variant="outline" className="flex-1">
            <label htmlFor={`${id}-gallery`} className="cursor-pointer gap-1.5">
              <ImageIcon className="h-4 w-4 shrink-0" />
              {resolvedLabels.gallery}
            </label>
          </Button>
        </div>
      )}

      {/* Preview */}
      {displayUrl && (
        <div className="relative overflow-hidden rounded-md">
          <img src={displayUrl} alt={label} className="h-44 w-full object-cover" />

          {/* Uploading overlay */}
          {isBusy && (
            <>
              <div className="absolute inset-0 bg-black/20" />
              <div className="scan-line absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_3px_var(--primary)]" />
              {uploadingLabel && (
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
                  {uploadingLabel}
                </span>
              )}
            </>
          )}

          {/* Success badge */}
          {state.status === "success" && (
            <div className='absolute right-2 bottom-2 rounded-full bg-green-500 p-1 shadow-sm'>
              <CheckCircle className='h-4 w-4 text-white' />
            </div>
          )}

          {/* Delete / redo button — visible when not busy */}
          {!isBusy && onRetry && (
             <button
               type="button"
               onClick={onRetry}
               className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:bg-black/80"
             >
               <Trash2 className="h-3.5 w-3.5" />
               {resolvedLabels.retake}
             </button>
          )}
        </div>
      )}

      {/* Progress bar */}
      {isBusy && (
        <ProgressBar value={state.progress} label={state.status} />
      )}

      {/* Error */}
      {state.error && (
        <div className="flex items-center justify-between gap-3 text-sm text-destructive">
          <span>{state.error}</span>
          {onRetry && (
            <Button
              size='sm'
              variant='ghost'
              prefix={<RotateCcw className='h-4 w-4' />}
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
