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

interface SettingsTableProps {
  settings: AdminSettings;
  save: (data: Partial<Pick<AdminSettings, "staleJobTimeoutMinutes" | "jobEtaMinutes" | "whatsappNumber" | "avgCleaningMinutes" | "paymentExpiryMinutes" | "crewTimeExtensionMinutes">>) => Promise<unknown>;
  isSaving: boolean;
}

function SettingsTable({ settings, save, isSaving }: Readonly<SettingsTableProps>) {
  const { t } = useTranslation("admin");
  const [staleTimeout, setStaleTimeout] = useState(settings.staleJobTimeoutMinutes);
  const [jobEta, setJobEta] = useState(settings.jobEtaMinutes);
  const [avgCleaning, setAvgCleaning] = useState(settings.avgCleaningMinutes);
  const [paymentExpiry, setPaymentExpiry] = useState(settings.paymentExpiryMinutes);
  const [waNumber, setWaNumber] = useState(settings.whatsappNumber);
  const [crewTimeExtension, setCrewTimeExtension] = useState(settings.crewTimeExtensionMinutes);

  async function handleSave(payload: Parameters<typeof save>[0], successKey: string, errorKey: string) {
    try {
      await save(payload);
      toast.success(t(successKey));
    } catch {
      toast.error(t(errorKey));
    }
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground w-2/5">
              {t("settings.table.setting")}
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">
              {t("settings.table.value")}
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground w-32">
              {t("settings.table.action")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {/* Stale Job Timeout */}
          <tr className="align-top">
            <td className="px-4 py-3">
              <p className="font-medium text-foreground">{t("settings.staleTimeout.title")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("settings.staleTimeout.description")}</p>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <Input
                  id="timeout-input"
                  type="text"
                  inputMode="numeric"
                  value={staleTimeout}
                  onChange={(e) => setStaleTimeout(Number(e.target.value))}
                  className="w-20 h-8 text-sm"
                />
                <span className="text-xs text-muted-foreground">{t("settings.staleTimeout.unit")}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t("settings.staleTimeout.hint")}</p>
            </td>
            <td className="px-4 py-3">
              <div className="flex flex-col gap-1.5">
                <Button
                  size="sm"
                  disabled={isSaving}
                  onClick={() => handleSave({ staleJobTimeoutMinutes: staleTimeout }, "settings.staleTimeout.success", "settings.staleTimeout.error")}
                >
                  {t("settings.table.save")}
                </Button>
                <button
                  onClick={() => setStaleTimeout(20)}
                  className="text-xs text-muted-foreground underline hover:text-foreground text-left"
                >
                  {t("settings.staleTimeout.resetLabel")}
                </button>
              </div>
            </td>
          </tr>

          {/* Job ETA */}
          <tr className="align-top">
            <td className="px-4 py-3">
              <p className="font-medium text-foreground">{t("settings.jobEta.title")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("settings.jobEta.description")}</p>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <Input
                  id="job-eta-input"
                  type="text"
                  inputMode="numeric"
                  value={jobEta}
                  onChange={(e) => setJobEta(Number(e.target.value))}
                  className="w-20 h-8 text-sm"
                />
                <span className="text-xs text-muted-foreground">{t("settings.jobEta.unit")}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t("settings.jobEta.hint")}</p>
            </td>
            <td className="px-4 py-3">
              <div className="flex flex-col gap-1.5">
                <Button
                  size="sm"
                  disabled={isSaving}
                  onClick={() => handleSave({ jobEtaMinutes: jobEta }, "settings.jobEta.success", "settings.jobEta.error")}
                >
                  {t("settings.table.save")}
                </Button>
                <button
                  onClick={() => setJobEta(20)}
                  className="text-xs text-muted-foreground underline hover:text-foreground text-left"
                >
                  {t("settings.jobEta.resetLabel")}
                </button>
              </div>
            </td>
          </tr>

          {/* Crew Time Extension */}
          <tr className="align-top">
            <td className="px-4 py-3">
              <p className="font-medium text-foreground">{t("settings.crewTimeExtension.title")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("settings.crewTimeExtension.description")}</p>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <Input
                  id="crew-time-extension-input"
                  type="text"
                  inputMode="numeric"
                  value={crewTimeExtension}
                  onChange={(e) => setCrewTimeExtension(Number(e.target.value))}
                  className="w-20 h-8 text-sm"
                />
                <span className="text-xs text-muted-foreground">{t("settings.crewTimeExtension.unit")}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t("settings.crewTimeExtension.hint")}</p>
            </td>
            <td className="px-4 py-3">
              <div className="flex flex-col gap-1.5">
                <Button
                  size="sm"
                  disabled={isSaving}
                  onClick={() => handleSave(
                    { crewTimeExtensionMinutes: crewTimeExtension },
                    "settings.crewTimeExtension.success",
                    "settings.crewTimeExtension.error"
                  )}
                >
                  {t("settings.table.save")}
                </Button>
                <button
                  onClick={() => setCrewTimeExtension(10)}
                  className="text-xs text-muted-foreground underline hover:text-foreground text-left"
                >
                  {t("settings.crewTimeExtension.resetLabel")}
                </button>
              </div>
            </td>
          </tr>

          {/* Avg Cleaning Duration */}
          <tr className="align-top">
            <td className="px-4 py-3">
              <p className="font-medium text-foreground">{t("settings.avgCleaning.title")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("settings.avgCleaning.description")}</p>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <Input
                  id="avg-cleaning-input"
                  type="text"
                  inputMode="numeric"
                  value={avgCleaning}
                  onChange={(e) => setAvgCleaning(Number(e.target.value))}
                  className="w-20 h-8 text-sm"
                />
                <span className="text-xs text-muted-foreground">{t("settings.avgCleaning.unit")}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t("settings.avgCleaning.hint")}</p>
            </td>
            <td className="px-4 py-3">
              <div className="flex flex-col gap-1.5">
                <Button
                  size="sm"
                  disabled={isSaving}
                  onClick={() => handleSave({ avgCleaningMinutes: avgCleaning }, "settings.avgCleaning.success", "settings.avgCleaning.error")}
                >
                  {t("settings.table.save")}
                </Button>
                <button
                  onClick={() => setAvgCleaning(30)}
                  className="text-xs text-muted-foreground underline hover:text-foreground text-left"
                >
                  {t("settings.avgCleaning.resetLabel")}
                </button>
              </div>
            </td>
          </tr>

          {/* Payment Expiry */}
          <tr className="align-top">
            <td className="px-4 py-3">
              <p className="font-medium text-foreground">{t("settings.paymentExpiry.title")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("settings.paymentExpiry.description")}</p>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <Input
                  id="payment-expiry-input"
                  type="text"
                  inputMode="numeric"
                  value={paymentExpiry}
                  onChange={(e) => setPaymentExpiry(Number(e.target.value))}
                  className="w-20 h-8 text-sm"
                />
                <span className="text-xs text-muted-foreground">{t("settings.paymentExpiry.unit")}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t("settings.paymentExpiry.hint")}</p>
            </td>
            <td className="px-4 py-3">
              <div className="flex flex-col gap-1.5">
                <Button
                  size="sm"
                  disabled={isSaving}
                  onClick={() => handleSave({ paymentExpiryMinutes: paymentExpiry }, "settings.paymentExpiry.success", "settings.paymentExpiry.error")}
                >
                  {t("settings.table.save")}
                </Button>
                <button
                  onClick={() => setPaymentExpiry(15)}
                  className="text-xs text-muted-foreground underline hover:text-foreground text-left"
                >
                  {t("settings.paymentExpiry.resetLabel")}
                </button>
              </div>
            </td>
          </tr>

          {/* WhatsApp Number */}
          <tr className="align-top">
            <td className="px-4 py-3">
              <p className="font-medium text-foreground">{t("settingsWhatsapp.supportTitle")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("settingsWhatsapp.supportDesc")}</p>
            </td>
            <td className="px-4 py-3">
              <Input
                id="wa-number-input"
                type="tel"
                placeholder="628123456789"
                value={waNumber}
                onChange={(e) => setWaNumber(e.target.value)}
                className="w-44 h-8 text-sm"
              />
            </td>
            <td className="px-4 py-3">
              <Button
                size="sm"
                disabled={isSaving}
                onClick={() => handleSave({ whatsappNumber: waNumber }, "settingsWhatsapp.toast.saveSuccess", "settingsWhatsapp.toast.saveFailed")}
              >
                {t("settings.table.save")}
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
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
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      {isLoading || !settings ? (
        <p className="text-sm text-muted-foreground">{t("settings.loading")}</p>
      ) : (
        <SettingsTable
          key={`${settings.staleJobTimeoutMinutes}-${settings.avgCleaningMinutes}-${settings.paymentExpiryMinutes}-${settings.whatsappNumber}`}
          settings={settings}
          save={save}
          isSaving={isSaving}
        />
      )}

      <WhatsAppCard />
    </div>
  );
}
