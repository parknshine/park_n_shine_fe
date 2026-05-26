"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/features/admin/hooks";
import { useTranslation } from "@/i18n";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isSubmitting, error } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (token) router.replace("/dashboard");
  }, [router]);
  const { t } = useTranslation("admin");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login({ email, password });
    } catch {
      toast.error(t("login.loginFailed"));
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("login.title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("login.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">{t("login.emailLabel")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("login.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">{t("login.passwordLabel")}</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !email || !password}
          >
            {isSubmitting ? t("login.signingIn") : t("login.signIn")}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          {t("login.mockCredentials")}
        </p>
      </div>
    </main>
  );
}
