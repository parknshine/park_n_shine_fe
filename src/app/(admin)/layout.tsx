"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { AdminSidebar, AdminNavbar } from "@/features/admin/components";
import { useAdminSites } from "@/features/admin/hooks";

export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (!token) {
      router.replace("/admin/login");
    }
  }, [router]);

  // Always fetch fresh sites on every admin page so sidebar stays in sync
  useAdminSites();

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
