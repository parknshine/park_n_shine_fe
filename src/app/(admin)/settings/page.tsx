"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import QRCode from "react-qr-code";
import {
  CheckCircle2,
  Loader2,
  MessageCircle,
  RefreshCw,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdminSettings, useAdminWhatsapp } from "@/features/admin/hooks";
import type { AdminSettings } from "@/features/admin/types";
import type { WaStatus } from "@/features/admin/hooks";
import { useTranslation } from "@/i18n";

interface SettingsFormProps {
  settings: AdminSettings;
  save: (data: { staleJobTimeoutMinutes: number }) => Promise<unknown>;
  isSaving: boolean;
}

function SettingsForm({ settings, save, isSaving }: SettingsFormProps) {
  const [timeoutMinutes, setTimeoutMinutes] = useState(settings.staleJobTimeoutMinutes);
  const { t } = useTranslation("admin");

  async function handleSave() {
    try {
      await save({ staleJobTimeoutMinutes: timeoutMinutes });
      toast.success(t("settings.staleTimeout.success"));
    } catch {
      toast.error(t("settings.staleTimeout.error"));
    }
  }

  return (
    <div className="rounded-lg border border-border p-4 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">
          {t("settings.staleTimeout.title")}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t("settings.staleTimeout.description")}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="timeout-input">{t("settings.staleTimeout.label")}</Label>
        <div className="flex items-center gap-3">
          <Input
            id="timeout-input"
            type="number"
            min={5}
            max={120}
            value={timeoutMinutes}
            onChange={(e) => setTimeoutMinutes(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-sm text-muted-foreground">{t("settings.staleTimeout.unit")}</span>
        </div>
        <p className="text-xs text-muted-foreground">{t("settings.staleTimeout.hint")}</p>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? t("settings.staleTimeout.saving") : t("settings.staleTimeout.save")}
        </Button>
        <button
          onClick={() => setTimeoutMinutes(20)}
          className="text-xs text-muted-foreground underline hover:text-foreground"
        >
          {t("settings.staleTimeout.resetLabel")}
        </button>
      </div>
    </div>
  );
}

const STATUS_LABEL: Record<WaStatus, string> = {
  disabled:     "Tidak aktif",
  disconnected: "Terputus",
  connecting:   "Menghubungkan...",
  qr_ready:     "Scan QR Code",
  connected:    "Terhubung",
};

function WhatsAppStatusBadge({ status }: { status: WaStatus }) {
  if (status === "connected") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
        <CheckCircle2 className="h-4 w-4" />
        {STATUS_LABEL.connected}
      </span>
    );
  }
  if (status === "connecting" || status === "qr_ready") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        {STATUS_LABEL[status]}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
      <WifiOff className="h-4 w-4" />
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function WhatsAppCard() {
  const { state, isLoading, connect, isConnecting } = useAdminWhatsapp();
  const [showQr, setShowQr] = useState(false);

  // Auto-open modal when QR is ready
  const isQrReady = state.status === "qr_ready" && !!state.qr;
  const modalOpen = showQr || isQrReady;

  async function handleConnect() {
    try {
      await connect();
      setShowQr(true);
    } catch {
      toast.error("Gagal memulai koneksi WhatsApp.");
    }
  }

  return (
    <>
      <div className="rounded-lg border border-border p-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MessageCircle className="h-4 w-4 text-green-600" />
              WhatsApp Notifikasi
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Kirim notifikasi job ke crew via WhatsApp. Gunakan nomor yang sudah terdaftar WhatsApp.
            </p>
          </div>
          {!isLoading && <WhatsAppStatusBadge status={state.status} />}
        </div>

        <div className="flex items-center gap-3">
          {state.status === "connected" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleConnect}
              disabled={isConnecting}
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Re-pair
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleConnect}
              disabled={isConnecting || state.status === "connecting"}
            >
              {isConnecting || state.status === "connecting" ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Menghubungkan...
                </>
              ) : (
                "Hubungkan WhatsApp"
              )}
            </Button>
          )}

          {isQrReady && (
            <Button size="sm" variant="outline" onClick={() => setShowQr(true)}>
              Lihat QR Code
            </Button>
          )}
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) setShowQr(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              Scan QR Code WhatsApp
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Buka <strong>WhatsApp</strong> di HP → ⋮ → <strong>Linked Devices</strong> → <strong>Link a Device</strong>, lalu scan QR ini.
            </p>
            <div className="flex justify-center rounded-lg bg-white p-4">
              {state.qr ? (
                <QRCode value={state.qr} size={220} />
              ) : (
                <div className="flex h-55 w-55 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            <p className="text-center text-xs text-muted-foreground">
              QR code otomatis refresh setiap ~20 detik.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function SettingsPage() {
  const { t } = useTranslation("admin");
  const { settings, isLoading, save, isSaving } = useAdminSettings();

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      {isLoading || !settings ? (
        <p className="text-sm text-muted-foreground">{t("settings.loading")}</p>
      ) : (
        <SettingsForm
          key={settings.staleJobTimeoutMinutes}
          settings={settings}
          save={save}
          isSaving={isSaving}
        />
      )}

      <WhatsAppCard />
    </div>
  );
}
