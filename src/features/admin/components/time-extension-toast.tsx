"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Timer } from "lucide-react";
import api from "@/lib/axios";
import { useTranslation } from "@/i18n";

interface TimeExtensionToastProps {
  bookingId: string;
  toastId: string;
  onDone: () => void;
  defaultMinutes: number;
}

export function TimeExtensionToast({ bookingId, toastId, onDone, defaultMinutes }: TimeExtensionToastProps) {
  const { t } = useTranslation("admin");
  const [minutes, setMinutes] = useState<number>(defaultMinutes);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function respond(approved: boolean) {
    setIsSubmitting(true);
    try {
      await api.post(`/v1/admin/bookings/${bookingId}/time-extension-request/respond`, {
        approved,
        ...(approved ? { minutes } : {}),
      });
      toast.success(
        approved ? t("timeExtension.approveSuccess") : t("timeExtension.rejectSuccess"),
        { id: toastId }
      );
      onDone();
    } catch {
      toast.error(
        approved ? t("timeExtension.approveError") : t("timeExtension.rejectError")
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 min-w-[260px]">
      <div className="flex items-center gap-2">
        <Timer className="h-4 w-4 text-amber-500 shrink-0" />
        <span className="text-sm font-semibold">{t("timeExtension.toastTitle")}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        {t("timeExtension.toastBody", { bookingId: bookingId.slice(0, 8) })}
      </p>
      <div className="flex items-center gap-2 mt-1">
        <input
          type="number"
          min={1}
          max={60}
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          className="w-16 rounded border border-border px-2 py-1 text-xs text-center"
          disabled={isSubmitting}
        />
        <span className="text-xs text-muted-foreground">{t("timeExtension.minutes")}</span>
        <button
          onClick={() => respond(true)}
          disabled={isSubmitting}
          className="flex-1 rounded bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {t("timeExtension.approve")}
        </button>
        <button
          onClick={() => respond(false)}
          disabled={isSubmitting}
          className="flex-1 rounded border border-border px-3 py-1 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
        >
          {t("timeExtension.reject")}
        </button>
      </div>
    </div>
  );
}
