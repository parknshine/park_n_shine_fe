"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MessageComposerProps {
  windowOpen: boolean;
  isSending: boolean;
  onSend: (text: string) => Promise<void>;
}

export function MessageComposer({ windowOpen, isSending, onSend }: MessageComposerProps) {
  const [text, setText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isDisabled = !windowOpen || isSending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isDisabled) return;
    setErrorMsg(null);
    try {
      await onSend(trimmed);
      setText("");
    } catch {
      setErrorMsg("Gagal mengirim pesan, coba lagi.");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e as unknown as React.FormEvent);
    }
  }

  return (
    <div className="border-t border-border bg-background px-4 py-3">
      {!windowOpen && (
        <p className="mb-2 text-center text-xs text-muted-foreground">
          Window 24 jam tutup — menunggu customer membalas
        </p>
      )}
      {errorMsg && (
        <p className="mb-2 text-center text-xs text-destructive">{errorMsg}</p>
      )}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <textarea
          className={cn(
            "min-h-[40px] max-h-[120px] flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring",
            isDisabled && "cursor-not-allowed opacity-50",
          )}
          placeholder={windowOpen ? "Ketik pesan..." : ""}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          rows={1}
        />
        <Button type="submit" size="sm" disabled={isDisabled || !text.trim()}>
          <Send className="h-4 w-4" />
          <span className="sr-only">Kirim</span>
        </Button>
      </form>
    </div>
  );
}
