import { describe, it, expect } from "bun:test";
import type { ChatConversation, ChatMessage } from "@/features/admin/types";

describe("ChatConversation shape", () => {
  it("accepts a valid conversation object", () => {
    const conv: ChatConversation = {
      id: "conv_1",
      phone: "6281234567890",
      customerId: null,
      lastMessagePreview: "Halo",
      lastMessageAt: new Date().toISOString(),
      unreadCount: 2,
      windowOpen: true,
    };
    expect(conv.id).toBe("conv_1");
    expect(conv.windowOpen).toBe(true);
  });
});

describe("ChatMessage shape", () => {
  it("accepts a FAILED outbound message", () => {
    const msg: ChatMessage = {
      id: "msg_1",
      conversationId: "conv_1",
      direction: "OUTBOUND",
      type: "text",
      body: "Hello",
      status: "FAILED",
      providerMessageId: null,
      errorCode: "131026",
      createdAt: new Date().toISOString(),
    };
    expect(msg.status).toBe("FAILED");
    expect(msg.direction).toBe("OUTBOUND");
  });
});
