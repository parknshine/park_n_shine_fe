"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronRight, PauseCircle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminSites } from "@/features/admin/hooks";
import type { CreateSitePayload } from "@/features/admin/types";

function CreateSiteModal({
  onClose,
  onCreate,
  isCreating,
}: {
  onClose: () => void;
  onCreate: (payload: CreateSitePayload) => Promise<unknown>;
  isCreating: boolean;
}) {
  const [form, setForm] = useState<CreateSitePayload>({
    name: "",
    address: "",
    timezone: "Asia/Jakarta",
    cutoffTime: null,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onCreate(form);
    onClose();
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
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
            <Input
              id='site-address'
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
              required
            />
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
  );
}

export default function SitesPage() {
  const router = useRouter();
  const { sites, isLoading, create, isCreating } = useAdminSites();
  const [showCreate, setShowCreate] = useState(false);
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
    </div>
  );
}
