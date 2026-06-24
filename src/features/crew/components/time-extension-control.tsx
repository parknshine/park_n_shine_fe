"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, Timer } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/i18n";
import api from "@/lib/axios-crew";
import { cn } from "@/lib/utils";

type TimeExtState = "idle" | "sending" | "pending" | "approved" | "rejected";

interface TimeExtensionControlProps {
  jobId: string;
  etaEndsAt?: string | null;
  className?: string;
}

// Request-more-time button + confirm modal, shared by the job-detail, wash and
// checklist pages. Approval arrives as an etaEndsAt change pushed by the
// crew-shell realtime handler; rejection arrives as a window event.
export function TimeExtensionControl({
  jobId,
  etaEndsAt,
  className,
}: Readonly<TimeExtensionControlProps>) {
  const { t } = useTranslation("crew");
  const [state, setState] = useState<TimeExtState>("idle");
  const [showConfirm, setShowConfirm] = useState(false);
  const prevEtaRef = useRef<string | null | undefined>(etaEndsAt);

  useEffect(() => {
    if (state !== "pending") return;
    if (etaEndsAt !== prevEtaRef.current) {
      setState("approved");
      toast.success(t("job.timeExt.approved"));
      prevEtaRef.current = etaEndsAt;
    }
  }, [etaEndsAt, state, t]);

  useEffect(() => {
    function handleRejected(e: Event) {
      const detail = (e as CustomEvent<{ bookingId: string }>).detail;
      if (detail.bookingId === jobId) {
        setState("rejected");
        toast.error(t("job.timeExt.rejected"));
      }
    }
    globalThis.addEventListener("time-extension-rejected", handleRejected);
    return () =>
      globalThis.removeEventListener("time-extension-rejected", handleRejected);
  }, [jobId, t]);

  async function handleRequest() {
    setState("sending");
    try {
      await api.post(`/v1/crew/jobs/${jobId}/request-time-extension`);
      setState("pending");
      toast.success(t("job.timeExt.pending"));
    } catch {
      setState("idle");
      toast.error(t("job.requestTimeExtensionError"));
    }
  }

  const prefix =
    state === "approved" ? (
      <CheckCircle2 className="h-4 w-4" />
    ) : state === "sending" || state === "pending" ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      <Timer className="h-4 w-4" />
    );

  return (
    <>
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="mx-auto max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-amber-500" />
              {t("job.timeExt.confirmTitle")}
            </DialogTitle>
            <DialogDescription>{t("job.timeExt.confirmDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowConfirm(false)}
            >
              {t("job.timeExt.confirmCancel")}
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onClick={() => {
                setShowConfirm(false);
                void handleRequest();
              }}
            >
              {t("job.timeExt.confirmOk")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button
        size="md"
        variant="ghost"
        className={cn(
          "w-full rounded-2xl font-semibold transition-all duration-300",
          state === "idle" &&
            "border border-dashed border-slate-300 bg-transparent text-slate-600 hover:border-slate-400 hover:bg-slate-50",
          state === "sending" &&
            "cursor-not-allowed border border-slate-200 bg-slate-50 text-slate-400",
          state === "pending" &&
            "border border-amber-300 bg-amber-50 text-amber-700 shadow-sm shadow-amber-100",
          state === "approved" &&
            "border-0 bg-linear-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-200/60 hover:from-emerald-500 hover:to-green-600",
          state === "rejected" &&
            "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100",
          className,
        )}
        onClick={
          state === "idle" || state === "rejected"
            ? () => setShowConfirm(true)
            : undefined
        }
        disabled={
          state === "sending" || state === "pending" || state === "approved"
        }
        prefix={prefix}
      >
        {state === "sending" && t("job.timeExt.sending")}
        {state === "pending" && t("job.timeExt.pending")}
        {state === "approved" && t("job.timeExt.approved")}
        {state === "rejected" && t("job.timeExt.requestAgain")}
        {state === "idle" && t("job.requestTimeExtension")}
      </Button>
    </>
  );
}
