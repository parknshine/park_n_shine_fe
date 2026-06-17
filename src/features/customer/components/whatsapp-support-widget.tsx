"use client";

import { useEffect, useRef, useState } from "react";
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
  label,
  className,
}: WhatsAppSupportWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const params = message ? `?text=${encodeURIComponent(message)}` : "";
  const href = `https://wa.me/${phoneNumber}${params}`;

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={cn("fixed bottom-20 right-4 z-50", className)}
    >
      {/* Popover */}
      <div
        className={cn(
          "absolute bottom-full right-0 mb-3 w-56 rounded-xl bg-white shadow-xl transition-all duration-150",
          isOpen
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        )}
        style={{ transformOrigin: "bottom right" }}
      >
        <div className="p-4">
          <p className="text-sm font-semibold text-gray-900">Ada pertanyaan?</p>
          <p className="mt-1 text-xs text-gray-500">
            Hubungi kami via WhatsApp
          </p>
          <a
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
            href={href}
            rel="noreferrer"
            target="_blank"
          >
            Buka WhatsApp →
          </a>
        </div>
        {/* Caret */}
        <div className="absolute -bottom-1.5 right-4 h-3 w-3 rotate-45 rounded-sm bg-white shadow-sm" />
      </div>

      {/* FAB button */}
      <button
        aria-expanded={isOpen}
        aria-label={label}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <MessageCircle className="h-5 w-5 shrink-0" />
      </button>
    </div>
  );
}
