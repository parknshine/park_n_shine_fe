import {
  Car,
  CheckCircle2,
  CreditCard,
  Droplets,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared";
import {
  BOOKING_STATUS_TONES,
  BOOKING_STATUSES,
  type BookingStatus,
} from "@/features/customer/types";

interface StatusHeroProps {
  status: BookingStatus;
  plate?: string | null;
  slot?: string | null;
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  DRAFT: "Menunggu",
  PENDING: "Menunggu Pembayaran",
  PAID: "Antrian — Menunggu crew",
  ASSIGNED: "Crew dalam perjalanan",
  IN_PROGRESS: "Sedang dicuci",
  READY: "Mobil Anda sudah bersih!",
  CLOSED: "Selesai",
  EXPIRED: "Booking kadaluarsa",
  CANCELLED: "Booking dibatalkan",
  NEEDS_HELP: "Kami membutuhkan info lebih lanjut",
  STALE: "Tidak Aktif",
};

function StatusIcon({ status }: { status: BookingStatus }) {
  const base = "h-10 w-10";
  if (status === BOOKING_STATUSES.READY || status === BOOKING_STATUSES.CLOSED) {
    return <CheckCircle2 className={cn(base, "text-primary")} />;
  }
  if (
    status === BOOKING_STATUSES.IN_PROGRESS ||
    status === BOOKING_STATUSES.ASSIGNED
  ) {
    return <Droplets className={cn(base, "text-primary")} />;
  }
  if (status === BOOKING_STATUSES.PENDING) {
    return <CreditCard className={cn(base, "text-primary")} />;
  }
  if (
    status === BOOKING_STATUSES.EXPIRED ||
    status === BOOKING_STATUSES.CANCELLED ||
    status === BOOKING_STATUSES.NEEDS_HELP
  ) {
    return <XCircle className={cn(base, "text-destructive")} />;
  }
  return <Car className={cn(base, "text-muted-foreground")} />;
}

export function StatusHero({ status, plate, slot }: StatusHeroProps) {
  const isActive =
    status === BOOKING_STATUSES.ASSIGNED ||
    status === BOOKING_STATUSES.IN_PROGRESS;
  const isReady = status === BOOKING_STATUSES.READY;

  return (
    <div className="space-y-4 text-center">
      <div
        className={cn(
          "mx-auto flex h-24 w-24 items-center justify-center rounded-full",
          isReady && "bg-primary/10",
          isActive && "animate-pulse bg-primary/10",
          !isReady && !isActive && "bg-muted"
        )}
      >
        <StatusIcon status={status} />
      </div>

      <StatusBadge tone={BOOKING_STATUS_TONES[status]}>
        {STATUS_LABELS[status]}
      </StatusBadge>

      {(plate || slot) && (
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          {plate && (
            <span className="font-mono font-semibold uppercase">{plate}</span>
          )}
          {slot && <span>Slot {slot}</span>}
        </div>
      )}
    </div>
  );
}
