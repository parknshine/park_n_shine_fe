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
import { useAdminCrew, useDeleteCrew } from "@/features/admin/hooks";
import type { AdminCrewMember } from "@/features/admin/types";

function CreateCrewModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { create, isCreating } = useAdminCrew();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [phone, setPhone] = useState("");

  async function handleSubmit() {
    if (!name.trim() || !pin.match(/^\d{4,8}$/)) {
      toast.error("Nama wajib diisi dan PIN harus 4-8 digit.");
      return;
    }
    if (phone && !phone.match(/^(\+62|62|0)8\d{8,11}$/)) {
      toast.error("Nomor WhatsApp tidak valid (contoh: 08123456789).");
      return;
    }
    try {
      await create({ name: name.trim(), pin, ...(phone ? { phone } : {}) });
      setName("");
      setPin("");
      setPhone("");
      onClose();
    } catch {
      toast.error("Gagal menambah crew member.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Crew Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="crew-name">Nama</Label>
            <Input id="crew-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="crew-pin">PIN (4-8 digit)</Label>
            <Input id="crew-pin" type="password" inputMode="numeric" maxLength={8} value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="crew-phone">
              Nomor WhatsApp <span className="text-muted-foreground">(opsional)</span>
            </Label>
            <Input
              id="crew-phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08123456789"
            />
            <p className="text-xs text-muted-foreground">Digunakan untuk notifikasi job via WhatsApp.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={handleSubmit} disabled={isCreating}>
            {isCreating ? "Menyimpan..." : "Simpan"}
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
  const { update, isUpdating } = useAdminCrew();
  const [name, setName] = useState(crew.name);
  const [pin, setPin] = useState("");
  const [phone, setPhone] = useState(crew.phone ?? "");

  async function handleSubmit() {
    if (pin && !pin.match(/^\d{4,8}$/)) {
      toast.error("PIN harus 4-8 digit.");
      return;
    }
    if (phone && !phone.match(/^(\+62|62|0)8\d{8,11}$/)) {
      toast.error("Nomor WhatsApp tidak valid (contoh: 08123456789).");
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
      toast.error("Gagal mengupdate crew member.");
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Crew Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Nama</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>PIN Baru <span className="text-muted-foreground">(kosongkan jika tidak diubah)</span></Label>
            <Input type="password" inputMode="numeric" maxLength={8} value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" />
          </div>
          <div className="space-y-1">
            <Label>
              Nomor WhatsApp <span className="text-muted-foreground">(opsional)</span>
            </Label>
            <Input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08123456789"
            />
            <p className="text-xs text-muted-foreground">Kosongkan untuk hapus nomor.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={handleSubmit} disabled={isUpdating}>
            {isUpdating ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CrewPage() {
  const { crew, isLoading, update } = useAdminCrew();
  const deleteCrew = useDeleteCrew();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AdminCrewMember | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Nonaktifkan crew member "${name}"?`)) return;
    setDeletingId(id);
    try {
      await deleteCrew.mutateAsync(id);
      toast.success("Crew member dinonaktifkan.");
    } catch {
      toast.error("Gagal menonaktifkan crew member.");
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Crew Members</h1>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Tambah Crew
        </Button>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-2 text-left font-medium">Nama</th>
              <th className="px-4 py-2 text-left font-medium">WhatsApp</th>
              <th className="px-4 py-2 text-left font-medium">Status</th>
              <th className="px-4 py-2 text-right font-medium">Aksi</th>
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
                    {c.active ? "Aktif" : "Nonaktif"}
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
                  Belum ada crew member.
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
