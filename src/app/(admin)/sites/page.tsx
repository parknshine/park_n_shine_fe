"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronRight, PauseCircle, PlayCircle, MapPin, QrCode, Printer } from "lucide-react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/i18n";
import { useAdminSites } from "@/features/admin/hooks";
import type {
  AdminSiteDetail,
  CreateSitePayload,
  UpdateSitePayload,
} from "@/features/admin/types";
import { LocationPickerModal } from "@/features/admin/components/location-picker-modal";

function GenericSiteQrModal({ onClose }: Readonly<{ onClose: () => void }>) {
  const { t } = useTranslation("admin");
  const url = globalThis.window === undefined ? "" : globalThis.window.location.origin;

  function handlePrint() {
    const svgEl = globalThis.document.getElementById("generic-site-qr");
    if (!svgEl) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgEl);

    const safeUrl = globalThis.window.location.origin;
    const encodedUrl = safeUrl
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

    const html = [
      "<!DOCTYPE html><html><head>",
      "<title>Park &amp; Shine — Site QR</title>",
      "<style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:sans-serif;}",
      "h2{font-size:16px;margin-bottom:12px;}p{font-size:11px;color:#666;margin-top:8px;}</style>",
      "</head><body>",
      "<h2>Park &amp; Shine</h2>",
      svgString,
      `<p>${encodedUrl}</p>`,
      "<script>window.onload=function(){window.print();window.close();}<\/script>",
      "</body></html>",
    ].join("");

    const blob = new Blob([html], { type: "text/html" });
    const blobUrl = URL.createObjectURL(blob);
    const win = globalThis.window.open(blobUrl, "_blank", "width=400,height=500");
    win?.addEventListener("unload", () => URL.revokeObjectURL(blobUrl));
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg border border-border bg-background p-6 shadow-lg space-y-5">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">{t("sitesPage.genericQrModal.title")}</h2>
          <p className="text-xs text-muted-foreground">
            {t("sitesPage.genericQrModal.description")}
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-muted/30 p-6">
          <QRCode id="generic-site-qr" value={url} size={180} />
          <p className="text-xs text-muted-foreground break-all text-center">{url}</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handlePrint} className="flex-1 gap-2">
            <Printer className="h-4 w-4" /> {t("sitesPage.genericQrModal.printQr")}
          </Button>
          <Button variant="outline" onClick={onClose}>{t("sitesPage.genericQrModal.close")}</Button>
        </div>
      </div>
    </div>
  );
}

interface CreateFormState {
  name: string;
  address: string;
  timezone: string;
  cutoffTime: string | null;
  lat: number | null;
  lng: number | null;
}

function CreateSiteModal({
  onClose,
  onCreate,
  isCreating,
}: {
  onClose: () => void;
  onCreate: (payload: CreateSitePayload) => Promise<unknown>;
  isCreating: boolean;
}) {
  const { t } = useTranslation("admin");
  const [form, setForm] = useState<CreateFormState>({
    name: "",
    address: "",
    timezone: "Asia/Jakarta",
    cutoffTime: null,
    lat: null,
    lng: null,
  });
  const [pickerOpen, setPickerOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await onCreate({
        name: form.name,
        address: form.address,
        timezone: form.timezone,
        cutoffTime: form.cutoffTime,
        lat: form.lat,
        lng: form.lng,
      });
      onClose();
    } catch {
      // error surfaced by mutation/toast layer; keep modal open
    }
  }

  return (
    <>
      <div className='fixed inset-0 z-40 flex items-center justify-center bg-black/40'>
        <div className='w-full max-w-md rounded-lg bg-background border border-border p-6 shadow-lg space-y-4'>
          <h2 className='text-base font-semibold text-foreground'>{t("sitesPage.create.title")}</h2>
          <form onSubmit={handleSubmit} className='space-y-3'>
            <div className='space-y-1'>
              <Label htmlFor='site-name'>{t("sitesPage.create.nameLabel")}</Label>
              <Input
                id='site-name'
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className='space-y-1'>
              <Label htmlFor='site-address'>{t("sitesPage.create.addressLabel")}</Label>
              <div className="relative">
                <Input
                  id="site-address"
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      address: e.target.value,
                      lat: null,
                      lng: null,
                    }))
                  }
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                  aria-label="Pick from map"
                >
                  <MapPin className="h-4 w-4" />
                </button>
              </div>
              {form.lat !== null && form.lng !== null && (
                <p className="text-xs text-muted-foreground">
                  {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
                </p>
              )}
            </div>
            <div className='space-y-1'>
              <Label htmlFor='site-timezone'>{t("sitesPage.create.timezoneLabel")}</Label>
              <Input
                id='site-timezone'
                value={form.timezone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, timezone: e.target.value }))
                }
              />
            </div>
            <div className='space-y-1'>
              <Label htmlFor='site-cutoff'>{t("sitesPage.create.cutoffLabel")}</Label>
              <Input
                id='site-cutoff'
                placeholder='22:00'
                value={form.cutoffTime ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cutoffTime: e.target.value || null }))
                }
              />
            </div>
            <div className='flex gap-2 pt-2'>
              <Button type='submit' disabled={isCreating}>
                {isCreating ? t("sitesPage.create.creating") : t("sitesPage.create.create")}
              </Button>
              <Button type='button' variant='outline' onClick={onClose}>
                {t("sitesPage.create.cancel")}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {pickerOpen && (
        <LocationPickerModal
          onClose={() => setPickerOpen(false)}
          initialLat={form.lat}
          initialLng={form.lng}
          initialAddress={form.address || undefined}
          onConfirm={(result) => {
            setForm((f) => ({
              ...f,
              name: f.name.trim() === "" ? result.name : f.name,
              address: result.address,
              lat: result.lat,
              lng: result.lng,
            }));
            setPickerOpen(false);
          }}
        />
      )}
    </>
  );
}

