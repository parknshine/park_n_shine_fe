"use client";

import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";

interface BookingExpiredModalProps {
  readonly open: boolean;
}

export function BookingExpiredModal({ open }: BookingExpiredModalProps) {
  const router = useRouter();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-8 w-8 text-amber-500" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-foreground">
              Waktu Pembayaran Habis
            </h2>
            <p className="text-sm text-muted-foreground">
              Booking ini sudah kedaluwarsa karena melewati batas waktu
              pembayaran. Silakan mulai booking baru.
            </p>
          </div>

          <button
            onClick={() => router.replace("/")}
            className="mt-2 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Mulai dari Awal
          </button>
        </div>
      </div>
    </div>
  );
}
