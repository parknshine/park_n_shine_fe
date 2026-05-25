"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Plus, RotateCcw, Printer, ArrowLeft, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminQr } from "@/features/admin/hooks";
import type { AdminQrCode } from "@/features/admin/types";

function GenerateQrModal({
  onClose,
  onGenerate,
  isGenerating,
}: {
  onClose: () => void;
  onGenerate: (payload: { label: string }) => Promise<AdminQrCode>;
  isGenerating: boolean;
}) {
  const router = useRouter();
  const params = useParams<{ siteId: string }>();
  const [label, setLabel] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qr = await onGenerate({ label });
    onClose();
    router.push(`/sites/${params.siteId}/qr/${qr.id}/print`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-background border border-border p-6 shadow-lg space-y-4">
        <h2 className="text-base font-semibold text-foreground">Generate New QR Code</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="qr-label">Slot Label (e.g. "Slot A1")</Label>
            <Input id="qr-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Slot A1" required />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={isGenerating}>{isGenerating ? "Generating..." : "Generate & Print"}</Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RotateConfirmDialog({
  qr,
  onClose,
  onConfirm,
  isRotating,
}: {
  qr: AdminQrCode;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isRotating: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-background border border-border p-6 shadow-lg space-y-4">
        <h2 className="text-base font-semibold text-foreground">Rotate QR Code?</h2>
        <p className="text-sm text-muted-foreground">
          The current QR for <strong>{qr.label}</strong> will be invalidated and a new one generated. Customers scanning the old QR will see an error.
        </p>
        <div className="flex gap-2">
          <Button variant="destructive" disabled={isRotating} onClick={onConfirm}>
            {isRotating ? "Rotating..." : "Yes, Rotate"}
          </Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

export default function QrManagementPage() {
  const router = useRouter();
  const { siteId } = useParams<{ siteId: string }>();
  const { qrCodes, isLoading, generate, isGenerating, rotate, isRotating } = useAdminQr(siteId);
  const [showGenerate, setShowGenerate] = useState(false);
  const [rotatingQr, setRotatingQr] = useState<AdminQrCode | null>(null);

  async function handleRotate() {
    if (!rotatingQr) return;
    const result = await rotate(rotatingQr.id);
    setRotatingQr(null);
    router.push(`/sites/${siteId}/qr/${result.newQr.id}/print`);
  }

  const activeQrCodes = qrCodes.filter((q) => !q.rotatedAt);
  const rotatedQrCodes = qrCodes.filter((q) => q.rotatedAt);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/sites")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">QR Codes</h1>
          <p className="text-sm text-muted-foreground">Manage QR codes for this site</p>
        </div>
        <Button variant="outline" onClick={() => router.push(`/sites/${siteId}/shifts`)}>
          <CalendarClock className="mr-2 h-4 w-4" /> Shifts
        </Button>
        <Button onClick={() => setShowGenerate(true)}>
          <Plus className="mr-2 h-4 w-4" /> Generate QR
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <>
          {/* Active QR Codes */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground">Active ({activeQrCodes.length})</h2>
            {activeQrCodes.length === 0 ? (
              <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border">
                <p className="text-sm text-muted-foreground">No active QR codes</p>
              </div>
            ) : (
              activeQrCodes.map((qr) => (
                <div key={qr.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{qr.label}</p>
                    <p className="text-xs text-muted-foreground font-mono">{qr.id}</p>
                    <p className="text-xs text-muted-foreground">Created {new Date(qr.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/sites/${siteId}/qr/${qr.id}/print`)}>
                      <Printer className="mr-1.5 h-3.5 w-3.5" /> Print
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setRotatingQr(qr)}>
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Rotate
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Rotated QR Codes */}
          {rotatedQrCodes.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground">Rotated ({rotatedQrCodes.length})</h2>
              {rotatedQrCodes.map((qr) => (
                <div key={qr.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4 opacity-60">
                  <div>
                    <p className="text-sm font-medium text-foreground">{qr.label}</p>
                    <p className="text-xs text-muted-foreground font-mono">{qr.id}</p>
                    <p className="text-xs text-muted-foreground">Rotated {new Date(qr.rotatedAt!).toLocaleDateString()}</p>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Rotated</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showGenerate && (
        <GenerateQrModal
          onClose={() => setShowGenerate(false)}
          onGenerate={generate}
          isGenerating={isGenerating}
        />
      )}

      {rotatingQr && (
        <RotateConfirmDialog
          qr={rotatingQr}
          onClose={() => setRotatingQr(null)}
          onConfirm={handleRotate}
          isRotating={isRotating}
        />
      )}
    </div>
  );
}
