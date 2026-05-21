"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { queryKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared";
import { BOOKING_STATUS_TONES } from "@/features/customer/types";
import type { AdminBookingDetail } from "@/features/admin/types";
import { ReassignModal } from "./reassign-modal";
import { StatusOverrideModal } from "./status-override-modal";
import { RefundModal } from "./refund-modal";
import { useTranslation } from "@/i18n";

interface BookingDetailDrawerProps {
  bookingId: string | null;
  siteId: string;
  onClose: () => void;
  onActionSuccess: () => void;
}

export function BookingDetailDrawer({
  bookingId,
  siteId,
  onClose,
  onActionSuccess,
}: BookingDetailDrawerProps) {
  const [activeModal, setActiveModal] = useState<
    "reassign" | "override" | "refund" | null
  >(null);
  const { t } = useTranslation("admin");

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
            {booking && (
              <>
                <span className="font-semibold text-foreground">
                  {booking.plateText ?? booking.id}
                </span>
                <StatusBadge tone={BOOKING_STATUS_TONES[booking.status] ?? "neutral"}>
                  {booking.status}
                </StatusBadge>
              </>
            )}
            {isLoading && (
              <span className="text-sm text-muted-foreground">{t("drawer.loading")}</span>
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
          {booking && (
            <>
              {/* Status History */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("drawer.statusHistory")}
                </h3>
                <ol className="space-y-2">
                  {booking.statusHistory.map((entry, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <StatusBadge tone={BOOKING_STATUS_TONES[entry.status] ?? "neutral"}>
                        {entry.status}
                      </StatusBadge>
                      <span className="text-muted-foreground">
                        {new Date(entry.changedAt).toLocaleString("id-ID")}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Media */}
              {booking.media.length > 0 && (
                <section>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("drawer.photos")}
                  </h3>
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
                </section>
              )}

              {/* Actions */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("drawer.actions")}
                </h3>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveModal("reassign")}
                  >
                    {t("drawer.reassignCrew")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveModal("override")}
                  >
                    {t("drawer.overrideStatus")}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setActiveModal("refund")}
                  >
                    {t("drawer.refund")}
                  </Button>
                </div>
              </section>

              {/* Audit entries */}
              {booking.auditEntries.length > 0 && (
                <section>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("drawer.auditLog")}
                  </h3>
                  <ol className="space-y-2">
                    {booking.auditEntries.map((entry) => (
                      <li
                        key={entry.id}
                        className="rounded-md border border-border p-3 text-sm"
                      >
                        <p className="font-medium text-foreground capitalize">
                          {entry.action.replace(/_/g, " ")}
                        </p>
                        <p className="text-muted-foreground">{entry.detail}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleString("id-ID")}
                        </p>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </>
          )}
        </div>
      </aside>

      {/* Modals */}
      {booking && (
        <>
          <ReassignModal
            open={activeModal === "reassign"}
            siteId={siteId}
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
            priceAmount={booking.priceAmount ?? 0}
            onClose={() => setActiveModal(null)}
            onSuccess={() => { setActiveModal(null); onActionSuccess(); }}
          />
        </>
      )}
    </>
  );
}
