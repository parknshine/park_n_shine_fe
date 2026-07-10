"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { ReportPhotoAsset } from "@/features/admin/types";
import { cn } from "@/lib/utils";
import { ZOOM_STEP, ZOOM_MIN, ZOOM_MAX } from "@/features/admin/utils/reports/jobs-format";

export function PhotoLightboxOverlay({
  photos,
  index,
  onClose,
  onNavigate,
}: {
  photos: ReportPhotoAsset[];
  index: number;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);
  const photo = photos[index];
  const src = photo.url ?? photo.storageKey;

  const zoomIn = useCallback(
    () => setZoom((z) => Math.min(+(z + ZOOM_STEP).toFixed(1), ZOOM_MAX)),
    [],
  );
  const zoomOut = useCallback(
    () => setZoom((z) => Math.max(+(z - ZOOM_STEP).toFixed(1), ZOOM_MIN)),
    [],
  );
  const resetZoom = useCallback(() => setZoom(1), []);

  function navigate(delta: number) {
    setZoom(1);
    onNavigate((index + delta + photos.length) % photos.length);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
      if (e.key === "0") resetZoom();
    }
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [index, onClose, zoomIn, zoomOut, resetZoom]);

  return createPortal(
    <div
      className='fixed inset-0 z-200 flex flex-col'
      style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(6px)" }}
    >
      <div className='flex shrink-0 items-center justify-between px-4 py-3'>
        <span className='font-mono text-xs text-white/50'>
          {index + 1}/{photos.length} — {photo.type.replaceAll("_", " ")}
        </span>
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1'>
            <button
              onClick={zoomOut}
              disabled={zoom <= ZOOM_MIN}
              className='p-0.5 text-white/80 transition-colors hover:text-white disabled:opacity-30'
            >
              <ZoomOut className='h-4 w-4' />
            </button>
            <span className='w-12 text-center font-mono text-xs text-white/80'>
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={zoomIn}
              disabled={zoom >= ZOOM_MAX}
              className='p-0.5 text-white/80 transition-colors hover:text-white disabled:opacity-30'
            >
              <ZoomIn className='h-4 w-4' />
            </button>
            <button
              onClick={resetZoom}
              className='ml-1 p-0.5 text-white/60 transition-colors hover:text-white'
            >
              <RotateCcw className='h-3.5 w-3.5' />
            </button>
          </div>
          <button
            onClick={onClose}
            className='rounded-lg bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white'
          >
            <X className='h-4 w-4' />
          </button>
        </div>
      </div>

      <div
        className='relative flex flex-1 items-center justify-center overflow-hidden'
        onClick={onClose}
      >
        {photos.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(-1);
            }}
            className='absolute left-4 z-10 rounded-full bg-black/40 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white'
          >
            <ChevronLeft className='h-6 w-6' />
          </button>
        )}
        <div
          className='overflow-auto'
          style={{ maxWidth: "90vw", maxHeight: "calc(100vh - 130px)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            ref={imgRef}
            key={src}
            src={src}
            alt={photo.type}
            unoptimized
            width={1200}
            height={800}
            style={{
              width: `${zoom * 100}%`,
              maxWidth: zoom <= 1 ? "100%" : "none",
              height: "auto",
              display: "block",
              transition: "width 0.15s ease",
            }}
            className='rounded-lg shadow-2xl'
          />
        </div>
        {photos.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(1);
            }}
            className='absolute right-4 z-10 rounded-full bg-black/40 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white'
          >
            <ChevronRight className='h-6 w-6' />
          </button>
        )}
      </div>

      {photos.length > 1 && (
        <div className='flex shrink-0 items-center justify-center gap-1.5 py-3'>
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setZoom(1);
                onNavigate(i);
              }}
              className={cn(
                "rounded-full transition-all",
                i === index
                  ? "h-2 w-2 bg-white"
                  : "h-1.5 w-1.5 bg-white/30 hover:bg-white/60",
              )}
            />
          ))}
        </div>
      )}
      <p className='shrink-0 pb-2 text-center text-[10px] text-white/25'>
        ← → navigate · +/- zoom · 0 reset · Esc close
      </p>
    </div>,
    document.body,
  );
}

export function PhotoSection({
  photos,
  label,
  viewable,
  onPhotoClick,
}: {
  photos: ReportPhotoAsset[];
  label: string;
  viewable: ReportPhotoAsset[];
  onPhotoClick: (index: number) => void;
}) {
  if (photos.length === 0) return null;
  return (
    <div className='space-y-2'>
      <p className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground'>
        {label}
      </p>
      <div className='grid grid-cols-4 gap-2'>
        {photos.map((p) => (
          <button
            key={p.storageKey}
            type='button'
            onClick={() => onPhotoClick(viewable.indexOf(p))}
            className='relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-lg border border-border transition-colors hover:border-primary/60'
          >
            <Image
              src={p.url ?? p.storageKey}
              alt={p.type}
              fill
              unoptimized
              className='object-cover transition-opacity hover:opacity-80'
            />
          </button>
        ))}
      </div>
    </div>
  );
}
