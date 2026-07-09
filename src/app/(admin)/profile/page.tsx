"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { UserCircle, KeyRound, ShieldCheck, LogOut } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "@/i18n";
import api from "@/lib/axios-admin";
import { useAuthStore } from "@/store/auth-store";
import { useAdminAuth } from "@/features/admin/hooks";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  PasswordField,
  PasswordRules,
  isPasswordValid,
} from "@/features/admin/components/password-field";

export default function AdminProfilePage() {
  const { t } = useTranslation("admin");
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const { logout } = useAdminAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const changePassword = useMutation({
    mutationFn: async () => {
      await api.post("/v1/admin/me/password", { currentPassword, newPassword });
    },
    onSuccess: () => {
      // Backend revokes all sessions on password change — force re-login
      toast.success(t("profilePage.changePassword.success"));
      logout();
    },
    onError: (err) => {
      setFormError(err instanceof Error ? err.message : String(err));
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    changePassword.mutate();
  }

  const avatarLetter = (user?.name ?? user?.email ?? "A").charAt(0).toUpperCase();
  const roleLabel =
    role === "super_admin"
      ? t("usersPage.roles.superAdmin")
      : t("usersPage.roles.admin");

  return (
    <div className='mx-auto max-w-4xl space-y-6'>
      <div className='flex items-center gap-2'>
        <UserCircle className='h-5 w-5 text-primary' />
        <h1 className='text-xl font-semibold'>{t("profilePage.title")}</h1>
      </div>

      <div className='grid gap-6 lg:grid-cols-[300px_1fr] lg:items-start'>
        {/* Identity panel */}
        <div className='overflow-hidden rounded-lg border border-border bg-background'>
          <div className='flex flex-col items-center gap-3 border-b border-border bg-primary/5 px-6 py-8'>
            <div className='flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-3xl font-semibold text-primary ring-4 ring-background'>
              {avatarLetter}
            </div>
            <div className='min-w-0 text-center'>
              <p className='truncate text-base font-semibold text-foreground'>
                {user?.name}
              </p>
              <p className='truncate text-sm text-muted-foreground'>
                {user?.email}
              </p>
            </div>
            <Badge variant={role === "super_admin" ? "default" : "secondary"}>
              {roleLabel}
            </Badge>
          </div>
          <div className='px-6 py-4'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='w-full gap-1.5'
              onClick={logout}
            >
              <LogOut className='h-3.5 w-3.5' />
              {t("common.logout")}
            </Button>
          </div>
        </div>

        {/* Change password panel */}
        <div className='rounded-lg border border-border bg-background'>
          <div className='border-b border-border px-6 py-4'>
            <div className='flex items-center gap-2'>
              <KeyRound className='h-4 w-4 text-primary' />
              <h2 className='text-base font-semibold'>
                {t("profilePage.changePassword.title")}
              </h2>
            </div>
            <p className='mt-1 text-sm text-muted-foreground'>
              {t("profilePage.changePassword.description")}
            </p>
          </div>
          <form onSubmit={handleSubmit} className='space-y-4 px-6 py-5'>
            <div className='space-y-1'>
              <Label htmlFor='current-password'>
                {t("profilePage.changePassword.currentLabel")}
              </Label>
              <PasswordField
                id='current-password'
                value={currentPassword}
                onChange={setCurrentPassword}
              />
            </div>
            <div className='space-y-1'>
              <Label htmlFor='new-password'>
                {t("profilePage.changePassword.newLabel")}
              </Label>
              <PasswordField
                id='new-password'
                value={newPassword}
                onChange={setNewPassword}
              />
              <PasswordRules password={newPassword} />
            </div>
            {formError && (
              <p className='text-sm text-destructive'>{formError}</p>
            )}
            <div className='flex items-start gap-2 rounded-md bg-muted/60 px-3 py-2.5'>
              <ShieldCheck className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' />
              <p className='text-xs text-muted-foreground'>
                {t("profilePage.changePassword.reloginHint")}
              </p>
            </div>
            <Button
              type='submit'
              disabled={
                changePassword.isPending ||
                !currentPassword ||
                !isPasswordValid(newPassword)
              }
            >
              {changePassword.isPending
                ? t("profilePage.changePassword.submitting")
                : t("profilePage.changePassword.submit")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
