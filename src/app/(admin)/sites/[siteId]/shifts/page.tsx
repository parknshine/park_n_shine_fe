"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Plus, Eye, EyeOff, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAdminShifts, useAdminCrew } from "@/features/admin/hooks";
import type { AdminShift, AdminCrewMember } from "@/features/admin/types";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// ShiftCodeRevealedModal — shown after create, lets user copy the code
// ---------------------------------------------------------------------------

function ShiftCodeRevealedModal({
  shiftCode,
  onClose,
}: {
  shiftCode: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(shiftCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Shift Berhasil Dibuat</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Salin kode ini dan bagikan ke crew:
          </p>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3">
            <span className="flex-1 font-mono text-2xl font-bold tracking-widest text-foreground">
              {shiftCode}
            </span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          {copied && (
            <p className="text-xs text-green-600">Kode berhasil disalin!</p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// CreateShiftModal — multi-select crew then create shift
// ---------------------------------------------------------------------------

function CreateShiftModal({
  open,
  onClose,
  siteId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  siteId: string;
  onCreated: (shiftCode: string) => void;
}) {
  const { create, isCreating } = useAdminShifts(siteId);
  const { crew, isLoading: isLoadingCrew } = useAdminCrew();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function toggleCrew(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleSubmit() {
    try {
      const shift = await create({ crewMemberIds: Array.from(selectedIds) });
      setSelectedIds(new Set());
      onClose();
      onCreated(shift.shiftCode);
    } catch {
      toast.error("Gagal membuat shift. Silakan coba lagi.");
    }
  }

  const activeCrew = crew.filter((c: AdminCrewMember) => c.active);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buat Shift Baru</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Pilih crew yang bertugas pada shift ini:
          </p>
          {isLoadingCrew ? (
            <p className="text-sm text-muted-foreground">Memuat crew...</p>
          ) : activeCrew.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tidak ada crew aktif yang tersedia.
            </p>
          ) : (
            <div className="max-h-60 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
              {activeCrew.map((c: AdminCrewMember) => {
                const checked = selectedIds.has(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCrew(c.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                      checked
                        ? "bg-primary/10 text-foreground"
                        : "hover:bg-muted/60 text-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                        checked
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background"
                      )}
                    >
                      {checked && (
                        <svg
                          viewBox="0 0 10 10"
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path d="M1.5 5l2.5 2.5 5-5" />
                        </svg>
                      )}
                    </span>
                    <span className="font-medium">{c.name}</span>
                  </button>
                );
              })}
            </div>
          )}
          {selectedIds.size > 0 && (
            <p className="text-xs text-muted-foreground">
              {selectedIds.size} crew dipilih
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={isCreating}>
            {isCreating ? "Membuat..." : "Buat Shift"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// CloseShiftConfirmDialog — confirm before closing an active shift
// ---------------------------------------------------------------------------

function CloseShiftConfirmDialog({
  shift,
  onClose,
  onConfirm,
  isClosing,
}: {
  shift: AdminShift;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isClosing: boolean;
}) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tutup Shift?</DialogTitle>
        </DialogHeader>
        <p className="py-2 text-sm text-muted-foreground">
          Shift dengan kode <strong className="font-mono">{shift.shiftCode}</strong> akan
          ditutup. Tindakan ini tidak dapat dibatalkan.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button variant="destructive" disabled={isClosing} onClick={onConfirm}>
            {isClosing ? "Menutup..." : "Ya, Tutup Shift"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// ShiftsPage — main page
// ---------------------------------------------------------------------------

export default function ShiftsPage() {
  const router = useRouter();
  const { siteId } = useParams<{ siteId: string }>();
  const { shifts, isLoading, close, isClosing } = useAdminShifts(siteId);

  const [showCreate, setShowCreate] = useState(false);
  const [revealedCode, setRevealedCode] = useState<string | null>(null);
  const [revealedShiftIds, setRevealedShiftIds] = useState<Set<string>>(new Set());
  const [closingShift, setClosingShift] = useState<AdminShift | null>(null);

  function toggleReveal(shiftId: string) {
    setRevealedShiftIds((prev) => {
      const next = new Set(prev);
      if (next.has(shiftId)) {
        next.delete(shiftId);
      } else {
        next.add(shiftId);
      }
      return next;
    });
  }

  async function handleCloseShift() {
    if (!closingShift) return;
    await close(closingShift.id);
    setClosingShift(null);
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Shifts</h1>
          <p className="text-sm text-muted-foreground">
            Kelola shift untuk site{" "}
            <span className="font-mono text-xs">{siteId}</span>
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Buat Shift
        </Button>
      </div>

      {/* Shifts table */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Memuat shift...</p>
      ) : shifts.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground">Belum ada shift.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2 text-left font-medium">Kode Shift</th>
                <th className="px-4 py-2 text-left font-medium">Waktu</th>
                <th className="px-4 py-2 text-left font-medium">Crew</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
                <th className="px-4 py-2 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift: AdminShift) => {
                const isRevealed = revealedShiftIds.has(shift.id);
                const crewNames =
                  shift.crewMembers.length > 0
                    ? shift.crewMembers.map((m) => m.name).join(", ")
                    : "—";

                return (
                  <tr key={shift.id} className="border-b last:border-0">
                    {/* Shift code with reveal toggle */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">
                          {isRevealed ? shift.shiftCode : "••••••"}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => toggleReveal(shift.id)}
                          title={isRevealed ? "Sembunyikan kode" : "Tampilkan kode"}
                        >
                          {isRevealed ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </td>

                    {/* Time range */}
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="space-y-0.5">
                        <p className="text-xs">{formatDate(shift.startedAt)}</p>
                        <p className="text-xs">
                          {shift.endedAt ? formatDate(shift.endedAt) : "Berlangsung"}
                        </p>
                      </div>
                    </td>

                    {/* Crew */}
                    <td className="px-4 py-3 text-muted-foreground max-w-[180px]">
                      <p className="truncate text-xs" title={crewNames}>
                        {crewNames}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <Badge variant={shift.isActive ? "default" : "secondary"}>
                        {shift.isActive ? "Aktif" : "Selesai"}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      {shift.isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setClosingShift(shift)}
                          disabled={isClosing}
                        >
                          Tutup Shift
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create shift modal */}
      <CreateShiftModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        siteId={siteId}
        onCreated={(code) => setRevealedCode(code)}
      />

      {/* Shift code copy modal after create */}
      {revealedCode && (
        <ShiftCodeRevealedModal
          shiftCode={revealedCode}
          onClose={() => setRevealedCode(null)}
        />
      )}

      {/* Close shift confirm dialog */}
      {closingShift && (
        <CloseShiftConfirmDialog
          shift={closingShift}
          onClose={() => setClosingShift(null)}
          onConfirm={handleCloseShift}
          isClosing={isClosing}
        />
      )}
    </div>
  );
}
