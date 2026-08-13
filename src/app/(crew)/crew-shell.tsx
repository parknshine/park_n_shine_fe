"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/shared/app-shell";
import { LanguageSwitcher } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useCrewSession } from "@/features/crew/hooks";
import { useCrewAuthStore } from "@/store/crew-auth-store";
import { EtaCountdown, JobStaleModal } from "@/features/crew/components";
import { useRealtimeEvents } from "@/lib/use-realtime-events";
import crewApi from "@/lib/axios-crew";
import { queryKeys } from "@/lib/query-keys";
import type { CrewJob } from "@/features/crew/types";
import { toast } from "react-hot-toast";
import { useTranslation } from "@/i18n";

const TIMER_HIDDEN_STATUSES = new Set([
  "READY",
  "CLOSED",
  "CANCELLED",
  "EXPIRED",
]);

interface CrewShellProps {
  children: ReactNode;
}

export function CrewShell({ children }: Readonly<CrewShellProps>) {
  const router = useRouter();
  const { session, clearSession, recoverSession } = useCrewSession();
  const hasHydrated = useCrewAuthStore((s) => s._hasHydrated);
  const queryClient = useQueryClient();
  const { t } = useTranslation("crew");
  const [staleJobId, setStaleJobId] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeEtaEndsAt, setActiveEtaEndsAt] = useState<string | null>(() => {
    for (const query of queryClient
      .getQueryCache()
      .findAll({ queryKey: ["crew", "job"] })) {
      const data = query.state.data as CrewJob | null;
      if (data?.etaEndsAt && !TIMER_HIDDEN_STATUSES.has(data.status))
        return data.etaEndsAt;
    }
    return null;
  });
  const crewId = session?.crewId ?? null;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  const [crewSseToken, setCrewSseToken] = useState<string | null>(null);
  const fetchingCrewSseRef = useRef(false);

  // Subscribe to etaEndsAt changes from crew job query cache
  useEffect(() => {
    const cache = queryClient.getQueryCache();
    return cache.subscribe((event) => {
      const key = event.query.queryKey;
      if (key[0] === "crew" && key[1] === "job" && key.length === 3) {
        if (event.type === "removed") {
          setActiveEtaEndsAt(null);
          return;
        }
        const data = event.query.state.data as CrewJob | null;
        const isTerminal = data?.status
          ? TIMER_HIDDEN_STATUSES.has(data.status)
          : false;
        setActiveEtaEndsAt(isTerminal ? null : (data?.etaEndsAt ?? null));
      }
    });
  }, [queryClient]);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_REALTIME_ENABLED !== "true") return;
    if (!crewId) return;
    if (fetchingCrewSseRef.current) return;
    fetchingCrewSseRef.current = true;

    crewApi
      .post<{ sseToken: string }>("/v1/crew/realtime/sse-token")
      .then((res) => {
        setCrewSseToken(res.data.sseToken);
      })
      .catch(() => {
        // SSE unavailable — silent fail
      })
      .finally(() => {
        fetchingCrewSseRef.current = false;
      });
  }, [crewId]);

  useRealtimeEvents({
    url: crewSseToken
      ? `${baseUrl}/v1/crew/realtime/stream?token=${crewSseToken}`
      : "",
    enabled: !!crewSseToken,
    onEvent: (event) => {
      if (event.type === "booking_status_changed" && event.status === "STALE") {
        setStaleJobId(event.bookingId as string);
      }
      if (
        event.type === "booking_status_changed" &&
        (event.status === "CANCELLED" || event.status === "EXPIRED") &&
        event.bookingId
      ) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.crew.job(event.bookingId as string),
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.crew.nextJob(),
        });
      }
      if (event.type === "job_assigned" || event.type === "new_job") {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.crew.queue(),
        });
        if (event.type === "job_assigned") {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.crew.nextJob(),
          });
        }
        const msg =
          event.type === "new_job"
            ? t("home.newJobQueued", {
                defaultValue: "New job available in queue!",
              })
            : t("home.newJobNotification", {
                defaultValue: "New job assigned to you!",
              });
        toast.success(msg);
      }
      if (
        (event.type === "eta_extended" ||
          event.type === "time_extension_approved") &&
        event.bookingId &&
        event.etaEndsAt
      ) {
        queryClient.setQueryData<CrewJob | null>(
          queryKeys.crew.job(event.bookingId as string),
          (prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              etaEndsAt: event.etaEndsAt as string,
              ...(event.type === "time_extension_approved" && event.status
                ? { status: event.status as CrewJob["status"] }
                : {}),
            };
          },
        );
      }
      if (event.type === "time_extension_rejected" && event.bookingId) {
        globalThis.dispatchEvent(
          new CustomEvent("time-extension-rejected", {
            detail: { bookingId: event.bookingId },
          }),
        );
      }
      if (event.type === "tip_paid") {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.crew.monthlyStats(),
        });
      }
    },
  });

  useEffect(() => {
    if (!hasHydrated || session) return;
    // Local store looks logged-out (e.g. localStorage was evicted by the OS
    // under low device storage) — confirm with the server before bouncing to
    // login, since the httpOnly session cookie may still be valid.
    let cancelled = false;
    recoverSession().then((recovered) => {
      if (!cancelled && !recovered) router.replace("/crew/login");
    });
    return () => {
      cancelled = true;
    };
  }, [hasHydrated, session, router, recoverSession]);

  useEffect(() => {
    function handleSessionExpired() {
      void clearSession().then(() => router.replace("/crew/login"));
    }
    globalThis.addEventListener("crew-session-expired", handleSessionExpired);
    return () =>
      globalThis.removeEventListener(
        "crew-session-expired",
        handleSessionExpired,
      );
  }, [clearSession, router]);

  if (!hasHydrated || !session) return null;

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await clearSession();
    } finally {
      router.replace("/crew/login");
    }
  }

  const initials = session.crewName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <>
      {staleJobId && (
        <JobStaleModal
          open={true}
          jobId={staleJobId}
          onDone={() => {
            setStaleJobId(null);
            router.replace("/crew/home?noResume=true");
          }}
        />
      )}
      <header className='fixed inset-x-0 top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm'>
        <div className='mx-auto flex h-16 max-w-md items-center justify-between px-4'>
          <div className='flex items-center gap-2.5'>
            <Image
              src='/parknshinelogo.svg'
              alt='Park & Shine'
              width={120}
              height={32}
              className='shrink-0'
              style={{ width: "auto", height: "32px" }}
            />
          </div>

          <div className='flex items-center gap-1'>
            {activeEtaEndsAt && (
              <EtaCountdown
                etaEndsAt={activeEtaEndsAt}
                compact
                onExpire={() => setActiveEtaEndsAt(null)}
              />
            )}
            <LanguageSwitcher />

            <div
              title={session.crewName}
              className='ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground'
            >
              {initials}
            </div>

            <Button
              variant='ghost'
              size='sm'
              onClick={handleLogout}
              disabled={isLoggingOut}
              aria-label='Logout'
              className='h-9 w-9 p-0 text-muted-foreground hover:text-destructive'
            >
              {isLoggingOut ? (
                <svg
                  aria-hidden='true'
                  className='h-4 w-4 animate-spin'
                  viewBox='0 0 24 24'
                  fill='none'
                >
                  <circle
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='3'
                    strokeOpacity='0.25'
                  />
                  <path
                    d='M12 2a10 10 0 0 1 10 10'
                    stroke='currentColor'
                    strokeWidth='3'
                    strokeLinecap='round'
                  />
                </svg>
              ) : (
                <LogOut className='h-4 w-4' />
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className='pt-16'>
        <AppShell surface='crew'>{children}</AppShell>
      </div>
    </>
  );
}
