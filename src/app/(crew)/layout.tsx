"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { AppShell } from "@/components/shared/app-shell";
import { LanguageSwitcher } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useCrewSession } from "@/features/crew/hooks";

interface CrewLayoutProps {
  children: ReactNode;
}

export function CrewLayout({ children }: CrewLayoutProps) {
  const router = useRouter();
  const { session, clearSession } = useCrewSession();

  useEffect(() => {
    if (!session) {
      router.replace("/crew/login");
    }
  }, [session, router]);

  if (!session) return null;

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
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
          {/* Brand */}
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

          {/* Right controls */}
          <div className="flex items-center gap-1">
            <LanguageSwitcher />

            {/* Crew avatar */}
            <div
              title={session.crewName}
              className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground"
            >
              {initials}
            </div>

            {/* Logout */}
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

      <AppShell surface="crew">{children}</AppShell>
    </>
  );
}

export default CrewLayout;
