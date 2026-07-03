"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { applyActionCode } from "firebase/auth";
import { toast } from "react-hot-toast";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/shared";
import { auth } from "@/lib/firebase";
import { useCustomerAuth } from "@/features/customer/hooks";
import {
  getAuthErrorKey,
  isInvalidActionCodeError,
} from "@/features/customer/auth-errors";
import { useTranslation } from "@/i18n";

// ─── Reset Password ───────────────────────────────────────────────────────────

function ResetPasswordView({ oobCode }: { oobCode: string }) {
  const { t } = useTranslation("customer");
  const router = useRouter();
  const { resetPassword, isSubmitting } = useCustomerAuth();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mismatch, setMismatch] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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

// ─── Verify Email ─────────────────────────────────────────────────────────────

function VerifyEmailView({ oobCode }: { oobCode: string }) {
  const { t } = useTranslation("customer");
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    applyActionCode(auth, oobCode)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [oobCode]);

  return (
    <main className="flex min-h-dvh flex-col bg-background px-7">
      <div className="flex flex-1 flex-col mt-12">
        <h1 className="mb-2 text-[28px] font-extrabold leading-[1.18] tracking-[-0.02em] text-foreground">
          {t("auth.verifyEmailTitle")}
        </h1>

        {status === "loading" && (
          <p className="text-[15px] text-muted-foreground">
            {t("auth.verifyEmailVerifying")}
          </p>
        )}

        {status === "success" && (
          <div className="flex flex-col items-start gap-5">
            <div className="flex items-center gap-3 rounded-[14px] bg-green-50 border border-green-200 px-5 py-4 text-[15px] text-green-800 w-full">
              <CheckCircle className="h-5 w-5 shrink-0" />
              {t("auth.verifyEmailSuccess")}
            </div>
            <Button
              size="lg"
              className="w-full font-bold"
              onClick={() => router.replace("/login")}
            >
              {t("auth.verifyEmailContinue")}
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-start gap-5">
            <div className="rounded-[14px] bg-red-50 border border-red-200 px-5 py-4 text-[15px] text-red-800 w-full">
              {t("auth.verifyEmailInvalid")}
            </div>
            <Link
              href="/login"
              className="font-bold text-primary hover:underline text-[14px]"
            >
              {t("auth.verifyEmailBackToLogin")}
            </Link>
          </div>
        )}

        <div className="min-h-6 flex-1" />
      </div>
    </main>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────

function AuthActionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");

  useEffect(() => {
    if (!mode || !oobCode) {
      router.replace("/login");
    }
  }, [mode, oobCode, router]);

  if (!mode || !oobCode) return null;

  if (mode === "resetPassword") {
    return <ResetPasswordView oobCode={oobCode} />;
  }

  if (mode === "verifyEmail") {
    return <VerifyEmailView oobCode={oobCode} />;
  }

  router.replace("/login");
  return null;
}

export default function AuthActionPage() {
  return (
    <Suspense fallback={null}>
      <AuthActionContent />
    </Suspense>
  );
}
