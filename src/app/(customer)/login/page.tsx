"use client";

import { Suspense, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCustomerAuth } from "@/features/customer/hooks";
import { useCustomerAuthStore } from "@/store/customer-auth-store";
import { useTranslation } from "@/i18n";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation("customer");
  const { loginEmail, registerEmail, loginGoogle, isSubmitting } =
    useCustomerAuth();
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);

  const redirectTo = searchParams.get("redirect") || "/";
  const [mode, setMode] = useState<"login" | "register">(
    searchParams.get("mode") === "register" ? "register" : "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Already signed in → leave the auth screen.
  useEffect(() => {
    if (isAuthenticated) router.replace(redirectTo);
  }, [isAuthenticated, redirectTo, router]);

  const isRegister = mode === "register";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isRegister) {
        await registerEmail({ email, password });
        toast.success(t("auth.registerSuccess"));
      } else {
        await loginEmail({ email, password });
        toast.success(t("auth.loginSuccess"));
      }
      router.replace(redirectTo);
    } catch (err) {
      const key = err instanceof Error ? err.message : "auth.errors.generic";
      toast.error(t(key));
    }
  }

  async function handleGoogle() {
    try {
      await loginGoogle();
      toast.success(t("auth.loginSuccess"));
      router.replace(redirectTo);
    } catch (err) {
      const key = err instanceof Error ? err.message : "auth.errors.generic";
      toast.error(t(key));
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t(isRegister ? "auth.registerTitle" : "auth.loginTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t(isRegister ? "auth.registerSubtitle" : "auth.loginSubtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">{t("auth.emailLabel")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">{t("auth.passwordLabel")}</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !email || !password}
          >
            {isSubmitting
              ? t(isRegister ? "auth.creatingAccount" : "auth.signingIn")
              : t(isRegister ? "auth.signUp" : "auth.signIn")}
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase text-muted-foreground">
            {t("auth.or")}
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogle}
          disabled={isSubmitting}
          prefix={<GoogleIcon />}
        >
          {t("auth.continueWithGoogle")}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {t(isRegister ? "auth.haveAccount" : "auth.noAccount")}{" "}
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => setMode(isRegister ? "login" : "register")}
          >
            {t(isRegister ? "auth.toLogin" : "auth.toRegister")}
          </button>
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
