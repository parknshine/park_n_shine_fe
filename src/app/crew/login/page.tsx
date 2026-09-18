"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import { useCrewSession } from "@/features/crew/hooks";
import { fetchCrewSession } from "@/features/crew/hooks/use-crew-session";
import api from "@/lib/axios-crew";
import { useCrewAuthStore } from "@/store/crew-auth-store";
import { useTranslation } from "@/i18n";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CrewLoginPage() {
  const { t } = useTranslation("crew");
  const { login, session, isLoading: isLoggingIn } = useCrewSession();
  const hasHydrated = useCrewAuthStore((s) => s._hasHydrated);
  const clearCrewSession = useCrewAuthStore((s) => s.clearCrewSession);

  const [shiftCode, setShiftCode] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  // Keeps the spinner visible after the login mutation resolves but before
  // router.replace("/crew/home") finishes navigating. Without this, there's a
  // visible gap where the form shows without the loading state (mutation.isPending
  // is already false, yet navigation hasn't completed).
  const [isRedirecting, setIsRedirecting] = useState(false);
  const isBusy = isLoggingIn || isRedirecting;

  useEffect(() => {
    if (!hasHydrated || !session || isRedirecting) return;
    let cancelled = false;
    // The persisted store can outlive the stored crew token (e.g. overnight).
    // Confirm the server session is alive before auto-redirecting. Dead
    // session → drop the stale store instead.
    fetchCrewSession(api).then((live) => {
      if (cancelled) return;
      if (live) {
        setIsRedirecting(true);
        window.location.replace("/crew/home");
      } else {
        clearCrewSession();
      }
    });
    return () => {
      cancelled = true;
    };
  }, [hasHydrated, session, isRedirecting, clearCrewSession]);

  const canSubmit = shiftCode.length === 6 && pin.length > 0 && !isBusy;

  function handleShiftCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    setShiftCode(digits.slice(0, 6));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      await login({ shiftCode, pin });
      setIsRedirecting(true);
      window.location.replace("/crew/home");
    } catch (err) {
      const code = (err as { code?: string }).code;
      let msgKey = "login.errors.default";
      // Server now returns a single CREW_INVALID_CREDENTIALS for both wrong shift
      // code and wrong PIN (F-01). Old codes kept for backward-compat.
      if (code === "CREW_INVALID_CREDENTIALS")
        msgKey = "login.errors.invalidCredentials";
      if (code === "CREW_INVALID_SHIFT_CODE")
        msgKey = "login.errors.shiftCodeInvalid";
      if (code === "CREW_INVALID_PIN") msgKey = "login.errors.pinInvalid";
      toast.error(t(msgKey));
    }
  }

  return (
    <main className='flex min-h-dvh flex-col items-center justify-center bg-white px-4 py-10'>
      <div className='absolute right-4 top-4'>
        <LanguageSwitcher />
      </div>
      <div className='w-full max-w-sm'>
        {/* ── Logo & wordmark ── */}
        <div className='mb-10 flex flex-col items-center gap-3'>
          <Image
            src='/parknshinelogo.svg'
            width={160}
            height={48}
            alt='Park & Shine logo'
            priority
            style={{ width: "auto", height: "48px" }}
          />
          <div className='text-center'>
            <p className='text-xs font-semibold uppercase tracking-[0.12em] text-primary'>
              {t("login.portalLabel")}
            </p>
            <h1 className='mt-0.5 text-2xl font-medium leading-tight text-foreground'>
              Park &amp; Shine
            </h1>
          </div>
        </div>

        {/* ── Login card ── */}
        <div className='rounded-xl border border-border bg-white px-6 py-8 shadow-sm'>
          <div className='mb-6'>
            <h2 className='text-lg font-medium text-foreground'>
              {t("login.title")}
            </h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              {t("login.subtitle")}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className='flex flex-col gap-5'
          >
            {/* Shift Code */}
            <div className='flex flex-col gap-1.5'>
              <Label
                htmlFor='shiftCode'
                className='text-sm font-medium text-foreground'
              >
                {t("login.shiftCodeLabel")}
              </Label>
              <Input
                id='shiftCode'
                type='text'
                inputMode='numeric'
                maxLength={6}
                placeholder={t("login.shiftCodePlaceholder")}
                value={shiftCode}
                onChange={handleShiftCodeChange}
                autoComplete='off'
                autoCorrect='off'
                spellCheck={false}
                className='h-11 rounded-md border border-muted-foreground/40 text-base font-medium tracking-[0.2em] placeholder:tracking-normal focus:ring-2 focus:border-primary focus:ring-primary/20'
              />
            </div>

            {/* PIN */}
            <div className='flex flex-col gap-1.5'>
              <Label
                htmlFor='pin'
                className='text-sm font-medium text-foreground'
              >
                {t("login.pinLabel")}
              </Label>
              <div className='relative'>
                <Input
                  id='pin'
                  type={showPin ? "text" : "password"}
                  placeholder={t("login.pinPlaceholder")}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  autoComplete='current-password'
                  className='h-11 rounded-md border border-muted-foreground/40 pr-10 text-base focus:ring-2 focus:border-primary focus:ring-primary/20'
                />
                <button
                  type='button'
                  onClick={() => setShowPin((v) => !v)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                  tabIndex={-1}
                  aria-label={showPin ? "Hide PIN" : "Show PIN"}
                >
                  {showPin ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type='submit'
              disabled={!canSubmit}
              className='mt-1 h-11 w-full rounded-md text-sm font-semibold uppercase tracking-[0.07em]'
              prefix={
                isBusy ? (
                  <svg
                    aria-hidden='true'
                    className='h-4 w-4 animate-spin'
                    viewBox='0 0 24 24'
                    fill='none'
                  >
                    <circle
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='3'
                      strokeOpacity='0.25'
                    />
                    <path
                      d='M12 2a10 10 0 0 1 10 10'
                      stroke='currentColor'
                      strokeWidth='3'
                      strokeLinecap='round'
                    />
                  </svg>
                ) : undefined
              }
            >
              {isBusy ? t("login.signingIn") : t("login.signIn")}
            </Button>
          </form>
        </div>

        {/* ── Footer note ── */}
        <p className='mt-8 text-center text-xs text-muted-foreground'>
          {t("login.footerNote")}
        </p>
      </div>
    </main>
  );
}

export default CrewLoginPage;
