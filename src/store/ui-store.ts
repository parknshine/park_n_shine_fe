import { create } from "zustand";
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
  immer((set) => ({
    toasts: [],
    isSidebarOpen: true,
    activeSiteId: null,
    sites: [],

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
  }))
);
