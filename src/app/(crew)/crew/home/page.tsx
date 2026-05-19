"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, BriefcaseBusiness, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { useNextJob } from "@/features/crew/hooks";
import { cn } from "@/lib/utils";

export function CrewHomePage() {
  const router = useRouter();
  const { claimNextJob, job, isLoading, hasNoJob, error } = useNextJob();

  useEffect(() => {
    if (job) {
      router.replace(`/crew/jobs/${job.id}`);
    }
  }, [job, router]);

  async function handleClaim() {
    const claimed = await claimNextJob();
    if (claimed) {
      router.push(`/crew/jobs/${claimed.id}`);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-44px)] max-w-md flex-col px-4 pb-8 pt-10">
      {/* Section header */}
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <BriefcaseBusiness className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Antrian Job
          </p>
          <h1 className="text-lg font-bold leading-tight text-foreground">
            Siap Bertugas
          </h1>
        </div>
      </div>

      {/* Main action area */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        {hasNoJob ? (
          <EmptyState
            title="Tidak ada job saat ini"
            description="Belum ada kendaraan di antrean. Coba lagi beberapa saat."
            action={
              <Button
                variant="outline"
                size="lg"
                onClick={handleClaim}
                prefix={<Inbox className="h-4 w-4" />}
              >
                Coba Lagi
              </Button>
            }
          />
        ) : (
          <div className="w-full space-y-4">
            {/* Pulse ring behind the button when idle */}
            <div className="relative w-full">
              {!isLoading && (
                <span
                  className="absolute inset-0 -z-10 animate-pulse rounded-xl bg-primary/20"
                  aria-hidden="true"
                />
              )}
              <Button
                size="lg"
                variant="default"
                className={cn(
                  "h-16 w-full rounded-xl text-base font-bold tracking-wide",
                  isLoading && "opacity-80"
                )}
                disabled={isLoading}
                onClick={handleClaim}
                aria-label="Ambil job berikutnya"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Mencari Job…
                  </>
                ) : (
                  "Ambil Job Berikutnya"
                )}
              </Button>
            </div>

            {/* Hint text */}
            {!isLoading && (
              <p className="text-center text-xs text-muted-foreground">
                Tekan tombol untuk mengambil job dari antrean
              </p>
            )}
          </div>
        )}

        {/* Inline error */}
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-center text-sm font-medium text-destructive"
          >
            {error}
          </p>
        )}
      </div>
    </main>
  );
}

export default CrewHomePage;
