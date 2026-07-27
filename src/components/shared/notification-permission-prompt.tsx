"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCrewAuthStore } from "@/store/crew-auth-store";
import { useCustomerAuthStore } from "@/store/customer-auth-store";
import { useCustomerBookings } from "@/features/customer/hooks/use-customer-bookings";
import { usePushNotification } from "@/lib/use-push-notification";
import { BOOKING_STATUSES } from "@/features/customer/types";

const DISMISS_KEY = "push-prompt-dismissed";

const TERMINAL_STATUSES: string[] = [
  BOOKING_STATUSES.CLOSED,
  BOOKING_STATUSES.EXPIRED,
  BOOKING_STATUSES.CANCELLED,
];

function isPushSupported() {
  if (typeof window === "undefined") return false;
  return "Notification" in window && "serviceWorker" in navigator;
}

function isDismissed() {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(DISMISS_KEY) === "true";
  } catch {
    return true;
  }
}

export function NotificationPermissionPrompt() {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(isDismissed);

  const crewHydrated = useCrewAuthStore((s) => s._hasHydrated);
  const crewAuthenticated = useCrewAuthStore((s) => s.isAuthenticated);

  const customerHydrated = useCustomerAuthStore((s) => s._hasHydrated);
  const customerAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);

  const bookingsQuery = useCustomerBookings(customerHydrated && customerAuthenticated);

  const activeBooking = useMemo(() => {
    const items = bookingsQuery.data?.pages.flatMap((p) => p.items) ?? [];
    return items.find((b) => !TERMINAL_STATUSES.includes(b.status)) ?? null;
  }, [bookingsQuery.data]);

  const pushType: "crew" | "booking" | null = crewAuthenticated
    ? "crew"
    : activeBooking
      ? "booking"
      : null;

  const { permission, subscribe } = usePushNotification(
    pushType === "booking"
      ? { type: "booking", bookingId: activeBooking!.id, bookingToken: activeBooking!.bookingToken }
      : { type: "crew" }
  );

  if (!isPushSupported()) return null;
  if (process.env.NEXT_PUBLIC_PUSH_ENABLED !== "true") return null;
  if (dismissed) return null;
  if (permission !== "default") return null;
  if (!crewHydrated || !customerHydrated) return null;
  if (!pushType) return null;

  const persistDismissal = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "true");
    } catch {
      // ignore — private browsing / storage disabled
    }
  };

  const handleEnable = () => {
    void subscribe();
    persistDismissal();
    setDismissed(true);
  };

  const handleLater = () => {
    persistDismissal();
    setDismissed(true);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && handleLater()}>
      <DialogContent hideCloseButton>
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <DialogTitle>{t("pushPrompt.title")}</DialogTitle>
          <DialogDescription>{t("pushPrompt.description")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleLater}>
            {t("pushPrompt.later")}
          </Button>
          <Button onClick={handleEnable}>{t("pushPrompt.enable")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
