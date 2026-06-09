"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { UserPlus, Pencil, ToggleLeft, ToggleRight, Phone, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/i18n";
import { useAdminCrew, useDeleteCrew } from "@/features/admin/hooks";
import type { AdminCrewMember } from "@/features/admin/types";

function CreateCrewModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation("admin");
  const { create, isCreating } = useAdminCrew();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [phone, setPhone] = useState("");

  async function handleSubmit() {
    if (!name.trim() || !pin.match(/^\d{4,8}$/)) {
      toast.error(t("crewPage.toast.nameRequired"));
      return;
    }
    if (phone && !phone.match(/^(\+62|62|0)8\d{8,11}$/)) {
      toast.error(t("crewPage.toast.invalidWhatsapp"));
      return;
    }
    try {
      await create({ name: name.trim(), pin, ...(phone ? { phone } : {}) });
      setName("");
      setPin("");
      setPhone("");
      onClose();
    } catch {
      toast.error(t("crewPage.toast.addFailed"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("crewPage.add.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="crew-name">{t("crewPage.add.nameLabel")}</Label>
            <Input id="crew-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("crewPage.add.namePlaceholder")} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="crew-pin">{t("crewPage.add.pinLabel")}</Label>
            <Input id="crew-pin" type="password" inputMode="numeric" maxLength={8} value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="crew-phone">
              {t("crewPage.add.whatsappLabel")} <span className="text-muted-foreground">{t("crewPage.add.whatsappOptional")}</span>
            </Label>
            <Input
              id="crew-phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08123456789"
            />
            <p className="text-xs text-muted-foreground">{t("crewPage.add.whatsappHelper")}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t("crewPage.add.cancel")}</Button>
          <Button onClick={handleSubmit} disabled={isCreating}>
            {isCreating ? t("crewPage.add.saving") : t("crewPage.add.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditCrewModal({
  crew,
  onClose,
}: {
  crew: AdminCrewMember;
  onClose: () => void;
}) {
  const { t } = useTranslation("admin");
  const { update, isUpdating } = useAdminCrew();
  const [name, setName] = useState(crew.name);
  const [pin, setPin] = useState("");
  const [phone, setPhone] = useState(crew.phone ?? "");

  async function handleSubmit() {
    if (pin && !pin.match(/^\d{4,8}$/)) {
      toast.error(t("crewPage.toast.pinRequired"));
      return;
    }
    if (phone && !phone.match(/^(\+62|62|0)8\d{8,11}$/)) {
      toast.error(t("crewPage.toast.invalidWhatsapp"));
      return;
    }
    try {
      await update({
        crewId: crew.id,
        payload: {
          name: name.trim(),
          ...(pin ? { pin } : {}),
          phone: phone.trim() || undefined,
        },
      });
      onClose();
    } catch {
      toast.error(t("crewPage.toast.updateFailed"));
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("crewPage.edit.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>{t("crewPage.edit.nameLabel")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>{t("crewPage.edit.pinLabel")} <span className="text-muted-foreground">{t("crewPage.edit.pinHint")}</span></Label>
            <Input type="password" inputMode="numeric" maxLength={8} value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" />
          </div>
          <div className="space-y-1">
            <Label>
              {t("crewPage.edit.whatsappLabel")} <span className="text-muted-foreground">{t("crewPage.edit.whatsappOptional")}</span>
            </Label>
            <Input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08123456789"
            />
            <p className="text-xs text-muted-foreground">{t("crewPage.edit.whatsappHelper")}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t("crewPage.edit.cancel")}</Button>
          <Button onClick={handleSubmit} disabled={isUpdating}>
            {isUpdating ? t("crewPage.edit.saving") : t("crewPage.edit.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CrewPage() {
  const { t } = useTranslation("admin");
  const { crew, isLoading, update } = useAdminCrew();
  const deleteCrew = useDeleteCrew();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AdminCrewMember | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(t("crewPage.confirm.deactivate", { name }))) return;
    setDeletingId(id);
    try {
      await deleteCrew.mutateAsync(id);
      toast.success(t("crewPage.toast.deactivated"));
    } catch {
      toast.error(t("crewPage.toast.deactivateFailed"));
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) return <p className="text-muted-foreground">{t("crewPage.loading")}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("crewPage.title")}</h1>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          {t("crewPage.addCrew")}
        </Button>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-2 text-left font-medium">{t("crewPage.table.name")}</th>
              <th className="px-4 py-2 text-left font-medium">{t("crewPage.table.whatsapp")}</th>
              <th className="px-4 py-2 text-left font-medium">{t("crewPage.table.status")}</th>
              <th className="px-4 py-2 text-right font-medium">{t("crewPage.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {crew.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {c.phone ? (
                    <a
                      href={`https://wa.me/${c.phone.replace(/^\+/, "").replace(/^0/, "62")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      {c.phone}
                    </a>
                  ) : (
                    <span className="text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={c.active ? "default" : "secondary"}>
                    {c.active ? t("crewPage.status.active") : t("crewPage.status.inactive")}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditing(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => update({ crewId: c.id, payload: { active: !c.active } })}
                    >
                      {c.active ? <ToggleRight className="h-4 w-4 text-primary" /> : <ToggleLeft className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(c.id, c.name)}
                      disabled={deletingId === c.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {crew.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  {t("crewPage.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CreateCrewModal open={showCreate} onClose={() => setShowCreate(false)} />
      {editing && <EditCrewModal crew={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
