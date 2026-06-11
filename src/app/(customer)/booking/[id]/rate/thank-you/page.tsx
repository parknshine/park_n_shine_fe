"use client";

import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

export default function TipThankYouPage() {
  const router = useRouter();

  return (
    <div className="mx-auto flex min-h-[80dvh] max-w-md flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
        <Heart className="h-12 w-12 text-primary" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Terima Kasih!</h1>
        <p className="text-sm text-muted-foreground">
          Tip kamu sudah diterima. Crew kami sangat menghargai kebaikanmu.
        </p>
      </div>
      <button
        type="button"
        onClick={() => router.push("/")}
        className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Kembali ke Home
      </button>
    </div>
  );
}
