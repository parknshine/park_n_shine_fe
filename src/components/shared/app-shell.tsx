import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  className?: string;
  surface?: "customer" | "crew" | "admin";
}

const surfaceClasses: Record<NonNullable<AppShellProps["surface"]>, string> = {
  customer: "max-w-md",
  crew: "max-w-md",
  admin: "max-w-7xl",
};

export function AppShell({
  children,
  className,
  surface = "customer",
}: AppShellProps) {
  return (
    <main
      className={cn(
        "mx-auto min-h-dvh w-full px-4 py-5 sm:px-6",
        surfaceClasses[surface],
        className
      )}
    >
      {children}
    </main>
  );
}