interface EditFormState {
  name: string;
  address: string;
  timezone: string;
  cutoffTime: string | null;
  lat: number | null;
  lng: number | null;
}

function EditSiteModal({
  site,
  onClose,
  onUpdate,
  isUpdating,
}: Readonly<{
  site: AdminSiteDetail;
  onClose: () => void;
  onUpdate: (args: { siteId: string; payload: UpdateSitePayload }) => Promise<unknown>;
  isUpdating: boolean;
}>) {
  const { t } = useTranslation("admin");
  const [form, setForm] = useState<EditFormState>({
    name: site.name,
    address: site.address,
    timezone: site.timezone,
    cutoffTime: site.cutoffTime,
    lat: site.lat ?? null,
    lng: site.lng ?? null,
  });
  const [pickerOpen, setPickerOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await onUpdate({
        siteId: site.id,
        payload: {
          name: form.name,
          address: form.address,
          timezone: form.timezone,
          cutoffTime: form.cutoffTime,
          lat: form.lat,
          lng: form.lng,
        },
      });
      onClose();
    } catch {
      // error surfaced by mutation/toast layer; keep modal open
    }
  }

  return (
    <>
      <div className='fixed inset-0 z-40 flex items-center justify-center bg-black/40'>
        <div className='w-full max-w-md rounded-lg bg-background border border-border p-6 shadow-lg space-y-4'>
          <h2 className='text-base font-semibold text-foreground'>{t("sitesPage.editModal.title")}</h2>
          <form onSubmit={handleSubmit} className='space-y-3'>
            <div className='space-y-1'>
              <Label htmlFor='edit-site-name'>{t("sitesPage.editModal.nameLabel")}</Label>
              <Input
                id='edit-site-name'
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className='space-y-1'>
              <Label htmlFor='edit-site-address'>{t("sitesPage.editModal.addressLabel")}</Label>
              <div className="relative">
                <Input
                  id="edit-site-address"
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      address: e.target.value,
                      lat: null,
                      lng: null,
                    }))
                  }
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                  aria-label="Pick from map"
                >
                  <MapPin className="h-4 w-4" />
                </button>
              </div>
              {form.lat !== null && form.lng !== null && (
                <p className="text-xs text-muted-foreground">
                  {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
                </p>
              )}
            </div>
            <div className='space-y-1'>
              <Label htmlFor='edit-site-timezone'>{t("sitesPage.editModal.timezoneLabel")}</Label>
              <Input
                id='edit-site-timezone'
                value={form.timezone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, timezone: e.target.value }))
                }
              />
            </div>
            <div className='space-y-1'>
              <Label htmlFor='edit-site-cutoff'>{t("sitesPage.editModal.cutoffLabel")}</Label>
              <Input
                id='edit-site-cutoff'
                placeholder='22:00'
                value={form.cutoffTime ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cutoffTime: e.target.value || null }))
                }
              />
            </div>
            <div className='flex gap-2 pt-2'>
              <Button type='submit' disabled={isUpdating}>
                {isUpdating ? t("sitesPage.editModal.saving") : t("sitesPage.editModal.save")}
              </Button>
              <Button type='button' variant='outline' onClick={onClose}>
                {t("sitesPage.editModal.cancel")}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {pickerOpen && (
        <LocationPickerModal
          onClose={() => setPickerOpen(false)}
          initialLat={form.lat}
          initialLng={form.lng}
          initialAddress={form.address || undefined}
          onConfirm={(result) => {
            setForm((f) => ({
              ...f,
              address: result.address,
              lat: result.lat,
              lng: result.lng,
            }));
            setPickerOpen(false);
          }}
        />
      )}
    </>
  );
}

