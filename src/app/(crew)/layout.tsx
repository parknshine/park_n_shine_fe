"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { AppShell } from "@/components/shared/app-shell";
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

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-11 max-w-md items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/icons/icon.svg"
              alt="Park & Shine logo"
              width={28}
              height={28}
              className="shrink-0"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold text-foreground leading-none">
                Park & Shine
              </span>
              <span className="text-[10px] font-medium text-muted-foreground leading-tight tracking-wide uppercase">
                Crew
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {session.crewName}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              aria-label="Logout"
              className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <AppShell surface="crew">{children}</AppShell>
    </>
  );
}

export default CrewLayout;
