"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { AdminSidebar } from "@/features/admin/components";
import { useUIStore } from "@/store/ui-store";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const sites = useUIStore((s) => s.sites);
  const activeSiteId = useUIStore((s) => s.activeSiteId);
  const setSites = useUIStore((s) => s.setSites);
  const setActiveSiteId = useUIStore((s) => s.setActiveSiteId);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    if (sites.length === 0) {
      try {
        const stored = localStorage.getItem("admin-sites");
        if (stored) {
          const parsed = JSON.parse(stored) as Array<{ id: string; name: string }>;
          setSites(parsed);
          if (!activeSiteId && parsed.length > 0) {
            setActiveSiteId(parsed[0].id);
          }
        }
      } catch {
        // ignore malformed localStorage
      }
    }
  }, [router, sites.length, activeSiteId, setSites, setActiveSiteId]);

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
