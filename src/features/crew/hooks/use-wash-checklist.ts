"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { mutationKeys, queryKeys } from "@/lib/query-keys";
import type {
  CompleteChecklistPayload,
  WashChecklistItem,
} from "@/features/crew/types";

export function useWashChecklist(jobId: string, initialItems: WashChecklistItem[]) {
  const queryClient = useQueryClient();
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState<string | null>(null);

  const nextItem = items
    .slice()
    .sort((a, b) => a.order - b.order)
    .find((item) => !item.completedAt);

  const mutation = useMutation({
    meta: { persist: false },
    mutationFn: async (payload: CompleteChecklistPayload) => {
      const response = await api.post<WashChecklistItem>(
        `/v1/crew/jobs/${jobId}/checklist`,
        payload
      );
      return response.data;
    },
    mutationKey: mutationKeys.crew.checklist(jobId),
    onSuccess: (updatedItem) => {
      setItems((current) =>
        current.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.crew.job(jobId) });
    },
  });

  async function completeItem(itemId: string) {
    if (nextItem?.id !== itemId) {
      setError("checklist_must_follow_order");
      return null;
    }

    setError(null);

    return mutation.mutateAsync({
      checklistItemId: itemId,
      completedAt: new Date().toISOString(),
    });
  }

  const mutationError =
    mutation.error instanceof Error
      ? mutation.error.message
      : mutation.error
        ? "checklist_save_failed"
        : null;

  return {
    completeItem,
    error: error ?? mutationError,
    isComplete: items.every((item) => item.completedAt),
    isOfflinePaused: mutation.isPaused,
    items,
    nextItem,
    pendingItemId:
      mutation.variables && mutation.isPending
        ? mutation.variables.checklistItemId
        : null,
  };
}
