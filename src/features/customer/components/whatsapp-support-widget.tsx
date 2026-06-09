import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsAppSupportWidgetProps {
  phoneNumber: string;
  message?: string;
  className?: string;
  label: string;
  inquiryText?: string;
}

export function WhatsAppSupportWidget({
  phoneNumber,
  message,
  className,
  label,
  inquiryText,
}: WhatsAppSupportWidgetProps) {
  const params = message ? `?text=${encodeURIComponent(message)}` : "";
  const displayText = inquiryText ?? `If there is any inquiry, please contact WhatsApp: ${phoneNumber}`;

  return (
    <a
      aria-label={label}
      className={cn(
        "fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-emerald-500 px-4 py-2.5 text-white shadow-lg transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
        className
      )}
      href={`https://wa.me/${phoneNumber}${params}`}
      rel="noreferrer"
      target="_blank"
    >
      <MessageCircle className="h-4 w-4 shrink-0" />
      <span className="whitespace-nowrap text-xs font-medium">{displayText}</span>
    </a>
  );
}
