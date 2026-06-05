"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronRight, PauseCircle, PlayCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminSites } from "@/features/admin/hooks";
import type {
  AdminSiteDetail,
  CreateSitePayload,
  UpdateSitePayload,
} from "@/features/admin/types";
import { LocationPickerModal } from "@/features/admin/components/location-picker-modal";

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
          <h2 className='text-base font-semibold text-foreground'>New Site</h2>
          <form onSubmit={handleSubmit} className='space-y-3'>
            <div className='space-y-1'>
              <Label htmlFor='site-name'>Name</Label>
              <Input
                id='site-name'
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className='space-y-1'>
              <Label htmlFor='site-address'>Address</Label>
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
              <Label htmlFor='site-timezone'>Timezone</Label>
              <Input
                id='site-timezone'
                value={form.timezone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, timezone: e.target.value }))
                }
              />
            </div>
            <div className='space-y-1'>
              <Label htmlFor='site-cutoff'>Cutoff Time (HH:MM, optional)</Label>
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
                {isCreating ? "Creating..." : "Create Site"}
              </Button>
              <Button type='button' variant='outline' onClick={onClose}>
                Cancel
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
          <h2 className='text-base font-semibold text-foreground'>Edit Site</h2>
          <form onSubmit={handleSubmit} className='space-y-3'>
            <div className='space-y-1'>
              <Label htmlFor='edit-site-name'>Name</Label>
              <Input
                id='edit-site-name'
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className='space-y-1'>
              <Label htmlFor='edit-site-address'>Address</Label>
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
              <Label htmlFor='edit-site-timezone'>Timezone</Label>
              <Input
                id='edit-site-timezone'
                value={form.timezone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, timezone: e.target.value }))
                }
              />
            </div>
            <div className='space-y-1'>
              <Label htmlFor='edit-site-cutoff'>Cutoff Time (HH:MM, optional)</Label>
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
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
              <Button type='button' variant='outline' onClick={onClose}>
                Cancel
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
  const router = useRouter();
  const { sites, isLoading, create, isCreating, update, isUpdating } = useAdminSites();
  const [showCreate, setShowCreate] = useState(false);
  const [editSite, setEditSite] = useState<AdminSiteDetail | null>(null);
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-bold text-foreground'>
            Sites & QR Codes
          </h1>
          <p className='text-sm text-muted-foreground'>
            Manage parking sites and their QR codes
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className='mr-2 h-4 w-4' /> New Site
        </Button>
      </div>

      {isLoading ? (
        <p className='text-sm text-muted-foreground'>Loading...</p>
      ) : sites.length === 0 ? (
        <div className='flex h-40 items-center justify-center rounded-lg border border-dashed border-border'>
          <p className='text-sm text-muted-foreground'>
            No sites yet. Create one to get started.
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
                    <PauseCircle className='h-3 w-3' /> Paused
                  </span>
                ) : (
                  <span className='flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-600'>
                    <PlayCircle className='h-3 w-3' /> Active
                  </span>
                )}
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setEditSite(site)}
                >
                  Edit
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => router.push(`/sites/${site.id}`)}
                >
                  Manage QR <ChevronRight className='ml-1 h-3 w-3' />
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
    </div>
  );
}
