"use client";

import { useState } from "react";
import { Shield, Plus, Pencil, RotateCcw, UserX } from "lucide-react";
import { useTranslation } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

type ModalState =
  | { type: "create" }
  | { type: "edit"; user: AdminUser }
  | { type: "reset"; user: AdminUser }
  | null;

export default function AdminUsersPage() {
  const { t } = useTranslation("admin");
  const { data: users, isLoading } = useAdminUsers();
  const createUser = useCreateAdminUser();
  const updateUser = useUpdateAdminUser();
  const deactivateUser = useDeactivateAdminUser();
  const resetPassword = useResetAdminPassword();

  const [modal, setModal] = useState<ModalState>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "admin" as "super_admin" | "admin" });
  const [newPassword, setNewPassword] = useState("");

  function openCreate() {
    setForm({ name: "", email: "", password: "", role: "admin" });
    setModal({ type: "create" });
  }

  function openEdit(user: AdminUser) {
    setForm({ name: user.name, email: user.email, password: "", role: user.role });
    setModal({ type: "edit", user });
  }

  function openReset(user: AdminUser) {
    setNewPassword("");
    setModal({ type: "reset", user });
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await createUser.mutateAsync({ name: form.name, email: form.email, password: form.password, role: form.role });
      setModal(null);
    } catch {
      // error surfaced by mutation/toast layer; keep modal open
    }
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (modal?.type !== "edit") return;
    try {
      await updateUser.mutateAsync({ id: modal.user.id, name: form.name, email: form.email, role: form.role });
      setModal(null);
    } catch {
      // error surfaced by mutation/toast layer; keep modal open
    }
  }

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (modal?.type !== "reset") return;
    try {
      await resetPassword.mutateAsync({ id: modal.user.id, newPassword });
      setModal(null);
    } catch {
      // error surfaced by mutation/toast layer; keep modal open
    }
  }

  async function handleDeactivate(id: string) {
    if (!confirm(t("usersPage.confirm.deactivate"))) return;
    await deactivateUser.mutateAsync(id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold">{t("usersPage.title")}</h1>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          {t("usersPage.addAdmin")}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("usersPage.loading")}</p>
      ) : (
        <div className="rounded-md border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("usersPage.table.name")}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("usersPage.table.email")}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("usersPage.table.role")}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("usersPage.table.status")}</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t("usersPage.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.role === "super_admin" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.active ? "default" : "destructive"}>
                      {user.active ? t("usersPage.status.active") : t("usersPage.status.inactive")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openReset(user)}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      {user.active && (
                        <Button variant="ghost" size="sm" onClick={() => handleDeactivate(user.id)}>
                          <UserX className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {modal?.type === "create" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-background border border-border p-6 shadow-lg space-y-4">
            <h2 className="text-base font-semibold text-foreground">{t("usersPage.add.title")}</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="create-name">{t("usersPage.add.nameLabel")}</Label>
                <Input
                  id="create-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="create-email">{t("usersPage.add.emailLabel")}</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="create-password">{t("usersPage.add.passwordLabel")}</Label>
                <Input
                  id="create-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="create-role">{t("usersPage.add.roleLabel")}</Label>
                <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v as "super_admin" | "admin" }))}>
                  <SelectTrigger id="create-role"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">admin</SelectItem>
                    <SelectItem value="super_admin">super_admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={createUser.isPending}>
                  {createUser.isPending ? t("usersPage.add.creating") : t("usersPage.add.create")}
                </Button>
                <Button type="button" variant="outline" onClick={() => setModal(null)}>
                  {t("usersPage.add.cancel")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {modal?.type === "edit" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-background border border-border p-6 shadow-lg space-y-4">
            <h2 className="text-base font-semibold text-foreground">{t("usersPage.edit.title")}</h2>
            <form onSubmit={handleEdit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="edit-name">{t("usersPage.edit.nameLabel")}</Label>
                <Input
                  id="edit-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-email">{t("usersPage.edit.emailLabel")}</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-role">{t("usersPage.edit.roleLabel")}</Label>
                <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v as "super_admin" | "admin" }))}>
                  <SelectTrigger id="edit-role"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">admin</SelectItem>
                    <SelectItem value="super_admin">super_admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={updateUser.isPending}>
                  {updateUser.isPending ? t("usersPage.edit.saving") : t("usersPage.edit.save")}
                </Button>
                <Button type="button" variant="outline" onClick={() => setModal(null)}>
                  {t("usersPage.edit.cancel")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {modal?.type === "reset" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-background border border-border p-6 shadow-lg space-y-4">
            <h2 className="text-base font-semibold text-foreground">{t("usersPage.resetPassword.title")}</h2>
            <form onSubmit={handleReset} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="reset-password">{t("usersPage.resetPassword.passwordLabel")}</Label>
                <Input
                  id="reset-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={resetPassword.isPending || newPassword.length < 8}>
                  {resetPassword.isPending ? t("usersPage.resetPassword.resetting") : t("usersPage.resetPassword.reset")}
                </Button>
                <Button type="button" variant="outline" onClick={() => setModal(null)}>
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
