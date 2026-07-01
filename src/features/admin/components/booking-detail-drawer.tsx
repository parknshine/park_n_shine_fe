"use client";

import { useState } from "react";
import { X, Timer } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAdminSettings } from "@/features/admin/hooks";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios-admin";
import { queryKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared";
import { BOOKING_STATUS_TONES } from "@/features/customer/types";
import type { AdminBookingDetail } from "@/features/admin/types";
import { ReassignModal } from "./reassign-modal";
import { StatusOverrideModal } from "./status-override-modal";
import { RefundModal } from "./refund-modal";
import { useTranslation } from "@/i18n";
import { useAuthStore } from "@/store/auth-store";
import { formatAuditDetail, formatAuditAction } from "@/features/admin/utils/format-audit-detail";
import { bookingRef } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface BookingDetailDrawerProps {
  bookingId: string | null;
  onClose: () => void;
  onActionSuccess: () => void;
}

export function BookingDetailDrawer({
  bookingId,
  onClose,
  onActionSuccess,
}: Readonly<BookingDetailDrawerProps>) {
  const [activeModal, setActiveModal] = useState<
    "reassign" | "override" | "refund" | null
  >(null);
  const [showExtend, setShowExtend] = useState(false);
  const [extendMinutes, setExtendMinutes] = useState<number | "">("");
  const [extendStatus, setExtendStatus] = useState("");
  const [isExtending, setIsExtending] = useState(false);
  const [pendingExtMinutes, setPendingExtMinutes] = useState("10");
  const [isRespondingToExtension, setIsRespondingToExtension] = useState(false);
  const { t } = useTranslation("admin");
  const role = useAuthStore((s) => s.role);
  const { settings } = useAdminSettings();
  const defaultExtendMinutes = settings?.crewTimeExtensionMinutes ?? 10;

  async function handleTimeExtensionRespond(approved: boolean, minutes: number) {
    if (!bookingId) return;
    setIsRespondingToExtension(true);
    try {
      await api.post(`/v1/admin/bookings/${bookingId}/time-extension-request/respond`, {
        approved,
        ...(approved ? { minutes } : {}),
      });
      toast.success(approved ? t("timeExtension.approveSuccess") : t("timeExtension.rejectSuccess"));
      onActionSuccess();
    } catch {
      toast.error(approved ? t("timeExtension.approveError") : t("timeExtension.rejectError"));
    } finally {
      setIsRespondingToExtension(false);
    }
  }

  async function handleExtendTime() {
    if (!bookingId) return;
    setIsExtending(true);
    try {
      const minutes = typeof extendMinutes === "number" && extendMinutes > 0
        ? extendMinutes
        : defaultExtendMinutes;
      await api.post(`/v1/admin/bookings/${bookingId}/extend-time`, {
        minutes,
        ...(extendStatus ? { newStatus: extendStatus } : {}),
      });
      toast.success(t("drawer.extendTimeSuccess"));
      setShowExtend(false);
      setExtendMinutes("");
      setExtendStatus("");
      onActionSuccess();
    } catch {
      toast.error(t("drawer.extendTimeError"));
    } finally {
      setIsExtending(false);
    }
  }

  const { data: booking, isLoading } = useQuery({
    enabled: !!bookingId,
    queryKey: bookingId ? queryKeys.admin.booking(bookingId) : ["noop"],
    queryFn: async () => {
      const response = await api.get<AdminBookingDetail>(
        `/v1/admin/bookings/${bookingId}`
      );
      return response.data;
    },
  });

  if (!bookingId) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            {isLoading && (
              <>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </>
            )}
            {booking && (
              <>
                <span className="font-semibold text-foreground">
                  {booking.plateText ?? bookingRef(booking.reference, booking.id)}
                </span>
                <StatusBadge tone={BOOKING_STATUS_TONES[booking.status] ?? "neutral"}>
                  {booking.status}
                </StatusBadge>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground"
            aria-label={t("drawer.closeAriaLabel")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {isLoading && <DrawerSkeleton />}
          {booking && (
            <>
              {/* Booking Info */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("drawer.bookingInfo")}
                </h3>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">{t("drawer.site")}</dt>
                  <dd className="font-medium text-foreground">{booking.siteName}</dd>

                  <dt className="text-muted-foreground">{t("drawer.slot")}</dt>
                  <dd className="font-medium text-foreground">{booking.slotText ?? "—"}</dd>

                  <dt className="text-muted-foreground">{t("drawer.crew")}</dt>
                  <dd className="font-medium text-foreground">
                    {booking.crewName ?? t("common:unassigned")}
                  </dd>

                  <dt className="text-muted-foreground">{t("drawer.price")}</dt>
                  <dd className="font-medium text-foreground">
                    {booking.priceAmount == null
                      ? "—"
                      : formatPrice(booking.priceAmount, booking.currency ?? "IDR")}
                  </dd>

                  <dt className="text-muted-foreground">{t("drawer.elapsed")}</dt>
                  <dd className="font-medium text-foreground">
                    {formatElapsed(booking.elapsedSeconds, t)}
                  </dd>

                  <dt className="text-muted-foreground">{t("drawer.estimatedReady")}</dt>
                  <dd className="font-medium text-foreground">
                    {booking.estimatedReadyAt
                      ? new Date(booking.estimatedReadyAt).toLocaleString("id-ID")
                      : "—"}
                  </dd>
                </dl>
              </section>

              {/* Status History */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("drawer.statusHistory")}
                </h3>
                {booking.statusHistory.length > 0 ? (
                  <ol className="space-y-2">
                    {booking.statusHistory.map((entry, i) => (
                      <li key={i} className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-3">
                          <StatusBadge tone={BOOKING_STATUS_TONES[entry.status] ?? "neutral"}>
                            {entry.status}
                          </StatusBadge>
                          <span className="text-muted-foreground">
                            {new Date(entry.changedAt).toLocaleString("id-ID")}
                          </span>
                        </div>
                        {entry.reason && (
                          <p className="ml-1 text-xs text-muted-foreground italic">
                            {entry.reason}
                          </p>
                        )}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("drawer.noStatusHistory")}</p>
                )}
              </section>

              {/* Photos */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("drawer.photos")}
                </h3>
                {booking.media.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {booking.media.map((m) => (
                      <div key={m.id} className="space-y-1">
                        <img
                          src={m.url}
                          alt={m.kind}
                          className="h-24 w-full rounded-md object-cover border border-border"
                        />
                        <p className="text-xs text-muted-foreground capitalize">
                          {m.kind}
                          {m.ocrText ? ` — ${m.ocrText}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("drawer.noPhotos")}</p>
                )}
              </section>

              {/* Actions */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("drawer.actions")}
                </h3>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={["READY", "CLOSED", "CANCELLED", "EXPIRED", "ASSIGNED", "LOCATED", "IN_PROGRESS"].includes(booking.status)}
                    onClick={() => setActiveModal("reassign")}
                  >
                    {t("drawer.reassignCrew")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={["CLOSED", "EXPIRED", "ASSIGNED", "LOCATED", "IN_PROGRESS"].includes(booking.status)}
                    onClick={() => setActiveModal("override")}
                  >
                    {t("drawer.overrideStatus")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={["CLOSED", "CANCELLED", "EXPIRED", "DRAFT", "PENDING", "PAID"].includes(booking.status)}
                    onClick={() => setShowExtend((v) => !v)}
                    prefix={<Timer className="h-3.5 w-3.5" />}
                  >
                    {t("drawer.extendTime")}
                  </Button>
                  {showExtend && (
                    <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2">
                      <p className="text-xs font-semibold text-foreground">{t("drawer.extendTimeTitle")}</p>
                      <div>
                        <label className="text-xs text-muted-foreground">{t("drawer.extendTimeMinutes")}</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder={String(defaultExtendMinutes)}
                          value={extendMinutes}
                          onChange={(e) => setExtendMinutes(e.target.value === "" ? "" : Number(e.target.value))}
                          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">{t("drawer.extendTimeStatus")}</label>
                        <select
                          value={extendStatus}
                          onChange={(e) => setExtendStatus(e.target.value)}
                          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">— {t("drawer.extendTimeStatus")} —</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="LOCATED">LOCATED</option>
                          <option value="ASSIGNED">ASSIGNED</option>
                          <option value="NEEDS_HELP">NEEDS_HELP</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="default" onClick={handleExtendTime} disabled={isExtending} className="flex-1">
                          {isExtending ? "..." : t("drawer.extendTimeSubmit")}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowExtend(false)} disabled={isExtending}>
                          {t("drawer.extendTimeCancel")}
                        </Button>
                      </div>
                    </div>
                  )}
                  {booking?.pendingTimeExtension?.status === "PENDING" &&
                    !["CLOSED", "CANCELLED", "EXPIRED"].includes(booking.status) && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/40">
                      <div className="mb-2 flex items-center gap-1.5">
                        <Timer className="h-3.5 w-3.5 text-amber-600" />
                        <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                          {t("timeExtension.toastTitle")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={pendingExtMinutes}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setPendingExtMinutes(val);
                          }}
                          className="w-16 rounded border border-amber-200 px-2 py-1 text-center text-xs"
                          disabled={isRespondingToExtension}
                        />
                        <span className="text-xs text-muted-foreground">{t("timeExtension.minutes")}</span>
                        <Button
                          size="sm"
                          variant="default"
                          disabled={isRespondingToExtension || !pendingExtMinutes || Number(pendingExtMinutes) < 1}
                          onClick={() => handleTimeExtensionRespond(true, Number(pendingExtMinutes))}
                        >
                          {t("timeExtension.approve")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isRespondingToExtension}
                          onClick={() => handleTimeExtensionRespond(false, 0)}
                        >
                          {t("timeExtension.reject")}
                        </Button>
                      </div>
                    </div>
                  )}
                  {role === "super_admin" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={["DRAFT", "PENDING", "ASSIGNED", "LOCATED", "IN_PROGRESS"].includes(booking.status)}
                      onClick={() => setActiveModal("refund")}
                    >
                      {t("drawer.refund")}
                    </Button>
                  )}
                </div>
              </section>

              {/* Audit Log */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("drawer.auditLog")}
                </h3>
                {booking.auditEntries.length > 0 ? (
                  <ol className="space-y-2">
                    {booking.auditEntries.map((entry) => (
                      <li
                        key={entry.id}
                        className="rounded-md border border-border p-3 text-sm"
                      >
                        <p className="font-medium text-foreground capitalize">
                          {formatAuditAction(entry.action)}
                        </p>
                        <p className="text-muted-foreground">{formatAuditDetail(entry.action, entry.detail)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleString("id-ID")}
                        </p>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("drawer.noAuditLog")}</p>
                )}
              </section>
            </>
          )}
        </div>
      </aside>

      {/* Modals */}
      {booking && (
        <>
          <ReassignModal
            open={activeModal === "reassign"}
            bookingId={booking.id}
            onClose={() => setActiveModal(null)}
            onSuccess={() => { setActiveModal(null); onActionSuccess(); }}
          />
          <StatusOverrideModal
            open={activeModal === "override"}
            bookingId={booking.id}
            currentStatus={booking.status}
            onClose={() => setActiveModal(null)}
            onSuccess={() => { setActiveModal(null); onActionSuccess(); }}
          />
          <RefundModal
            open={activeModal === "refund"}
            bookingId={booking.id}
            bookingStatus={booking.status}
            priceAmount={booking.priceAmount ?? 0}
            onClose={() => setActiveModal(null)}
            onSuccess={() => { setActiveModal(null); onActionSuccess(); }}
          />
        </>
      )}
    </>
  );
}

function DrawerSkeleton() {
  return (
    <div className="space-y-6">
      {/* Booking Info */}
      <section>
        <Skeleton className="mb-3 h-3 w-24" />
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <>
              <Skeleton key={`label-${i}`} className="h-4 w-16" />
              <Skeleton key={`value-${i}`} className="h-4 w-32" />
            </>
          ))}
        </div>
      </section>

      {/* Status History */}
      <section>
        <Skeleton className="mb-3 h-3 w-28" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </section>

      {/* Photos */}
      <section>
        <Skeleton className="mb-3 h-3 w-16" />
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </section>

      {/* Actions */}
      <section>
        <Skeleton className="mb-3 h-3 w-16" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </section>

      {/* Audit Log */}
      <section>
        <Skeleton className="mb-3 h-3 w-20" />
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      </section>
    </div>
  );
}

function formatElapsed(
  seconds: number,
  t: (key: string, opts?: Record<string, unknown>) => string
): string {
  if (seconds < 60) return t("queueGroup.seconds", { n: seconds });
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t("queueGroup.minutes", { n: minutes });
  return t("queueGroup.hours", { h: Math.floor(minutes / 60), m: minutes % 60 });
}

function formatPrice(amount: number, currency: string = "IDR"): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
