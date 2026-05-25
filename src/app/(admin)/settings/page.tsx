"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminSettings } from "@/features/admin/hooks";
import { useUIStore } from "@/store/ui-store";
import type { AdminSettings } from "@/features/admin/types";
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

export default function SettingsPage() {
  const activeSiteId = useUIStore((s) => s.activeSiteId);
  const { t } = useTranslation("admin");
  const { settings, isLoading, save, isSaving } =
    useAdminSettings(activeSiteId ?? "");

  if (!activeSiteId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">{t("common.selectSite")}</p>
      </div>
    );
  }

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
    </div>
  );
}
