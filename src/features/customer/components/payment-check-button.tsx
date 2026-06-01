"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentCheckButtonProps {
  onCheck: () => void | Promise<unknown>;
  isChecking?: boolean;
  delayMs?: number;
  label?: string;
}

export function PaymentCheckButton({
  onCheck,
  isChecking = false,
  delayMs = 30_000,
  label = "Cek Status Pembayaran",
}: PaymentCheckButtonProps) {
  const [isVisible, setIsVisible] = useState(delayMs === 0);

  useEffect(() => {
    if (delayMs === 0) return;
    const timer = window.setTimeout(() => setIsVisible(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  if (!isVisible) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full"
      disabled={isChecking}
      onClick={() => void onCheck()}
    >
      {isChecking ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="mr-2 h-4 w-4" />
      )}
      {isChecking ? "Mengecek..." : label}
    </Button>
  );
}
