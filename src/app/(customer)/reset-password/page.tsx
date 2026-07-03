"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/shared";
import { useCustomerAuth } from "@/features/customer/hooks";
import {
  getAuthErrorKey,
  isInvalidActionCodeError,
} from "@/features/customer/auth-errors";
import { useTranslation } from "@/i18n";

function ResetPasswordForm() {
  const { t } = useTranslation("customer");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword, isSubmitting } = useCustomerAuth();

  const oobCode = searchParams.get("oobCode");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mismatch, setMismatch] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      router.replace("/forgot-password");
    }
  }, [oobCode, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Guarded here (not via `oobCode!`) so the invariant is obvious at the
    // call site rather than depending on the early return below.
    if (!oobCode) return;

    if (newPassword !== confirmPassword) {
      setMismatch(true);
      return;
    }
    setMismatch(false);
    try {
      await resetPassword({ oobCode, newPassword });
      toast.success(t("auth.resetPasswordSuccess"));
      router.replace("/login");
    } catch (err) {
      if (isInvalidActionCodeError(err)) {
        setInvalidLink(true);
      } else {
        toast.error(t(getAuthErrorKey(err)));
      }
    }
  }

  if (!oobCode) return null;

  if (invalidLink) {
    return (
      <main className="flex min-h-dvh flex-col bg-background px-7">
        <div className="flex flex-1 flex-col mt-12">
          <h1 className="mb-2 text-[28px] font-extrabold leading-[1.18] tracking-[-0.02em] text-foreground">
            {t("auth.resetPasswordTitle")}
          </h1>
          <div className="rounded-[14px] bg-red-50 border border-red-200 px-5 py-4 text-[15px] text-red-800 mb-6">
            {t("auth.resetPasswordInvalidLink")}
          </div>
          <Link
            href="/forgot-password"
            className="text-center font-bold text-primary hover:underline text-[14px]"
          >
            {t("auth.resetPasswordRequestNew")}
          </Link>
          <div className="min-h-6 flex-1" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col bg-background px-7">
      <div className="flex flex-1 flex-col mt-12">
        <h1 className="mb-2 text-[28px] font-extrabold leading-[1.18] tracking-[-0.02em] text-foreground">
          {t("auth.resetPasswordTitle")}
        </h1>
        <p className="mb-7.5 text-[15px] leading-[1.55] text-muted-foreground">
          {t("auth.resetPasswordSubtitle")}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
          <PasswordInput
            id="new-password"
            label={t("auth.resetPasswordNewPassword")}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />

          <PasswordInput
            id="confirm-password"
            label={t("auth.resetPasswordConfirm")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            invalid={mismatch}
            errorDescribedBy={mismatch ? "confirm-password-error" : undefined}
          />
          {mismatch && (
            <p
              id="confirm-password-error"
              className="text-[13px] text-red-500"
            >
              {t("auth.resetPasswordPasswordMismatch")}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="mt-1.5 w-full font-bold"
            disabled={isSubmitting || !newPassword || !confirmPassword}
          >
            {isSubmitting
              ? t("auth.resetPasswordSaving")
              : t("auth.resetPasswordSubmit")}
          </Button>
        </form>

        <div className="min-h-6 flex-1" />
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
