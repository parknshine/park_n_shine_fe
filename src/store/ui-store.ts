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

interface UIState {
  toasts: Toast[];
  isSidebarOpen: boolean;
  activeSiteId: string | null;
  sites: AdminSite[];
}

interface UIActions {
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveSiteId: (siteId: string) => void;
  setSites: (sites: AdminSite[]) => void;
}

export const useUIStore = create<UIState & UIActions>()(
  persist(
  immer((set) => ({
    toasts: [],
    isSidebarOpen: true,
    activeSiteId: "site-1",
    sites: [
      { id: "site-1", name: "Site Thamrin" },
      { id: "site-2", name: "Site Sudirman" },
    ],

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
  })),
  {
    name: "ui",
    partialize: (state) => ({
      activeSiteId: state.activeSiteId,
      sites: state.sites,
    }),
  }
));
