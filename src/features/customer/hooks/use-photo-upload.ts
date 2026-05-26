"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { AxiosInstance } from "axios";
import { mutationKeys, queryKeys } from "@/lib/query-keys";
import type { BookingMedia, UploadState } from "@/features/customer/types";
import type { MediaKind } from "@/types/media";

const MAX_IMAGE_BYTES = 500 * 1024;
const DEFAULT_RETRY_DELAYS = [500, 1_000, 2_000];

interface UsePhotoUploadOptions {
  bookingId?: string;
  signedToken?: string;
  retryDelaysMs?: number[];
  /**
   * When provided, POST to this URL directly instead of building from bookingId.
   * Used by crew pages that upload to /v1/crew/jobs/{jobId}/media.
   */
  uploadUrl?: string;
  /** Override the axios instance (e.g. crewApi for crew uploads). Defaults to customer api. */
  apiClient?: AxiosInstance;
}

interface UploadPhotoOptions {
  file: File;
  kind: MediaKind;
}

async function compressImage(file: File): Promise<File> {
  if (file.size <= MAX_IMAGE_BYTES || !file.type.startsWith("image/")) {
    return file;
  }

  const imageUrl = URL.createObjectURL(file);
  const image = new Image();

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("image_decode_failed"));
    image.src = imageUrl;
  });

  const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));

  const context = canvas.getContext("2d");
  if (!context) {
    URL.revokeObjectURL(imageUrl);
    return file;
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(imageUrl);

  let quality = 0.82;
  let blob = await canvasToBlob(canvas, quality);

  while (blob.size > MAX_IMAGE_BYTES && quality > 0.42) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, quality);
  }

  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("image_compression_failed"));
        }
      },
      "image/jpeg",
      quality
    );
  });
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function usePhotoUpload({
  bookingId,
  signedToken,
  retryDelaysMs = DEFAULT_RETRY_DELAYS,
  uploadUrl,
  apiClient,
}: UsePhotoUploadOptions) {
  const httpClient = apiClient ?? api;
  const queryClient = useQueryClient();
  const [state, setState] = useState<UploadState>({
    progress: 0,
    status: "idle",
    error: null,
    media: null,
  });

  const endpoint = uploadUrl ?? `/v1/bookings/${bookingId}/media`;
  const mutKey = bookingId
    ? mutationKeys.customer.media(bookingId)
    : mutationKeys.crew.media(uploadUrl ?? "");

  const mutation = useMutation({
    meta: { persist: false },
    mutationFn: async ({ file, kind }: UploadPhotoOptions) => {
      const compressedFile = await compressImage(file);
      const formData = new FormData();
      formData.append("kind", kind);
      formData.append("file", compressedFile);

      for (let attempt = 0; attempt <= retryDelaysMs.length; attempt += 1) {
        try {
          setState((current) => ({
            ...current,
            status: attempt === 0 ? "uploading" : "retrying",
            error: null,
          }));

          const response = await httpClient.post<BookingMedia>(
            endpoint,
            formData,
            {
              headers: {
                ...(signedToken ? { "X-Booking-Token": signedToken } : {}),
                "Content-Type": "multipart/form-data",
              },
              onUploadProgress: (event) => {
                const total = event.total;
                if (!total) {
                  return;
                }
                setState((current) => ({
                  ...current,
                  progress: Math.round((event.loaded * 100) / total),
                }));
              },
            }
          );

          setState({
            progress: 100,
            status: "success",
            error: null,
            media: response.data,
          });
          return response.data;
        } catch (err) {
          if (attempt === retryDelaysMs.length) {
            const message = err instanceof Error ? err.message : "upload_failed";
            setState((current) => ({
              ...current,
              status: "failed",
              error: message,
            }));
            throw err;
          }

          await delay(retryDelaysMs[attempt]);
        }
      }

      return null;
    },
    mutationKey: mutKey,
    onSuccess: () => {
      if (bookingId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.customer.booking(bookingId),
        });
      }
    },
  });

  function uploadPhoto(options: UploadPhotoOptions) {
    return mutation.mutateAsync(options);
  }

  function reset() {
    setState({ progress: 0, status: "idle", error: null, media: null });
  }

  return {
    ...state,
    isOfflinePaused: mutation.isPaused,
    isUploading: mutation.isPending,
    reset,
    uploadPhoto,
  };
}
