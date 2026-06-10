import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

interface AdminSite {
  id: string;
  name: string;
}

interface TimeExtNotification {
  bookingId: string;
  crewId?: string;
  ts: number;
}

interface UIState {
  toasts: Toast[];
  isSidebarOpen: boolean;
  activeSiteId: string | null;
  sites: AdminSite[];
  locale: "id" | "en";
  timeExtNotifications: TimeExtNotification[];
  drawerBookingId: string | null;
}

interface UIActions {
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveSiteId: (siteId: string) => void;
  setSites: (sites: AdminSite[]) => void;
  setLocale: (locale: "id" | "en") => void;
  addTimeExtNotification: (n: TimeExtNotification) => void;
  removeTimeExtNotification: (bookingId: string) => void;
  setDrawerBookingId: (bookingId: string | null) => void;
}

export const useUIStore = create<UIState & UIActions>()(
  persist(
    immer((set) => ({
      toasts: [],
      isSidebarOpen: true,
      activeSiteId: null,
      sites: [],
      locale: "id",
      timeExtNotifications: [],
      drawerBookingId: null,

      addToast: (toast) =>
        set((state) => {
          state.toasts.push({ ...toast, id: crypto.randomUUID() });
        }),

      removeToast: (id) =>
        set((state) => {
          state.toasts = state.toasts.filter((t) => t.id !== id);
        }),

      toggleSidebar: () =>
        set((state) => {
          state.isSidebarOpen = !state.isSidebarOpen;
        }),

      setSidebarOpen: (open) =>
        set((state) => {
          state.isSidebarOpen = open;
        }),

      setActiveSiteId: (siteId) =>
        set((state) => {
          state.activeSiteId = siteId;
        }),

      setSites: (sites) =>
        set((state) => {
          state.sites = sites;
        }),

      setLocale: (locale) =>
        set((state) => {
          state.locale = locale;
        }),

      addTimeExtNotification: (n) =>
        set((state) => {
          // deduplicate by bookingId — only one notification per booking at a time
          if (!state.timeExtNotifications.some((x) => x.bookingId === n.bookingId)) {
            state.timeExtNotifications.push(n);
          }
        }),

      removeTimeExtNotification: (bookingId) =>
        set((state) => {
          state.timeExtNotifications = state.timeExtNotifications.filter(
            (x) => x.bookingId !== bookingId
          );
        }),

      setDrawerBookingId: (bookingId) =>
        set((state) => {
          state.drawerBookingId = bookingId;
        }),
    })),
    {
      name: "ui",
      partialize: (state) => ({
        activeSiteId: state.activeSiteId,
        sites: state.sites,
        locale: state.locale,
      }),
      skipHydration: true,
    }
  )
);
