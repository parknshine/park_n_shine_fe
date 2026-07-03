"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import adminApi from "@/lib/axios-admin";
import { queryKeys } from "@/lib/query-keys";
import type { ChatConversation, ChatMessage } from "@/features/admin/types";

export function useAdminChatConversations() {
  const query = useQuery({
    queryKey: queryKeys.admin.chatConversations(),
    queryFn: async () => {
      const res = await adminApi.get("/v1/admin/chat/conversations", {
        params: { limit: 50 },
      });
      const raw = res.data as { conversations: ChatConversation[]; cursor: string | null };
      return raw;
    },
    staleTime: 30_000,
  });

  return {
    conversations: query.data?.conversations ?? [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  };
}

export function useAdminChatMessages(conversationId: string | null) {
  const query = useQuery({
    queryKey: queryKeys.admin.chatMessages(conversationId ?? ""),
    enabled: !!conversationId,
    queryFn: async () => {
      const res = await adminApi.get(
        `/v1/admin/chat/conversations/${conversationId}/messages`,
        { params: { limit: 100 } },
      );
      const raw = res.data as { messages: ChatMessage[]; cursor: string | null };
      return raw;
    },
    staleTime: 0,
  });

  return {
    messages: query.data?.messages ?? [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  };
}

export function useAdminChatSend(conversationId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await adminApi.post(
        `/v1/admin/chat/conversations/${conversationId}/messages`,
        { text },
      );
      return res.data as ChatMessage;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.chatMessages(conversationId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.chatConversations(),
      });
    },
  });

  return {
    sendMessage: mutation.mutateAsync,
    isSending: mutation.isPending,
    sendError: mutation.error instanceof Error ? mutation.error.message : null,
  };
}

export function useAdminChatMarkRead(conversationId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      await adminApi.post(
        `/v1/admin/chat/conversations/${conversationId}/read`,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.chatConversations(),
      });
    },
  });

  return { markRead: mutation.mutate };
}
