"use client";

import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios-admin";

export type EmailTemplateType = "promotional" | "loyalty" | "service-update" | "custom";

export interface SendEmailPayload {
  to: string;
  toName?: string;
  subject: string;
  templateType: EmailTemplateType;
  templateData?: Record<string, unknown>;
  html?: string;
}

export interface BroadcastRecipient {
  email: string;
  name?: string;
}

export interface BroadcastEmailPayload {
  recipients: BroadcastRecipient[];
  subject: string;
  templateType: EmailTemplateType;
  templateData?: Record<string, unknown>;
  html?: string;
}

export interface BroadcastAllPayload {
  subject: string;
  templateType: EmailTemplateType;
  templateData?: Record<string, unknown>;
  html?: string;
}

export function useAdminEmail() {
  const sendMutation = useMutation({
    mutationFn: async (payload: SendEmailPayload) => {
      const res = await api.post<{ sent: boolean }>("/v1/admin/email/send", payload);
      return res.data;
    },
  });

  const broadcastMutation = useMutation({
    mutationFn: async (payload: BroadcastEmailPayload) => {
      const res = await api.post<{ sent: boolean; recipientCount: number }>(
        "/v1/admin/email/broadcast",
        payload
      );
      return res.data;
    },
  });

  const broadcastAllMutation = useMutation({
    mutationFn: async (payload: BroadcastAllPayload) => {
      const res = await api.post<{ sent: boolean; recipientCount: number }>(
        "/v1/admin/email/broadcast-all",
        payload
      );
      return res.data;
    },
  });

  return {
    sendEmail: sendMutation.mutateAsync,
    isSending: sendMutation.isPending,
    broadcastEmail: broadcastMutation.mutateAsync,
    isBroadcasting: broadcastMutation.isPending,
    broadcastToAll: broadcastAllMutation.mutateAsync,
    isBroadcastingAll: broadcastAllMutation.isPending,
  };
}
