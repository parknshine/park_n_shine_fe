import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

interface UIState {
  toasts: Toast[];
  isSidebarOpen: boolean;
}

interface UIActions {
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState & UIActions>()(
  immer((set) => ({
    // state
    toasts: [],
    isSidebarOpen: true,

    // actions
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
  }))
);
