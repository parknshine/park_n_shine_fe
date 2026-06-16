import { TriangleAlert } from "lucide-react";
import type { GuardConfig } from "@/features/customer/hooks/use-navigation-guard-config";

interface NavigationGuardModalProps {
  readonly open: boolean;
  readonly config: GuardConfig | null;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

export function NavigationGuardModal({
  open,
  config,
  onConfirm,
  onCancel,
}: NavigationGuardModalProps) {
  if (!open || !config) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <TriangleAlert className="h-8 w-8 text-amber-500" />
          </div>
          <p className="text-sm text-muted-foreground">{config.message}</p>
          <div className="flex w-full flex-col gap-2 pt-1">
            <button
              onClick={onConfirm}
              className="w-full rounded-xl bg-destructive py-3 text-sm font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90"
            >
              {config.confirmLabel}
            </button>
            <button
              onClick={onCancel}
              className="w-full rounded-xl border border-border bg-background py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              {config.cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
