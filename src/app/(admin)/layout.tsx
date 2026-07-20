"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ADMIN_MENUS, accessForPath } from "@/lib/menu-access";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminSidebar, AdminNavbar, BookingDetailDrawer } from "@/features/admin/components";
import { useAdminSites } from "@/features/admin/hooks";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";
import { invalidatePaymentQueries } from "@/features/admin/utils/realtime-invalidations";
import { useUIStore } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";
import { queryKeys } from "@/lib/query-keys";

export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const addTimeExtNotification = useUIStore((s) => s.addTimeExtNotification);
  const drawerBookingId = useUIStore((s) => s.drawerBookingId);
  const setDrawerBookingId = useUIStore((s) => s.setDrawerBookingId);
  const removeTimeExtNotification = useUIStore((s) => s.removeTimeExtNotification);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);
  const menuAccess = useAuthStore((s) => s.menuAccess);
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/admin/login");
      return;
    }
    // Menu hidden for this user — bounce to the first menu they can see
    if (accessForPath(pathname, role, menuAccess) === "none") {
      const firstAllowed = ADMIN_MENUS.find(
        (m) => accessForPath(m.href, role, menuAccess) !== "none",
      );
      router.replace(firstAllowed?.href ?? "/admin/login");
    }
  }, [router, isAuthenticated, pathname, role, menuAccess]);

  // Always fetch fresh sites on every admin page so sidebar stays in sync
  useAdminSites();

  useAdminRealtime({
    onEvent: (event) => {
      if (event.type === "crew_time_extension_request" && event.bookingId) {
        addTimeExtNotification({
          bookingId: event.bookingId as string,
          crewId: event.crewId as string | undefined,
          ts: Date.now(),
        });
        void queryClient.invalidateQueries({ queryKey: queryKeys.admin.booking(event.bookingId as string) });
      }
      if (event.type === "new_job" || event.type === "job_assigned") {
        void queryClient.invalidateQueries({ queryKey: ["admin", "queue"] });
      }
      invalidatePaymentQueries(queryClient, event);
      if (event.type === "chat_message") {
        void queryClient.invalidateQueries({ queryKey: queryKeys.admin.chatConversations() });
        if (typeof event.conversationId === "string") {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.admin.chatMessages(event.conversationId),
          });
        }
      }
    },
  });

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      <BookingDetailDrawer
        bookingId={drawerBookingId}
        onClose={() => setDrawerBookingId(null)}
        onActionSuccess={() => {
          if (drawerBookingId) {
            removeTimeExtNotification(drawerBookingId);
            void queryClient.invalidateQueries({ queryKey: ["admin", "booking", drawerBookingId] });
            void queryClient.invalidateQueries({ queryKey: ["admin", "queue"] });
          }
          setDrawerBookingId(null);
        }}
      />
    </div>
  );
}
