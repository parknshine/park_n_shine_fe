"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCustomerAuth } from "@/features/customer/hooks";
import { useCustomerAuthStore } from "@/store/customer-auth-store";
import { useTranslation } from "@/i18n";
import customerApi from "@/lib/axios-customer";
import { queryKeys } from "@/lib/query-keys";

const INPUT_CLASS =
  "h-[52px] rounded-[14px] border-[1.5px] border-[rgba(111,120,125,0.18)] bg-white/70 text-[15px] focus:border-[#1db1f1] focus:ring-[rgba(29,177,241,0.14)]";

function BrandLogo() {
  return (
    <div className='mb-12 mt-12 flex items-center justify-center'>
      <Image
        src='/parknshinelogo.svg'
        width={160}
        height={48}
        alt='Park & Shine'
        priority
        style={{ width: 'auto', height: '48px' }}
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width='20' height='20' viewBox='0 0 24 24' aria-hidden='true'>
      <path
        fill='#4285F4'
        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z'
      />
      <path
        fill='#34A853'
        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z'
      />
      <path
        fill='#FBBC05'
        d='M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z'
      />
      <path
        fill='#EA4335'
        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z'
      />
    </svg>
  );
}

function submitLabel(
  isSubmitting: boolean,
  isRegister: boolean,
  t: (key: string) => string,
) {
  if (isSubmitting) {
    return isRegister ? t("auth.creatingAccount") : t("auth.signingIn");
  }
  return isRegister ? t("auth.signUp") : t("auth.signIn");
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation("customer");
  const { loginEmail, registerEmail, loginGoogle, checkGoogleRedirect, isSubmitting } =
    useCustomerAuth();
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();

  const redirectTo = searchParams.get("redirect") || "/home";
  const claimToken = searchParams.get("claim");
  const [mode, setMode] = useState<"login" | "register">(
    searchParams.get("mode") === "register" ? "register" : "login",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPw, setShowPw] = useState(false);

  const isRegister = mode === "register";

  useEffect(() => {
    if (!isAuthenticated) return;
    claimBookingIfNeeded().then(() => {
      router.replace(redirectTo);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, redirectTo, router]);

  useEffect(() => {
    checkGoogleRedirect()
      .then(async (customer) => {
        if (!customer) return;
        toast.success(t("auth.loginSuccess"));
        await claimBookingIfNeeded();
        router.replace(redirectTo);
      })
      .catch((err) => {
        const key = err instanceof Error ? err.message : "auth.errors.generic";
        toast.error(t(key));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function claimBookingIfNeeded() {
    if (!claimToken) return;
    try {
      await customerApi.post("/v1/me/bookings/claim", {
        bookingToken: claimToken,
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.customer.bookings() });
    } catch {
      // best-effort
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isRegister) {
        if (!phone.trim()) {
          toast.error(t("auth.phoneRequired"));
          return;
        }
        await registerEmail({ email, password });
        try {
          await customerApi.patch("/v1/me", { phone: phone.trim() });
        } catch {
          // non-blocking
        }
        toast.success(t("auth.registerSuccess"));
      } else {
        await loginEmail({ email, password });
        toast.success(t("auth.loginSuccess"));
      }
      await claimBookingIfNeeded();
      router.replace(redirectTo);
    } catch (err) {
      const key = err instanceof Error ? err.message : "auth.errors.generic";
      toast.error(t(key));
    }
  }

  async function handleGoogle() {
    try {
      const customer = await loginGoogle();
      // null = redirect fallback in progress (page navigates away) or popup dismissed.
      if (!customer) return;
      toast.success(t("auth.loginSuccess"));
      await claimBookingIfNeeded();
      router.replace(redirectTo);
    } catch (err) {
      const key = err instanceof Error ? err.message : "auth.errors.generic";
      toast.error(t(key));
    }
  }

  return (
    <main className='flex min-h-dvh flex-col bg-background px-7'>
      <div className='flex flex-1 flex-col mt-12'>
        <h1 className='mb-2 text-[28px] font-extrabold leading-[1.18] tracking-[-0.02em] text-foreground'>
          {t(isRegister ? "auth.registerTitle" : "auth.loginTitle")}
        </h1>
        <p className='mb-7.5 text-[15px] leading-[1.55] text-muted-foreground'>
          {t(isRegister ? "auth.registerSubtitle" : "auth.loginSubtitle")}
        </p>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4.5'>
          {/* Email */}
          <div className='flex flex-col gap-2'>
            <Label htmlFor='email' className='text-[13px] font-bold'>
              {t("auth.emailLabel")}
            </Label>
            <Input
              id='email'
              type='email'
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete='email'
              className={INPUT_CLASS}
            />
          </div>

          {/* Password */}
          <div className='flex flex-col gap-2'>
            <Label htmlFor='password' className='text-[13px] font-bold'>
              {t("auth.passwordLabel")}
            </Label>
            <div className='relative'>
              <Input
                id='password'
                type={showPw ? "text" : "password"}
                placeholder='••••••••'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={isRegister ? "new-password" : "current-password"}
                className={`${INPUT_CLASS} pr-12`}
              />
              <button
                type='button'
                aria-label={
                  showPw ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
                }
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

          {/* Forgot password — sign-in mode only */}
          {!isRegister && (
            <div className='flex justify-end -mt-2'>
              <Link
                href='/forgot-password'
                className='text-[13px] text-primary hover:underline'
              >
                {t("auth.forgotPassword")}
              </Link>
            </div>
          )}

          {/* Phone (register only) */}
          {isRegister && (
            <div className='flex flex-col gap-2'>
              <Label htmlFor='phone' className='text-[13px] font-bold'>
                {t("auth.phoneLabel")}
              </Label>
              <Input
                id='phone'
                type='tel'
                placeholder={t("auth.phonePlaceholder")}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoComplete='tel'
                className={INPUT_CLASS}
              />
            </div>
          )}

          <Button
            type='submit'
            size='lg'
            className='mt-1.5 w-full font-bold'
            disabled={
              isSubmitting || !email || !password || (isRegister && !phone)
            }
          >
            {submitLabel(isSubmitting, isRegister, t)}
          </Button>
        </form>

        {/* Divider */}
        <div className='my-5.5 flex items-center gap-3.5'>
          <span className='h-px flex-1 bg-[rgba(111,120,125,0.18)]' />
          <span className='text-[12px] font-bold tracking-[0.08em] text-muted-foreground'>
            {t("auth.or")}
          </span>
          <span className='h-px flex-1 bg-[rgba(111,120,125,0.18)]' />
        </div>

        {/* Google */}
        <Button
          type='button'
          variant='outline'
          size='lg'
          className='w-full bg-white font-bold shadow-[0_8px_20px_rgba(0,98,137,0.06)]'
          onClick={handleGoogle}
          disabled={isSubmitting}
          prefix={<GoogleIcon />}
        >
          {t("auth.continueWithGoogle")}
        </Button>

        {/* Mode toggle */}
        <p className='mt-5.5 text-center text-[14px] text-muted-foreground'>
          {t(isRegister ? "auth.haveAccount" : "auth.noAccount")}{" "}
          <button
            type='button'
            className='cursor-pointer font-bold text-primary hover:underline'
            onClick={() => setMode(isRegister ? "login" : "register")}
          >
            {t(isRegister ? "auth.toLogin" : "auth.toRegister")}
          </button>
        </p>

        <div className='min-h-6 flex-1' />
      </div>
    </main>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
