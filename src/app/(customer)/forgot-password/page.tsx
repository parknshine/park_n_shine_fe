"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCustomerAuth } from "@/features/customer/hooks";
import { useTranslation } from "@/i18n";

const INPUT_CLASS =
  "h-[52px] rounded-[14px] border-[1.5px] border-[rgba(111,120,125,0.18)] bg-white/70 text-[15px] focus:border-[#1db1f1] focus:ring-[rgba(29,177,241,0.14)]";

function ForgotPasswordForm() {
  const { t } = useTranslation("customer");
  const { sendPasswordReset, isSubmitting } = useCustomerAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (err) {
      const key = err instanceof Error ? err.message : "auth.errors.generic";
      toast.error(t(key));
    }
  }

  return (
    <main className='flex min-h-dvh flex-col bg-background px-7'>
      <div className='flex flex-1 flex-col mt-12'>
        <h1 className='mb-2 text-[28px] font-extrabold leading-[1.18] tracking-[-0.02em] text-foreground'>
          {t("auth.forgotPasswordTitle")}
        </h1>
        <p className='mb-7.5 text-[15px] leading-[1.55] text-muted-foreground'>
          {t("auth.forgotPasswordSubtitle")}
        </p>

        {sent ? (
          <div className='rounded-[14px] bg-green-50 border border-green-200 px-5 py-4 text-[15px] text-green-800'>
            {t("auth.forgotPasswordSent")}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='flex flex-col gap-4.5'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='email' className='text-[13px] font-bold'>
                {t("auth.forgotPasswordEmailLabel")}
              </Label>
              <Input
                id='email'
                type='email'
                placeholder='you@example.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete='email'
                className={INPUT_CLASS}
              />
            </div>

            <Button
              type='submit'
              size='lg'
              className='mt-1.5 w-full font-bold'
              disabled={isSubmitting || !email}
            >
              {isSubmitting
                ? t("auth.forgotPasswordSending")
                : t("auth.forgotPasswordSubmit")}
            </Button>
          </form>
        )}

        <p className='mt-6 text-center text-[14px] text-muted-foreground'>
          <Link
            href='/login'
            className='font-bold text-primary hover:underline'
          >
            {t("auth.forgotPasswordBackToLogin")}
          </Link>
        </p>

        <div className='min-h-6 flex-1' />
      </div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
