"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminSettings } from "@/features/admin/hooks";
import { useUIStore } from "@/store/ui-store";
import type { AdminSettings } from "@/features/admin/types";

interface SettingsFormProps {
  settings: AdminSettings;
  save: (data: { staleJobTimeoutMinutes: number }) => Promise<void>;
  isSaving: boolean;
  saveSuccess: boolean;
  error: string | null;
}

function SettingsForm({ settings, save, isSaving, saveSuccess, error }: SettingsFormProps) {
  const [timeoutMinutes, setTimeoutMinutes] = useState(settings.staleJobTimeoutMinutes);

  async function handleSave() {
    try {
      await save({ staleJobTimeoutMinutes: timeoutMinutes });
    } catch {
      // error displayed via `error` state
    }
  }

  return (
    <div className="rounded-lg border border-border p-4 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">
          Stale Job Timeout
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Booking PAID yang belum di-claim lebih dari X menit akan muncul
          di Escalations Panel.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="timeout-input">Timeout (menit)</Label>
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
          <span className="text-sm text-muted-foreground">menit</span>
        </div>
        <p className="text-xs text-muted-foreground">Min: 5, Max: 120</p>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Menyimpan..." : "Save Changes"}
        </Button>
        <button
          onClick={() => setTimeoutMinutes(20)}
          className="text-xs text-muted-foreground underline hover:text-foreground"
        >
          Reset ke 20 menit
        </button>
      </div>

      {saveSuccess && (
        <p className="text-sm text-green-600 dark:text-green-400">
          Settings berhasil disimpan.
        </p>
      )}
      {error && (
        <p className="text-sm text-destructive">
          Gagal menyimpan. Coba lagi.
        </p>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const activeSiteId = useUIStore((s) => s.activeSiteId);
  const { settings, isLoading, save, isSaving, saveSuccess, error } =
    useAdminSettings(activeSiteId ?? "");

  if (!activeSiteId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Pilih site dari sidebar.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Konfigurasi per site</p>
      </div>

      {isLoading || !settings ? (
        <p className="text-sm text-muted-foreground">Memuat settings...</p>
      ) : (
        <SettingsForm
          key={settings.staleJobTimeoutMinutes}
          settings={settings}
          save={save}
          isSaving={isSaving}
          saveSuccess={saveSuccess}
          error={error}
        />
      )}
    </div>
  );
}
