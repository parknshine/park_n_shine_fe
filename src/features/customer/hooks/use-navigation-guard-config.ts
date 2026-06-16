"use client";

import { useBookingCaptureStore } from "@/store/booking-capture-store";
import { useTranslation } from "@/i18n";

export type GuardConfig = {
  message: string;
  confirmLabel: string;
  cancelLabel: string;
};

const CAPTURE_PAGES = [
  /^\/book\/capture$/,
  /^\/q\/[^/]+\/book\/capture$/,
  /^\/q\/[^/]+\/capture$/,
];

const CONFIRM_PAGES = [
  /^\/book\/confirm$/,
  /^\/q\/[^/]+\/book\/confirm$/,
  /^\/q\/[^/]+\/confirm$/,
];

const PAYMENT_PAGES = [
  /^\/booking\/[^/]+\/payment-method$/,
  /^\/booking\/[^/]+\/pay$/,
  /^\/booking\/[^/]+\/pay\/card$/,
];

const STATUS_PAGE = /^\/booking\/[^/]+\/status$/;

export function useNavigationGuardConfig(
  pathname: string,
  isAuthenticated: boolean
): GuardConfig | null {
  const { t } = useTranslation("customer");
  const captureHasProgress = useBookingCaptureStore((s) => s.captureHasProgress);

  const confirmLabel = t("navGuard.confirmLeave");
  const cancelLabel = t("navGuard.cancelLeave");

  if (CAPTURE_PAGES.some((re) => re.test(pathname))) {
    if (!captureHasProgress) return null;
    return {
      message: t("navGuard.formWillReset"),
      confirmLabel,
      cancelLabel,
    };
  }

  if (CONFIRM_PAGES.some((re) => re.test(pathname))) {
    return {
      message: t("navGuard.formWillReset"),
      confirmLabel,
      cancelLabel,
    };
  }

  if (PAYMENT_PAGES.some((re) => re.test(pathname))) {
    return {
      message: isAuthenticated
        ? t("navGuard.bookingStillActiveAuth")
        : t("navGuard.bookingWillBeLostGuest"),
      confirmLabel,
      cancelLabel,
    };
  }

  if (STATUS_PAGE.test(pathname) && !isAuthenticated) {
    return {
      message: t("navGuard.statusWillBeLostGuest"),
      confirmLabel,
      cancelLabel,
    };
  }

  return null;
}
