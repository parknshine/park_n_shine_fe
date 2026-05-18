"use client";

import { Toaster as HotToaster, ToastBar, toast } from "react-hot-toast";
import { X } from "lucide-react";

// Left-border accent colour per toast type
const accent: Record<string, string> = {
  success: "#22c55e",
  error:   "var(--destructive)",
  loading: "var(--primary)",
  blank:   "var(--muted-foreground)",
};

export function Toaster() {
  return (
    <HotToaster
      position="bottom-right"
      gutter={8}
      toastOptions={{ duration: 4000 }}
    >
      {(t) => (
        // Strip all default ToastBar chrome — we render our own
        <ToastBar
          toast={t}
          style={{ padding: 0, background: "transparent", boxShadow: "none" }}
        >
          {({ icon, message }) => (
            <div
              className="flex min-w-64 max-w-sm items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-xl"
              style={{
                // Use CSS tokens so light/dark mode works automatically
                background:      "var(--card)",
                color:           "var(--card-foreground)",
                borderColor:     "var(--border)",
                borderLeftWidth: "4px",
                borderLeftColor: accent[t.type] ?? accent.blank,
              }}
            >
              {/* Icon — react-hot-toast renders the animated check/spinner/× */}
              <span className="shrink-0 leading-none">{icon}</span>

              {/* Message */}
              <span className="flex-1 font-medium leading-snug">{message}</span>

              {/* Dismiss button — hidden while loading */}
              {t.type !== "loading" && (
                <button
                  onClick={() => toast.dismiss(t.id)}
                  aria-label="Dismiss"
                  className="ml-1 shrink-0 rounded-lg p-1 transition-colors"
                  style={{ color: "var(--muted-foreground)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--muted)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground)";
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </ToastBar>
      )}
    </HotToaster>
  );
}
