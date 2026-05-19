"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCrewSession } from "@/features/crew/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function CrewLoginPage() {
  const router = useRouter();
  const { login, session, isLoading, error } = useCrewSession();

  const [shiftCode, setShiftCode] = useState("");
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (session) {
      router.replace("/crew/home");
    }
  }, [session, router]);

  const canSubmit = shiftCode.length === 6 && pin.length > 0 && !isLoading;

  function handleShiftCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    setShiftCode(digits.slice(0, 6));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      await login({ shiftCode, pin });
      router.replace("/crew/home");
    } catch {
      // error is surfaced via the `error` field from useCrewSession
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-sm">
        {/* ── Logo & wordmark ── */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary"
          >
            <Image
              src="/icons/icon.svg"
              width={48}
              height={48}
              alt="Park & Shine logo"
              priority
            />
          </div>
          <div className="text-center">
            <p
              className="text-xs font-semibold uppercase tracking-[0.12em] text-primary"
            >
              Crew Portal
            </p>
            <h1
              className="mt-0.5 text-2xl font-medium leading-tight text-foreground"
            >
              Park &amp; Shine
            </h1>
          </div>
        </div>

        {/* ── Login card ── */}
        <div
          className="rounded-xl border border-border bg-white px-6 py-8 shadow-sm"
        >
          <div className="mb-6">
            <h2
              className="text-lg font-medium text-foreground"
            >
              Sign in to your shift
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your shift code and PIN to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {/* Shift Code */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="shiftCode"
                className="text-sm font-medium text-foreground"
              >
                Shift Code
              </Label>
              <Input
                id="shiftCode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit code"
                value={shiftCode}
                onChange={handleShiftCodeChange}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                className={cn(
                  "h-11 rounded-md border text-base font-medium tracking-[0.2em] placeholder:tracking-normal",
                  "focus:ring-2",
                  error
                    ? "border-destructive focus:ring-destructive/30"
                    : "border-muted-foreground/40 focus:border-primary focus:ring-primary/20"
                )}
              />
            </div>

            {/* PIN */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="pin"
                className="text-sm font-medium text-foreground"
              >
                PIN
              </Label>
              <Input
                id="pin"
                type="password"
                placeholder="Enter your PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                autoComplete="current-password"
                className={cn(
                  "h-11 rounded-md border text-base",
                  "focus:ring-2",
                  error
                    ? "border-destructive focus:ring-destructive/30"
                    : "border-muted-foreground/40 focus:border-primary focus:ring-primary/20"
                )}
              />
            </div>

            {/* Inline error */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5"
              >
                <svg
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <circle cx="8" cy="8" r="7.25" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M8 4.5v4M8 10.5v1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                "mt-1 h-11 w-full rounded-md text-sm font-semibold uppercase tracking-[0.07em]",
                "transition-colors",
                canSubmit && "bg-primary text-primary-foreground"
              )}
              prefix={
                isLoading ? (
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeOpacity="0.25"
                    />
                    <path
                      d="M12 2a10 10 0 0 1 10 10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : undefined
              }
            >
              {isLoading ? "Signing in…" : "Sign In"}
            </Button>
          </form>
        </div>

        {/* ── Footer note ── */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Crew access only &mdash; not a customer portal
        </p>
      </div>
    </main>
  );
}

export default CrewLoginPage;
