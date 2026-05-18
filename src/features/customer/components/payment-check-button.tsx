"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentCheckButtonProps {
  onCheck: () => void;
  delayMs?: number;
  label?: string;
}

export function PaymentCheckButton({
  onCheck,
  delayMs = 30_000,
  label = "Cek Status Pembayaran",
}: PaymentCheckButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsVisible(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  if (!isVisible) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full"
      prefix={<RefreshCw className="h-4 w-4" />}
      onClick={onCheck}
    >
      {label}
    </Button>
  );
}
