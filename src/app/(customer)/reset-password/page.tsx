"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCustomerAuth } from "@/features/customer/hooks";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

const INPUT_CLASS =
  "h-[52px] rounded-[14px] border-[1.5px] border-[rgba(111,120,125,0.18)] bg-white/70 text-[15px] focus:border-[#1db1f1] focus:ring-[rgba(29,177,241,0.14)]";

function ResetPasswordForm() {
  const { t } = useTranslation("customer");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword, isSubmitting } = useCustomerAuth();

  const oobCode = searchParams.get("oobCode");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mismatch, setMismatch] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      router.replace("/forgot-password");
    }
  }, [oobCode, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMismatch(true);
      return;
    }
    setMismatch(false);
    try {
      await resetPassword({ oobCode: oobCode!, newPassword });
      toast.success(t("auth.resetPasswordSuccess"));
      router.replace("/login");
    } catch (err) {
      const key = err instanceof Error ? err.message : "auth.errors.generic";
      if (
        key === "auth.errors.invalidActionCode" ||
        key === "auth.errors.expiredActionCode"
      ) {
        setInvalidLink(true);
      } else {
        toast.error(t(key));
      }
    }
  }

  if (!oobCode) return null;

  if (invalidLink) {
    return (
      <main className='flex min-h-dvh flex-col bg-background px-7'>
        <div className='flex flex-1 flex-col mt-12'>
          <h1 className='mb-2 text-[28px] font-extrabold leading-[1.18] tracking-[-0.02em] text-foreground'>
            {t("auth.resetPasswordTitle")}
          </h1>
          <div className='rounded-[14px] bg-red-50 border border-red-200 px-5 py-4 text-[15px] text-red-800 mb-6'>
            {t("auth.resetPasswordInvalidLink")}
          </div>
          <Link
            href='/forgot-password'
            className='text-center font-bold text-primary hover:underline text-[14px]'
          >
            {t("auth.resetPasswordRequestNew")}
          </Link>
          <div className='min-h-6 flex-1' />
        </div>
      </main>
    );
  }

  return (
    <main className='flex min-h-dvh flex-col bg-background px-7'>
      <div className='flex flex-1 flex-col mt-12'>
        <h1 className='mb-2 text-[28px] font-extrabold leading-[1.18] tracking-[-0.02em] text-foreground'>
          {t("auth.resetPasswordTitle")}
        </h1>
        <p className='mb-7.5 text-[15px] leading-[1.55] text-muted-foreground'>
          {t("auth.resetPasswordSubtitle")}
        </p>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4.5'>
          {/* New password */}
          <div className='flex flex-col gap-2'>
            <Label htmlFor='new-password' className='text-[13px] font-bold'>
              {t("auth.resetPasswordNewPassword")}
            </Label>
            <div className='relative'>
              <Input
                id='new-password'
                type={showPw ? "text" : "password"}
                placeholder='••••••••'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                autoComplete='new-password'
                className={cn(INPUT_CLASS, "pr-12")}
              />
              <button
                type='button'
                aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
                onClick={() => setShowPw((s) => !s)}
                className='absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-black/5'
              >
                {showPw ? (
                  <EyeOff className='h-5 w-5' strokeWidth={1.8} />
                ) : (
                  <Eye className='h-5 w-5' strokeWidth={1.8} />
                )}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className='flex flex-col gap-2'>
            <Label htmlFor='confirm-password' className='text-[13px] font-bold'>
              {t("auth.resetPasswordConfirm")}
            </Label>
            <div className='relative'>
              <Input
                id='confirm-password'
                type={showConfirm ? "text" : "password"}
                placeholder='••••••••'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete='new-password'
                className={cn(INPUT_CLASS, "pr-12", mismatch && "border-red-400")}
              />
              <button
                type='button'
                aria-label={showConfirm ? "Sembunyikan password" : "Tampilkan password"}
                onClick={() => setShowConfirm((s) => !s)}
                className='absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-black/5'
              >
                {showConfirm ? (
                  <EyeOff className='h-5 w-5' strokeWidth={1.8} />
                ) : (
                  <Eye className='h-5 w-5' strokeWidth={1.8} />
                )}
              </button>
            </div>
            {mismatch && (
              <p className='text-[13px] text-red-500'>
                {t("auth.resetPasswordPasswordMismatch")}
              </p>
            )}
          </div>

          <Button
            type='submit'
            size='lg'
            className='mt-1.5 w-full font-bold'
            disabled={isSubmitting || !newPassword || !confirmPassword}
          >
            {isSubmitting
              ? t("auth.resetPasswordSaving")
              : t("auth.resetPasswordSubmit")}
          </Button>
        </form>

        <div className='min-h-6 flex-1' />
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
