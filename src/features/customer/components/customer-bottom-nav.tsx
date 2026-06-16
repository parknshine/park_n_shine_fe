"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, Sparkles, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCustomerAuthStore } from "@/store/customer-auth-store";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { useNavigationGuardConfig } from "@/features/customer/hooks/use-navigation-guard-config";
import { NavigationGuardModal } from "@/features/customer/components/navigation-guard-modal";

export function CustomerBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation("customer");
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [guardPending, setGuardPending] = useState<string | null>(null);
  const [showNavGuard, setShowNavGuard] = useState(false);
  const guardConfig = useNavigationGuardConfig(pathname, isAuthenticated);

  function handleTabClick(path: string, isProtected: boolean) {
    const isGuestGoingToProtected = !isAuthenticated && isProtected;
    if (guardConfig !== null && !isGuestGoingToProtected) {
      setGuardPending(path);
      setShowNavGuard(true);
      return;
    }
    if (isProtected && !isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    router.push(path);
  }

  const tabs = [
    {
      label: t("bottomNav.home"),
      icon: Home,
      path: "/home",
      protected: false,
    },
    {
      label: t("bottomNav.wash"),
      icon: Sparkles,
      path: "/book/capture",
      protected: false,
    },
    {
      label: t("bottomNav.history"),
      icon: Clock,
      path: "/history",
      protected: true,
    },
    {
      label: t("bottomNav.account"),
      icon: User,
      path: "/account",
      protected: true,
    },
  ] as const;

  return (
    <>
      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background safe-area-bottom">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
          {tabs.map(({ label, icon: Icon, path, protected: isProtected }) => {
            const isActive =
              pathname === path || pathname.startsWith(path + "/");
            return (
              <button
                key={path}
                type="button"
                onClick={() => handleTabClick(path, isProtected)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isActive && "stroke-[2.5px]"
                  )}
                />
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogTitle className="text-lg font-bold">
            {t("bottomNav.authPromptTitle")}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t("bottomNav.authPromptDesc")}
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Button
              className="w-full rounded-full"
              onClick={() => {
                setShowAuthModal(false);
                router.push("/login");
              }}
            >
              {t("bottomNav.authPromptCta")}
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full"
              onClick={() => setShowAuthModal(false)}
            >
              {t("bottomNav.authPromptDismiss")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <NavigationGuardModal
        open={showNavGuard}
        config={guardConfig}
        onConfirm={() => {
          setShowNavGuard(false);
          if (guardPending) router.push(guardPending);
          setGuardPending(null);
        }}
        onCancel={() => {
          setShowNavGuard(false);
          setGuardPending(null);
        }}
      />
    </>
  );
}
