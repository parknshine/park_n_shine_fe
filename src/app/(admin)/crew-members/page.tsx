"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { UserPlus, Pencil, ToggleLeft, ToggleRight, Phone, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
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

function CrewRowActions({
  crew,
  onEdit,
  onToggle,
  onDelete,
  isDeleting,
}: {
  crew: AdminCrewMember;
  onEdit: (crew: AdminCrewMember) => void;
  onToggle: (crew: AdminCrewMember) => void;
  onDelete: (id: string, name: string) => void;
  isDeleting: boolean;
}) {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(crew)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onToggle(crew)}
      >
        {crew.active ? <ToggleRight className="h-4 w-4 text-primary" /> : <ToggleLeft className="h-4 w-4" />}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        onClick={() => onDelete(crew.id, crew.name)}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
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
    if (!confirm(t("crewPage.confirm.delete", { name }))) return;
    setDeletingId(id);
    try {
      await deleteCrew.mutateAsync(id);
      toast.success(t("crewPage.toast.deleted"));
    } catch {
      toast.error(t("crewPage.toast.deleteFailed"));
    } finally {
      setDeletingId(null);
    }
  }

  const columns: ColumnDef<AdminCrewMember>[] = [
    {
      accessorKey: "name",
      header: t("crewPage.table.name"),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "phone",
      header: t("crewPage.table.whatsapp"),
      cell: ({ row }) => {
        const c = row.original;
        return c.phone ? (
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
          <span className="text-xs text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: "active",
      header: t("crewPage.table.status"),
      cell: ({ row }) => (
        <Badge variant={row.original.active ? "default" : "secondary"}>
          {row.original.active ? t("crewPage.status.active") : t("crewPage.status.inactive")}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <CrewRowActions
          crew={row.original}
          onEdit={setEditing}
          onToggle={(c) => update({ crewId: c.id, payload: { active: !c.active } })}
          onDelete={handleDelete}
          isDeleting={deletingId === row.original.id}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("crewPage.title")}</h1>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          {t("crewPage.addCrew")}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={crew ?? []}
        isLoading={isLoading}
        emptyMessage={t("crewPage.empty")}
        searchPlaceholder={t("crewPage.search")}
      />

      <CreateCrewModal open={showCreate} onClose={() => setShowCreate(false)} />
      {editing && <EditCrewModal crew={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
