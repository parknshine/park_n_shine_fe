"use client";

import { useState } from "react";
import { Shield, Plus, Pencil, RotateCcw, UserX } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAdminUsers,
  useCreateAdminUser,
  useUpdateAdminUser,
  useDeactivateAdminUser,
  useResetAdminPassword,
  type AdminUser,
} from "@/features/admin/hooks/use-admin-users";
import { ADMIN_MENUS, type MenuAccessMap, type MenuAccessLevel } from "@/lib/menu-access";
import {
  PasswordField,
  PasswordRules,
  isPasswordValid,
} from "@/features/admin/components/password-field";

type ModalState =
  | { type: "create" }
  | { type: "edit"; user: AdminUser }
  | { type: "reset"; user: AdminUser }
  | null;

function MenuAccessEditor({
  value,
  onChange,
}: Readonly<{
  value: MenuAccessMap;
  onChange: (value: MenuAccessMap) => void;
}>) {
  const { t } = useTranslation("admin");
  return (
    <div className='space-y-1'>
      <Label>{t("usersPage.menuAccess.title")}</Label>
      <div className='max-h-48 space-y-2 overflow-y-auto rounded-md border border-border p-3'>
        {ADMIN_MENUS.map(({ href, key }) => (
          <div key={href} className='flex items-center justify-between gap-3'>
            <span className='text-sm'>{t(key)}</span>
            <Select
              value={value[href] ?? "write"}
              onValueChange={(v) =>
                onChange({ ...value, [href]: v as MenuAccessLevel })
              }
            >
              <SelectTrigger className='w-36'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='write'>
                  {t("usersPage.menuAccess.full")}
                </SelectItem>
                <SelectItem value='read'>
                  {t("usersPage.menuAccess.readonly")}
                </SelectItem>
                <SelectItem value='none'>
                  {t("usersPage.menuAccess.hidden")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserRowActions({
  user,
  onEdit,
  onReset,
  onDeactivate,
  isPending,
}: Readonly<{
  user: AdminUser;
  onEdit: (user: AdminUser) => void;
  onReset: (user: AdminUser) => void;
  onDeactivate: (id: string) => void;
  isPending: boolean;
}>) {
  return (
    <div className='flex justify-end gap-2'>
      <Button variant='ghost' size='sm' onClick={() => onEdit(user)}>
        <Pencil className='h-4 w-4' />
      </Button>
      <Button variant='ghost' size='sm' onClick={() => onReset(user)}>
        <RotateCcw className='h-4 w-4' />
      </Button>
      {user.active && (
        <Button
          variant='ghost'
          size='sm'
          disabled={isPending}
          onClick={() => onDeactivate(user.id)}
        >
          <UserX className='h-4 w-4 text-destructive' />
        </Button>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  const { t } = useTranslation("admin");
  const { data: users, isLoading } = useAdminUsers();
  const createUser = useCreateAdminUser();
  const updateUser = useUpdateAdminUser();
  const deactivateUser = useDeactivateAdminUser();
  const resetPassword = useResetAdminPassword();

  const [modal, setModal] = useState<ModalState>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin" as "super_admin" | "admin",
    menuAccess: {} as MenuAccessMap,
  });
  const [newPassword, setNewPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  function toMessage(err: unknown): string {
    return err instanceof Error ? err.message : String(err);
  }

  function openCreate() {
    setForm({ name: "", email: "", password: "", role: "admin", menuAccess: {} });
    setFormError(null);
    setModal({ type: "create" });
  }

  function openEdit(user: AdminUser) {
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      menuAccess: user.menuAccess ?? {},
    });
    setFormError(null);
    setModal({ type: "edit", user });
  }

  function openReset(user: AdminUser) {
    setNewPassword("");
    setFormError(null);
    setModal({ type: "reset", user });
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await createUser.mutateAsync({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        ...(form.role === "admin" ? { menuAccess: form.menuAccess } : {}),
      });
      setModal(null);
    } catch (err) {
      setFormError(toMessage(err));
    }
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (modal?.type !== "edit") return;
    try {
      await updateUser.mutateAsync({
        id: modal.user.id,
        name: form.name,
        email: form.email,
        role: form.role,
        ...(form.role === "admin" ? { menuAccess: form.menuAccess } : {}),
      });
      if (form.password) {
        await resetPassword.mutateAsync({
          id: modal.user.id,
          newPassword: form.password,
        });
      }
      setModal(null);
    } catch (err) {
      setFormError(toMessage(err));
    }
  }

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (modal?.type !== "reset") return;
    try {
      await resetPassword.mutateAsync({ id: modal.user.id, newPassword });
      setModal(null);
    } catch (err) {
      setFormError(toMessage(err));
    }
  }

  async function handleDeactivate(id: string) {
    if (!confirm(t("usersPage.confirm.deactivate"))) return;
    await deactivateUser.mutateAsync(id);
  }

  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: "name",
      header: t("usersPage.table.name"),
      cell: ({ row }) => (
        <span className='font-medium'>{row.original.name}</span>
      ),
    },
    {
      accessorKey: "email",
      header: t("usersPage.table.email"),
      cell: ({ row }) => (
        <span className='text-muted-foreground'>{row.original.email}</span>
      ),
    },
    {
      accessorKey: "role",
      header: t("usersPage.table.role"),
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.role === "super_admin" ? "default" : "secondary"
          }
        >
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: "active",
      header: t("usersPage.table.status"),
      cell: ({ row }) => (
        <Badge variant={row.original.active ? "default" : "destructive"}>
          {row.original.active
            ? t("usersPage.status.active")
            : t("usersPage.status.inactive")}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <UserRowActions
          user={row.original}
          onEdit={openEdit}
          onReset={openReset}
          onDeactivate={handleDeactivate}
          isPending={deactivateUser.isPending}
        />
      ),
    },
  ];

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Shield className='h-5 w-5 text-primary' />
          <h1 className='text-xl font-semibold'>{t("usersPage.title")}</h1>
        </div>
        <Button onClick={openCreate} size='sm'>
          <Plus className='mr-2 h-4 w-4' />
          {t("usersPage.addAdmin")}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={users ?? []}
        isLoading={isLoading}
        emptyMessage={t("usersPage.empty")}
        searchPlaceholder={t("usersPage.search")}
      />

      {/* Create Modal */}
      {modal?.type === "create" && (
        <div className='fixed inset-0 z-40 flex items-center justify-center bg-black/40'>
          <div className='w-full max-w-md rounded-lg bg-background border border-border p-6 shadow-lg space-y-4'>
            <h2 className='text-base font-semibold text-foreground'>
              {t("usersPage.add.title")}
            </h2>
            <form onSubmit={handleCreate} className='space-y-3'>
              <div className='space-y-1'>
                <Label htmlFor='create-name'>
                  {t("usersPage.add.nameLabel")}
                </Label>
                <Input
                  id='create-name'
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='create-email'>
                  {t("usersPage.add.emailLabel")}
                </Label>
                <Input
                  id='create-email'
                  type='email'
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='create-password'>
                  {t("usersPage.add.passwordLabel")}
                </Label>
                <PasswordField
                  id='create-password'
                  value={form.password}
                  onChange={(v) => setForm((f) => ({ ...f, password: v }))}
                />
                <PasswordRules password={form.password} />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='create-role'>
                  {t("usersPage.add.roleLabel")}
                </Label>
                <Select
                  value={form.role}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      role: v as "super_admin" | "admin",
                    }))
                  }
                >
                  <SelectTrigger id='create-role'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='admin'>
                      {t("usersPage.roles.admin")}
                    </SelectItem>
                    <SelectItem value='super_admin'>
                      {t("usersPage.roles.superAdmin")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.role === "admin" && (
                <MenuAccessEditor
                  value={form.menuAccess}
                  onChange={(menuAccess) => setForm((f) => ({ ...f, menuAccess }))}
                />
              )}
              {formError && (
                <p className='text-sm text-destructive'>{formError}</p>
              )}
              <div className='flex gap-2 pt-2'>
                <Button
                  type='submit'
                  disabled={createUser.isPending || !isPasswordValid(form.password)}
                >
                  {createUser.isPending
                    ? t("usersPage.add.creating")
                    : t("usersPage.add.create")}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setModal(null)}
                >
                  {t("usersPage.add.cancel")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {modal?.type === "edit" && (
        <div className='fixed inset-0 z-40 flex items-center justify-center bg-black/40'>
          <div className='w-full max-w-md rounded-lg bg-background border border-border p-6 shadow-lg space-y-4'>
            <h2 className='text-base font-semibold text-foreground'>
              {t("usersPage.edit.title")}
            </h2>
            <form onSubmit={handleEdit} className='space-y-3'>
              <div className='space-y-1'>
                <Label htmlFor='edit-name'>
                  {t("usersPage.edit.nameLabel")}
                </Label>
                <Input
                  id='edit-name'
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='edit-email'>
                  {t("usersPage.edit.emailLabel")}
                </Label>
                <Input
                  id='edit-email'
                  type='email'
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='edit-role'>
                  {t("usersPage.edit.roleLabel")}
                </Label>
                <Select
                  value={form.role}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      role: v as "super_admin" | "admin",
                    }))
                  }
                >
                  <SelectTrigger id='edit-role'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='admin'>
                      {t("usersPage.roles.admin")}
                    </SelectItem>
                    <SelectItem value='super_admin'>
                      {t("usersPage.roles.superAdmin")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-1'>
                <Label htmlFor='edit-password'>
                  {t("usersPage.edit.newPasswordLabel")}
                </Label>
                <PasswordField
                  id='edit-password'
                  value={form.password}
                  onChange={(v) => setForm((f) => ({ ...f, password: v }))}
                  required={false}
                />
                <PasswordRules password={form.password} />
              </div>
              {form.role === "admin" && (
                <MenuAccessEditor
                  value={form.menuAccess}
                  onChange={(menuAccess) => setForm((f) => ({ ...f, menuAccess }))}
                />
              )}
              {formError && (
                <p className='text-sm text-destructive'>{formError}</p>
              )}
              <div className='flex gap-2 pt-2'>
                <Button
                  type='submit'
                  disabled={
                    updateUser.isPending ||
                    resetPassword.isPending ||
                    (form.password !== "" && !isPasswordValid(form.password))
                  }
                >
                  {updateUser.isPending || resetPassword.isPending
                    ? t("usersPage.edit.saving")
                    : t("usersPage.edit.save")}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setModal(null)}
                >
                  {t("usersPage.edit.cancel")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {modal?.type === "reset" && (
        <div className='fixed inset-0 z-40 flex items-center justify-center bg-black/40'>
          <div className='w-full max-w-md rounded-lg bg-background border border-border p-6 shadow-lg space-y-4'>
            <h2 className='text-base font-semibold text-foreground'>
              {t("usersPage.resetPassword.title")}
            </h2>
            <form onSubmit={handleReset} className='space-y-3'>
              <div className='space-y-1'>
                <Label htmlFor='reset-password'>
                  {t("usersPage.resetPassword.passwordLabel")}
                </Label>
                <PasswordField
                  id='reset-password'
                  value={newPassword}
                  onChange={setNewPassword}
                />
                <PasswordRules password={newPassword} />
              </div>
              {formError && (
                <p className='text-sm text-destructive'>{formError}</p>
              )}
              <div className='flex gap-2 pt-2'>
                <Button
                  type='submit'
                  disabled={resetPassword.isPending || !isPasswordValid(newPassword)}
                >
                  {resetPassword.isPending
                    ? t("usersPage.resetPassword.resetting")
                    : t("usersPage.resetPassword.reset")}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setModal(null)}
                >
                  {t("usersPage.resetPassword.cancel")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
