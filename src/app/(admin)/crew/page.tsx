"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { UserPlus, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
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
import { useAdminCrew } from "@/features/admin/hooks";
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

  async function handleSubmit() {
    if (!name.trim() || !pin.match(/^\d{4,8}$/)) {
      toast.error("Name required and PIN must be 4-8 digits.");
      return;
    }
    try {
      await create({ name: name.trim(), pin });
      setName("");
      setPin("");
      onClose();
    } catch {
      toast.error("Failed to create crew member.");
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

  async function handleSubmit() {
    if (pin && !pin.match(/^\d{4,8}$/)) {
      toast.error("PIN must be 4-8 digits.");
      return;
    }
    try {
      await update({ crewId: crew.id, payload: { name: name.trim(), ...(pin ? { pin } : {}) } });
      onClose();
    } catch {
      toast.error("Failed to update crew member.");
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
            <Label>PIN Baru (kosongkan jika tidak diubah)</Label>
            <Input type="password" inputMode="numeric" maxLength={8} value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" />
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
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AdminCrewMember | null>(null);

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
              <th className="px-4 py-2 text-left font-medium">Status</th>
              <th className="px-4 py-2 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {crew.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{c.name}</td>
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
                  </div>
                </td>
              </tr>
            ))}
            {crew.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
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
