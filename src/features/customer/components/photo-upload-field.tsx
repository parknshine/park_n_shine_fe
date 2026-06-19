"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CheckCircle,
  Download,
  Grid3X3,
  ImageIcon,
  Pencil,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/shared";
import { useTranslation } from "@/i18n";
import type { UploadState } from "@/features/customer/types";
import type { MediaKind } from "@/types/media";

interface PhotoUploadFieldProps {
  id: string;
  label: string;
  hint?: string;
  kind: MediaKind;
  state: UploadState;
  onSelect: (file: File, kind: MediaKind) => void;
  onRetry?: () => void;
  labels?: {
    retry?: string;
    upload?: string;
    uploading?: string;
    retrying?: string;
    gallery?: string;
    retake?: string;
    detected?: string;
  };
  /** OCR result value — when provided, an editable field is shown below the photo on success */
  ocrValue?: string;
  onOcrChange?: (value: string) => void;
  ocrLabel?: string;
  ocrHint?: string;
  ocrPlaceholder?: string;
  /** When true, shows a download button after a successful upload. */
  showDownload?: boolean;
}

export function PhotoUploadField({
  id,
  label,
  hint,
  kind,
  state,
  onSelect,
  onRetry,
  labels,
  ocrValue,
  onOcrChange,
  ocrLabel,
  ocrHint,
  ocrPlaceholder,
  showDownload,
}: Readonly<PhotoUploadFieldProps>) {
  const { t } = useTranslation("customer");
  const defaults = {
    retry: t("upload.retry"),
    upload: t("upload.select"),
    uploading: t("upload.uploading"),
    retrying: t("upload.retrying"),
    gallery: t("upload.gallery"),
    retake: t("upload.retake"),
    detected: "Terbaca",
  };
  const L = labels ? { ...defaults, ...labels } : defaults;

  const isBusy = state.status === "uploading" || state.status === "retrying";
  const hasPhoto = !!state.status && state.status !== "idle";

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const prevUrlRef = useRef<string | null>(null);
  let displayUrl: string | null = null;
  if (state.status !== "idle") {
    displayUrl = state.status === "success"
      ? (state.media?.url ?? previewUrl ?? null)
      : (previewUrl ?? state.media?.url ?? null);
  }

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
  if (state.status === "uploading") uploadingLabel = L.uploading ?? null;
  else if (state.status === "retrying") uploadingLabel = L.retrying ?? null;

  const showOcr =
    state.status === "success" && ocrValue !== undefined && onOcrChange;

  function handleDownload() {
    const url = state.media?.url;
    if (!url) return;
    const filename = `park-n-shine_${kind}.jpg`;
    const proxyUrl = `/api/crew/photo-download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
    const a = document.createElement("a");
    a.href = proxyUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className='rounded-2xl border border-border bg-white p-4 shadow-sm space-y-3'>
      {/* ── Card header ────────────────────────────── */}
      <div className='flex items-center gap-2.5'>
        <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary'>
          {kind === "plate" ? (
            <Camera className='h-4 w-4 text-white' />
          ) : (
            <Grid3X3 className='h-4 w-4 text-white' />
          )}
        </div>
        <span className='text-sm font-bold text-foreground'>{label}</span>
      </div>

      {hint && (
        <p className='text-xs leading-relaxed text-muted-foreground'>{hint}</p>
      )}

      {/* ── Hidden file inputs ──────────────────── */}
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
        type='file'
        accept='image/*'
        className='sr-only'
        disabled={isBusy}
        onChange={handleFileChange}
      />

      {/* ── Empty state ─────────────────────────── */}
      {!hasPhoto && (
        <div className='flex gap-2'>
          <Button
            asChild
            size='sm'
            variant='outline'
            className='flex-1 rounded-full'
          >
            <label htmlFor={`${id}-camera`} className='cursor-pointer gap-1.5'>
              <Camera className='h-4 w-4 shrink-0' />
              {L.upload}
            </label>
          </Button>
          <Button
            asChild
            size='sm'
            variant='outline'
            className='flex-1 rounded-full'
          >
            <label htmlFor={`${id}-gallery`} className='cursor-pointer gap-1.5'>
              <ImageIcon className='h-4 w-4 shrink-0' />
              {L.gallery}
            </label>
          </Button>
        </div>
      )}

      {/* ── Photo preview ───────────────────────── */}
      {displayUrl && (
        <div className='relative overflow-hidden rounded-xl bg-[#111]'>
          <img
            src={displayUrl}
            alt={label}
            className='h-48 w-full object-cover'
          />

          {/* Corner bracket decorations */}
          <div className='pointer-events-none absolute inset-0'>
            <span className='absolute left-2.5 top-2.5 h-5 w-5 rounded-tl border-l-2 border-t-2 border-white/60' />
            <span className='absolute right-2.5 top-2.5 h-5 w-5 rounded-tr border-r-2 border-t-2 border-white/60' />
            <span className='absolute bottom-2.5 left-2.5 h-5 w-5 rounded-bl border-b-2 border-l-2 border-white/60' />
            <span className='absolute bottom-2.5 right-2.5 h-5 w-5 rounded-br border-b-2 border-r-2 border-white/60' />
          </div>

          {/* Uploading overlay */}
          {isBusy && (
            <>
              <div className='absolute inset-0 bg-black/20' />
              <div className='scan-line absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_3px_var(--primary)]' />
              {uploadingLabel && (
                <span className='absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white'>
                  {uploadingLabel}
                </span>
              )}
            </>
          )}

          {/* Retake button */}
          {!isBusy && onRetry && (
            <button
              type='button'
              onClick={onRetry}
              className='absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/75'
            >
              <RotateCw className='h-3 w-3' />
              {L.retake}
            </button>
          )}

          {/* Success badge */}
          {state.status === "success" && (
            <div className='absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full bg-green-500 px-2.5 py-1.5 text-xs font-bold text-white shadow-sm'>
              <CheckCircle className='h-3 w-3' />
            </div>
          )}
        </div>
      )}

      {/* Download button */}
      {showDownload && state.status === "success" && state.media?.url && (
        <Button
          size="sm"
          variant="outline"
          className="w-full rounded-full"
          onClick={handleDownload}
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      )}

      {/* Progress bar */}
      {isBusy && <ProgressBar value={state.progress} label={state.status} />}

      {/* Error */}
      {state.error && (
        <div className='flex items-center justify-between gap-3 text-sm text-destructive'>
          <span>{state.error}</span>
          {onRetry && (
            <Button
              size='sm'
              variant='ghost'
              prefix={<RotateCcw className='h-4 w-4' />}
              onClick={onRetry}
            >
              {L.retry}
            </Button>
          )}
        </div>
      )}

      {/* ── Integrated OCR edit field ────────────── */}
      {showOcr && (
        <div className='space-y-1 border-t border-border pt-3'>
          <p className='text-sm font-semibold text-foreground'>{ocrLabel}</p>
          {ocrHint && (
            <p className='text-xs text-muted-foreground'>{ocrHint}</p>
          )}
          <div className='relative mt-1'>
            <input
              value={ocrValue}
              onChange={(e) => onOcrChange(e.target.value)}
              placeholder={ocrPlaceholder}
              className='h-10 w-full rounded-lg border border-border bg-[#eff8fe] px-4 pr-10 font-mono text-sm font-bold uppercase tracking-widest text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20'
            />
            <Pencil className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          </div>
        </div>
      )}
    </div>
  );
}
