"use client";

import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Loader2, BriefcaseBusiness, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { useNextJob } from "@/features/crew/hooks";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

export function CrewHomePage() {
  const router = useRouter();
  const { claimNextJob, job, isLoading, hasNoJob, error } = useNextJob();
  const { t } = useTranslation("crew");

  useEffect(() => {
    if (job) {
      router.replace(`/crew/jobs/${job.id}`);
    }
  }, [job, router]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

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
            {t("home.queueLabel")}
          </p>
          <h1 className="text-lg font-bold leading-tight text-foreground">
            {t("home.readyTitle")}
          </h1>
        </div>
      </div>

      {/* Main action area */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        {hasNoJob ? (
          <EmptyState
            title={t("home.emptyTitle")}
            description={t("home.emptyDescription")}
            action={
              <Button
                variant="outline"
                size="lg"
                onClick={handleClaim}
                prefix={<Inbox className="h-4 w-4" />}
              >
                {t("action.retry", { ns: "common" })}
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
                aria-label={t("home.claimAriaLabel")}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t("home.searching")}
                  </>
                ) : (
                  t("home.claimButton")
                )}
              </Button>
            </div>

            {/* Hint text */}
            {!isLoading && (
              <p className="text-center text-xs text-muted-foreground">
                {t("home.claimHint")}
              </p>
            )}
          </div>
        )}

      </div>
    </main>
  );
}

export default CrewHomePage;
