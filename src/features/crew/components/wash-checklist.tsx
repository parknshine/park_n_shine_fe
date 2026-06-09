"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WashChecklistItem } from "@/features/crew/types";

function formatCompletedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

interface WashChecklistProps {
  items: WashChecklistItem[];
  nextItemId?: string;
  pendingItemId?: string | null;
  onComplete: (itemId: string) => void;
  labels?: {
    done: string;
    saving: string;
  };
}

export function WashChecklist({
  items,
  nextItemId,
  pendingItemId,
  onComplete,
  labels = {
    done: "crew.checklist.done",
    saving: "crew.checklist.saving",
  },
}: Readonly<WashChecklistProps>) {
  const sortedItems = items.slice().sort((a, b) => a.order - b.order);

  return (
    <ol className="space-y-3">
      {sortedItems.map((item) => {
        const isComplete = Boolean(item.completedAt);
        const canComplete = item.id === nextItemId && !pendingItemId;

        return (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-lg border border-border p-3"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
              {isComplete ? <Check className="h-4 w-4" /> : item.order}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {item.labelKey}
              </p>
              {item.completedAt && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatCompletedAt(item.completedAt)}
                </p>
              )}
            </div>
            {!isComplete && (
              <Button
                size="sm"
                disabled={!canComplete}
                onClick={() => onComplete(item.id)}
              >
                {pendingItemId === item.id ? labels.saving : labels.done}
              </Button>
            )}
          </li>
        );
      })}
    </ol>
  );
}
