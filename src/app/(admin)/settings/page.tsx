"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import QRCode from "react-qr-code";
import {
  CheckCircle2,
  Loader2,
  LogOut,
  MessageCircle,
  QrCode,
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
  save: (data: Partial<Pick<AdminSettings, "staleJobTimeoutMinutes" | "whatsappNumber">>) => Promise<unknown>;
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

function WhatsAppNumberCard({
  settings,
  save,
  isSaving,
}: SettingsFormProps) {
  const { t } = useTranslation("admin");
  const [number, setNumber] = useState(settings.whatsappNumber);

  async function handleSave() {
    try {
      await save({ whatsappNumber: number });
      toast.success(t("settingsWhatsapp.toast.saveSuccess"));
    } catch {
      toast.error(t("settingsWhatsapp.toast.saveFailed"));
    }
  }

  return (
    <div className="rounded-lg border border-border p-4 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">{t("settingsWhatsapp.supportTitle")}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t("settingsWhatsapp.supportDesc")}
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="wa-number-input">{t("settingsWhatsapp.supportLabel")}</Label>
        <Input
          id="wa-number-input"
          type="tel"
          placeholder="628123456789"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          className="w-56"
        />
      </div>
      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? t("settingsWhatsapp.saving") : t("settingsWhatsapp.save")}
      </Button>
    </div>
  );
}

function WhatsAppStatusBadge({ status }: { status: WaStatus }) {
  const { t } = useTranslation("admin");

  if (status === "connected") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
        <CheckCircle2 className="h-4 w-4" />
        {t("settingsWhatsapp.status.connected")}
      </span>
    );
  }
  if (status === "connecting") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("settingsWhatsapp.status.connecting")}
      </span>
    );
  }
  if (status === "qr_ready") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600">
        <QrCode className="h-4 w-4" />
        {t("settingsWhatsapp.status.scanQr")}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
      <WifiOff className="h-4 w-4" />
      {status === "disabled" ? t("settingsWhatsapp.status.inactive") : t("settingsWhatsapp.status.disconnected")}
    </span>
  );
}

function WhatsAppCard() {
  const { t } = useTranslation("admin");
  const { state, isLoading, connect, isConnecting, logout, isLoggingOut } = useAdminWhatsapp();
  const [showQr, setShowQr] = useState(false);

  const isQrReady = state.status === "qr_ready" && !!state.qr;
  // Only open when user explicitly triggered — never auto-open on page load
  const modalOpen = showQr;

  async function handleConnect() {
    try {
      setShowQr(true);
      await connect();
    } catch {
      toast.error(t("settingsWhatsapp.toast.connectFailed"));
    }
  }

  async function handleLogout() {
    try {
      await logout();
      setShowQr(false);
      toast.success(t("settingsWhatsapp.toast.logoutSuccess"));
    } catch {
      toast.error(t("settingsWhatsapp.toast.logoutFailed"));
    }
  }

  return (
    <>
      <div className="rounded-lg border border-border p-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MessageCircle className="h-4 w-4 text-green-600" />
              {t("settingsWhatsapp.notificationTitle")}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("settingsWhatsapp.notificationDesc")}
            </p>
          </div>
          {!isLoading && <WhatsAppStatusBadge status={state.status} />}
        </div>

        {state.status === "connected" && (
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-3.5 w-3.5" />
              )}
              {t("settingsWhatsapp.logout")}
            </Button>
          </div>
        )}

        {state.status !== "connected" && (
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={handleConnect}
              disabled={isConnecting || state.status === "connecting"}
            >
              {isConnecting || state.status === "connecting" ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  {t("settingsWhatsapp.connecting")}
                </>
              ) : (
                t("settingsWhatsapp.connect")
              )}
            </Button>

            {isQrReady && (
              <Button size="sm" variant="outline" onClick={() => setShowQr(true)}>
                {t("settingsWhatsapp.viewQr")}
              </Button>
            )}
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) setShowQr(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              {t("settingsWhatsapp.qrDialog.title")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              {t("settingsWhatsapp.qrDialog.instructions")}
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
              {t("settingsWhatsapp.qrDialog.autoRefresh")}
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
        <>
          <SettingsForm
            key={settings.staleJobTimeoutMinutes}
            settings={settings}
            save={save}
            isSaving={isSaving}
          />
          <WhatsAppNumberCard
            key={settings.whatsappNumber}
            settings={settings}
            save={save}
            isSaving={isSaving}
          />
        </>
      )}

      <WhatsAppCard />
    </div>
  );
}
