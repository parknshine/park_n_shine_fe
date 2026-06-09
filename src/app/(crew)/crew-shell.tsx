"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useIsRestoring, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/shared/app-shell";
import { LanguageSwitcher } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useCrewSession } from "@/features/crew/hooks";
import { JobStaleModal } from "@/features/crew/components";
import { useRealtimeEvents, getCrewIdFromToken } from "@/lib/use-realtime-events";
import { queryKeys } from "@/lib/query-keys";
import type { CrewJob } from "@/features/crew/types";

interface CrewShellProps {
  children: ReactNode;
}

export function CrewShell({ children }: Readonly<CrewShellProps>) {
  const router = useRouter();
  const isRestoring = useIsRestoring();
  const { session, clearSession } = useCrewSession();
  const [staleJobId, setStaleJobId] = useState<string | null>(null);
  const crewId = session ? getCrewIdFromToken() : null;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  const queryClient = useQueryClient();

  useRealtimeEvents({
    url: () => {
      if (!crewId) return "";
      const token = localStorage.getItem("crew-token") ?? "";
      return `${baseUrl}/v1/crew/realtime/stream?token=${token}`;
    },
    enabled: !!crewId,
    onEvent: (event) => {
      if (event.type === "booking_status_changed" && event.status === "STALE") {
        setStaleJobId(event.bookingId as string);
      }
      if (event.type === "eta_extended" && event.bookingId && event.etaEndsAt) {
        queryClient.setQueryData<CrewJob | null>(
          queryKeys.crew.job(event.bookingId as string),
          (prev) => prev ? { ...prev, etaEndsAt: event.etaEndsAt as string } : prev,
        );
      }
    },
  });

  useEffect(() => {
    if (!isRestoring && !session) {
      router.replace("/crew/login");
    }
  }, [session, router, isRestoring]);

  useEffect(() => {
    function handleSessionExpired() {
      clearSession();
      router.replace("/crew/login");
    }
    globalThis.addEventListener("crew-session-expired", handleSessionExpired);
    return () => globalThis.removeEventListener("crew-session-expired", handleSessionExpired);
  }, [clearSession, router]);

  if (isRestoring || !session) return null;

  function handleLogout() {
    clearSession();
    router.replace("/crew/login");
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
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Image
                src="/icons/icon.svg"
                alt="Park & Shine"
                width={20}
                height={20}
                className="shrink-0"
              />
            </div>
            <span className="text-sm font-semibold text-foreground">
              Park & Shine
            </span>
          </div>

          <div className="flex items-center gap-1">
            <LanguageSwitcher />

            <div
              title={session.crewName}
              className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground"
            >
              {initials}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              aria-label="Logout"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="pt-14">
        <AppShell surface="crew">{children}</AppShell>
      </div>
    </>
  );
}
