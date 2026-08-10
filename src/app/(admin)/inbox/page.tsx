"use client";

import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import {
  useAdminChatConversations,
  useAdminChatMessages,
  useAdminChatSend,
  useAdminChatMarkRead,
} from "@/features/admin/hooks";
import {
  ConversationList,
  MessageThread,
  MessageComposer,
} from "@/features/admin/components";

export default function InboxPage() {
  const { conversations, isLoading: isLoadingConversations } = useAdminChatConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedConv =
    conversations.find((conversation) => conversation.id === selectedId) ??
    conversations[0] ??
    null;
  const { messages, isLoading: isLoadingMessages } = useAdminChatMessages(selectedConv?.id ?? null);
  const { sendMessage, isSending } = useAdminChatSend(selectedConv?.id ?? "");
  const { markRead } = useAdminChatMarkRead(selectedConv?.id ?? "");

  useEffect(() => {
    if (selectedConv) markRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConv?.id]);

  const handleSend = async (text: string): Promise<void> => {
    await sendMessage(text);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-lg border border-border bg-background shadow-sm">
      <div className="flex w-72 shrink-0 flex-col border-r border-border">
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
          <h1 className="text-sm font-semibold text-foreground">Inbox WhatsApp</h1>
        </div>
        {isLoadingConversations ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">Memuat...</p>
          </div>
        ) : (
          <ConversationList
            conversations={conversations}
            selectedId={selectedConv?.id ?? null}
            onSelect={(conversation) => setSelectedId(conversation.id)}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {selectedConv ? (
          <>
            <div className="flex h-14 shrink-0 items-center border-b border-border px-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{selectedConv.phone}</p>
                {!selectedConv.windowOpen && (
                  <p className="text-[11px] text-amber-600">Window tertutup</p>
                )}
              </div>
            </div>
            <MessageThread messages={messages} isLoading={isLoadingMessages} />
            <MessageComposer
              windowOpen={selectedConv.windowOpen}
              isSending={isSending}
              onSend={handleSend}
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">Pilih percakapan untuk memulai.</p>
          </div>
        )}
      </div>
    </div>
  );
}