export default function SitesPage() {
  const { t } = useTranslation("admin");
  const router = useRouter();
  const { sites, isLoading, create, isCreating, update, isUpdating } = useAdminSites();
  const [showCreate, setShowCreate] = useState(false);
  const [showGenericQr, setShowGenericQr] = useState(false);
  const [editSite, setEditSite] = useState<AdminSiteDetail | null>(null);
  const [confirmPauseId, setConfirmPauseId] = useState<string | null>(null);

  async function handleToggleIntake(siteId: string, currentPaused: boolean) {
    await update({ siteId, payload: { intakePaused: !currentPaused } });
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-bold text-foreground'>
            {t("sitesPage.title")}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {t("sitesPage.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowGenericQr(true)}>
            <QrCode className='mr-2 h-4 w-4' /> {t("sitesPage.genericQr")}
          </Button>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className='mr-2 h-4 w-4' /> {t("sitesPage.newSite")}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className='text-sm text-muted-foreground'>{t("sitesPage.loading")}</p>
      ) : sites.length === 0 ? (
        <div className='flex h-40 items-center justify-center rounded-lg border border-dashed border-border'>
          <p className='text-sm text-muted-foreground'>
            {t("sitesPage.empty")}
          </p>
        </div>
      ) : (
        <div className='space-y-2'>
          {sites.map((site) => (
            <div
              key={site.id}
              className='flex items-center justify-between rounded-lg border border-border bg-background p-4'
            >
              <div className='space-y-0.5'>
                <p className='text-sm font-medium text-foreground'>
                  {site.name}
                </p>
                <p className='text-xs text-muted-foreground'>{site.address}</p>
              </div>
              <div className='flex items-center gap-3'>
                {site.intakePaused ? (
                  <span className='flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive'>
                    <PauseCircle className='h-3 w-3' /> {t("sitesPage.status.paused")}
                  </span>
                ) : (
                  <span className='flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-600'>
                    <PlayCircle className='h-3 w-3' /> {t("sitesPage.status.active")}
                  </span>
                )}
                {confirmPauseId === site.id ? (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isUpdating}
                      onClick={async () => {
                        await handleToggleIntake(site.id, site.intakePaused);
                        setConfirmPauseId(null);
                      }}
                    >
                      Yakin
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmPauseId(null)}
                    >
                      Batal
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant={site.intakePaused ? "outline" : "ghost"}
                    size="sm"
                    className={site.intakePaused
                      ? "text-green-600 border-green-600 hover:bg-green-50"
                      : "text-destructive hover:bg-destructive/10"
                    }
                    onClick={() => {
                      if (site.intakePaused) {
                        void handleToggleIntake(site.id, site.intakePaused);
                      } else {
                        setConfirmPauseId(site.id);
                      }
                    }}
                  >
                    {site.intakePaused ? "Aktifkan" : "Nonaktifkan"}
                  </Button>
                )}
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setEditSite(site)}
                >
                  {t("sitesPage.actions.edit")}
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => router.push(`/sites/${site.id}`)}
                >
                  {t("sitesPage.actions.manageQr")} <ChevronRight className='ml-1 h-3 w-3' />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateSiteModal
          onClose={() => setShowCreate(false)}
          onCreate={create}
          isCreating={isCreating}
        />
      )}

      {editSite && (
        <EditSiteModal
          site={editSite}
          onClose={() => setEditSite(null)}
          onUpdate={update}
          isUpdating={isUpdating}
        />
      )}

      {showGenericQr && (
        <GenericSiteQrModal onClose={() => setShowGenericQr(false)} />
      )}
    </div>
  );
}
