import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsAppSupportWidgetProps {
  phoneNumber: string;
  message?: string;
  className?: string;
  label: string;
}

export function WhatsAppSupportWidget({
  phoneNumber,
  message,
  className,
  label,
}: WhatsAppSupportWidgetProps) {
  const params = message ? `?text=${encodeURIComponent(message)}` : "";

  return (
    <a
      aria-label={label}
      className={cn(
        "fixed bottom-14 right-5 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
        className
      )}
      href={`https://wa.me/${phoneNumber}${params}`}
      rel="noreferrer"
      target="_blank"
    >
      <MessageCircle className="h-5 w-5" />
    </a>
  );
}
