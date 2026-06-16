"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useCustomerAuthStore } from "@/store/customer-auth-store";
import { useNavigationGuardConfig } from "@/features/customer/hooks/use-navigation-guard-config";
import { NavigationGuardModal } from "@/features/customer/components/navigation-guard-modal";

const BACK_PAGES = [
  /^\/book\/location$/,
  /^\/book\/capture$/,
  /^\/book\/confirm$/,
  // /^\/booking\/[^/]+\/payment-method$/,
  /^\/q\/[^/]+\/book\/capture$/,
  /^\/q\/[^/]+\/book\/confirm$/,
  /^\/q\/[^/]+\/capture$/,
  /^\/q\/[^/]+\/confirm$/,
];

export function HeaderBackButton() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  const [showNavGuard, setShowNavGuard] = useState(false);
  const guardConfig = useNavigationGuardConfig(pathname, isAuthenticated);

  // Confirm pages go back to capture (within flow) — no guard on back button.
  const BACK_BUTTON_GUARD_EXEMPT = [
    /^\/book\/confirm$/,
    /^\/q\/[^/]+\/book\/confirm$/,
    /^\/q\/[^/]+\/confirm$/,
  ];
  const isBackButtonExempt = BACK_BUTTON_GUARD_EXEMPT.some((re) => re.test(pathname));
  const activeGuard = isBackButtonExempt ? null : guardConfig;

  if (!BACK_PAGES.some((re) => re.test(pathname))) return null;

  function handleBack() {
    if (activeGuard !== null) {
      setShowNavGuard(true);
      return;
    }
    doBack();
  }

  function doBack() {
    if (pathname === "/book/location") {
      router.push("/");
    } else {
      router.back();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleBack}
        aria-label="Kembali"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-foreground shadow-[0_4px_16px_rgba(0,0,0,0.10)] backdrop-blur-sm transition-colors hover:bg-background"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <NavigationGuardModal
        open={showNavGuard}
        config={activeGuard}
        onConfirm={() => {
          setShowNavGuard(false);
          doBack();
        }}
        onCancel={() => setShowNavGuard(false)}
      />
    </>
  );
}
