"use client";

import {
  Car,
  CheckCircle2,
  Droplets,
  Loader2,
  Search,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";
import { StatusBadge } from "@/components/shared";
import {
  BOOKING_STATUS_TONES,
  BOOKING_STATUSES,
  type BookingStatus,
} from "@/features/customer/types";

// Statuses that are internal / transitional — shown as a neutral loading state
// instead of displaying a confusing label to the customer.
const TRANSITIONAL_STATUSES = new Set<BookingStatus>(["DRAFT", "STALE"]);

interface StatusHeroProps {
  status: BookingStatus;
  isRefunded?: boolean;
}

const STATUS_LABEL_KEYS: Record<BookingStatus, string> = {
  DRAFT: "booking.status.draft",
  PENDING: "booking.status.pending",
  PAID: "booking.status.paid",
  ASSIGNED: "booking.status.assigned",
  IN_PROGRESS: "booking.status.in_progress",
  READY: "booking.status.ready",
  CLOSED: "booking.status.closed",
  EXPIRED: "booking.status.expired",
  CANCELLED: "booking.status.cancelled",
  NEEDS_HELP: "booking.status.needs_help",
  STALE: "booking.status.stale",
  LOCATED: "booking.status.located",
};

function CarPaymentIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 81 81" fill="none">
      <path d="M21.5122 40.2812C20.1955 40.2813 18.9328 40.8117 18.0019 41.756C17.0709 42.7003 16.5479 43.981 16.5479 45.3165C16.5479 46.6519 17.0709 47.9326 18.0019 48.8769C18.9328 49.8212 20.1955 50.3517 21.5122 50.3517C22.8288 50.3517 24.0915 49.8212 25.0224 48.8769C25.9534 47.9326 26.4764 46.6519 26.4764 45.3165C26.4764 43.981 25.9534 42.7003 25.0224 41.756C24.0915 40.8117 22.8288 40.2813 21.5122 40.2812ZM57.917 40.2812C56.6004 40.2813 55.3377 40.8117 54.4067 41.756C53.4757 42.7003 52.9527 43.981 52.9527 45.3165C52.9527 46.6519 53.4757 47.9326 54.4067 48.8769C55.3377 49.8212 56.6004 50.3517 57.917 50.3517C59.2336 50.3517 60.4963 49.8212 61.4273 48.8769C62.3583 47.9326 62.8813 46.6519 62.8813 45.3165C62.8813 43.981 62.3583 42.7003 61.4273 41.756C60.4963 40.8117 59.2336 40.2813 57.917 40.2812Z" fill="#3D8FE4"/>
      <path d="M68.739 30.748L64.2049 16.9851C63.5489 14.9758 62.2834 13.2283 60.5894 11.9924C58.8954 10.7565 56.8595 10.0954 54.7727 10.1036H24.6229C22.5374 10.1005 20.5038 10.7636 18.8108 11.9988C17.1177 13.234 15.8511 14.9786 15.1907 16.9851L10.6567 30.748C8.2738 31.755 6.58594 34.1719 6.58594 36.9245V53.7086C6.58594 56.1926 7.94285 58.341 9.89547 59.4823V67.1358C9.89547 68.9821 11.3848 70.4926 13.205 70.4926H16.5145C18.3348 70.4926 19.8241 68.9821 19.8241 67.1358V60.4222H59.5385V67.1358C59.5385 68.9821 61.0277 70.4926 62.848 70.4926H66.1575C67.9778 70.4926 69.4671 68.9821 69.4671 67.1358V59.4823C70.4674 58.8965 71.2993 58.0553 71.8799 57.0425C72.4605 56.0296 72.7696 54.8802 72.7766 53.7086V36.9245C72.7766 34.1384 71.0887 31.755 68.7059 30.748H68.739ZM24.6229 16.7836H54.8058C55.4996 16.7818 56.1765 17.0012 56.7407 17.4108C57.3049 17.8204 57.7279 18.3995 57.9499 19.0663L61.6235 30.2109H17.8383L21.5119 19.0663C21.734 18.3995 22.1569 17.8204 22.7211 17.4108C23.2853 17.0012 23.9622 16.7818 24.656 16.7836H24.6229ZM13.2381 53.7086V36.9245H66.1906V53.7086H13.2381Z" fill="#3D8FE4"/>
    </svg>
  );
}

function LocatedCarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 84 84" fill="none">
      <path d="M22.6411 24.7334H60.9575C61.9879 24.7334 62.9193 25.0303 63.7612 25.627C64.6016 26.2225 65.18 27.0027 65.5024 27.9766L65.5044 27.9824L72.7993 48.8252V76.6328C72.7993 77.5317 72.4996 78.2692 71.9019 78.8691C71.3047 79.4684 70.5674 79.7687 69.6665 79.7666H66.1831C65.2846 79.7666 64.5482 79.4658 63.9507 78.8662C63.3524 78.2659 63.0514 77.5285 63.0493 76.6318V72.7998H20.5493V76.6328C20.5493 77.5314 20.249 78.2691 19.6489 78.8691C19.049 79.4691 18.3131 79.7686 17.4175 79.7666H13.9331C13.0345 79.7666 12.2982 79.4658 11.7007 78.8662C11.1024 78.2659 10.8014 77.5285 10.7993 76.6318V48.8252L18.0952 27.9824L18.0972 27.9775C18.4219 27.0033 19.0008 26.2227 19.8413 25.627C20.6833 25.0302 21.6133 24.7334 22.6411 24.7334ZM17.0659 66.5332H66.5327V48.417H17.0659V66.5332ZM26.1235 52.5996C27.4889 52.604 28.6337 53.0775 29.5796 54.0234C30.5254 54.9693 30.9973 56.113 30.9995 57.4756C31.0016 58.8372 30.5307 59.9816 29.5806 60.9297C28.6298 61.8783 27.4843 62.3496 26.1245 62.3496H26.1226C24.7745 62.3583 23.6306 61.8879 22.6724 60.9297C21.7144 59.9715 21.243 58.8271 21.2495 57.4766C21.256 56.1231 21.7289 54.9778 22.6743 54.0215C23.6175 53.0676 24.76 52.5953 26.1235 52.5996ZM57.4731 52.5996C58.8385 52.604 59.9843 53.0775 60.9302 54.0234C61.8758 54.9692 62.3469 56.1131 62.3491 57.4756C62.3512 58.8372 61.8804 59.9816 60.9302 60.9297C59.9794 61.8783 58.8339 62.3496 57.4741 62.3496H57.4722C56.1242 62.3583 54.9812 61.8879 54.0229 60.9297C53.0648 59.9715 52.5926 58.8272 52.5991 57.4766C52.6057 56.1232 53.0785 54.9778 54.0239 54.0215C54.967 53.0675 56.1097 52.5953 57.4731 52.5996ZM23.5298 31.2344L19.8726 41.6846L19.7095 42.1494H63.8892L63.7261 41.6846L60.0688 31.2344L59.9868 31H23.6118L23.5298 31.2344ZM24.3823 3.98242C26.0443 5.66889 27.2633 7.15814 28.0474 8.4541C28.868 9.81046 29.2605 11.0544 29.2583 12.1914L29.2524 12.4443C29.1971 13.6939 28.7276 14.7562 27.8384 15.6475C26.8902 16.5978 25.7451 17.0686 24.3833 17.0664C23.0207 17.0642 21.877 16.5923 20.9312 15.6465C19.9805 14.6957 19.5083 13.5508 19.5083 12.1914C19.5084 11.0542 19.9016 9.81047 20.7222 8.4541C21.5061 7.1583 22.7229 5.66848 24.3823 3.98242ZM41.7993 3.98242C43.4613 5.66885 44.6803 7.15817 45.4644 8.4541C46.2849 9.81043 46.6765 11.0545 46.6743 12.1914L46.6694 12.4443C46.6141 13.6939 46.1437 14.7562 45.2544 15.6475C44.3063 16.5976 43.1619 17.0685 41.8003 17.0664C40.4376 17.0642 39.294 16.5924 38.3481 15.6465C37.3974 14.6957 36.9243 13.5509 36.9243 12.1914C36.9244 11.0542 37.3176 9.81042 38.1382 8.4541C38.9222 7.15822 40.1397 5.66862 41.7993 3.98242ZM59.2153 3.98242C60.8774 5.66889 62.0963 7.15814 62.8804 8.4541C63.701 9.81046 64.0935 11.0544 64.0913 12.1914L64.0854 12.4443C64.0301 13.6939 63.5606 14.7562 62.6714 15.6475C61.7232 16.5978 60.5781 17.0686 59.2163 17.0664C57.8538 17.0641 56.7099 16.5923 55.7642 15.6465C54.8136 14.6957 54.3413 13.5507 54.3413 12.1914C54.3414 11.0542 54.7346 9.81047 55.5552 8.4541C56.3391 7.15831 57.5559 5.66848 59.2153 3.98242Z" fill="#3D8FE4" stroke="#D1DFE7" strokeWidth="0.7"/>
    </svg>
  );
}

function StatusIcon({ status }: Readonly<{ status: BookingStatus }>) {
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
  if (
    status === BOOKING_STATUSES.EXPIRED ||
    status === BOOKING_STATUSES.CANCELLED ||
    status === BOOKING_STATUSES.NEEDS_HELP
  ) {
    return <XCircle className={cn(base, "text-destructive")} />;
  }
  return <Car className={cn(base, "text-muted-foreground")} />;
}

export function StatusHero({ status, isRefunded = false }: Readonly<StatusHeroProps>) {
  const { t } = useTranslation("customer");

  // DRAFT / STALE are internal states — render a neutral loading indicator
  // so the customer never sees a confusing badge flash by.
  if (TRANSITIONAL_STATUSES.has(status)) {
    return (
      <div className='space-y-4 text-center'>
        <div className='mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted'>
          <Loader2 className='h-10 w-10 animate-spin text-muted-foreground' />
        </div>
        <p className='text-sm text-muted-foreground'>
          {t("status.preparing", { defaultValue: "Preparing your booking…" })}
        </p>
      </div>
    );
  }

  const isActive =
    status === BOOKING_STATUSES.ASSIGNED ||
    status === BOOKING_STATUSES.IN_PROGRESS;
  const isReady = status === BOOKING_STATUSES.READY;
  const effectiveStatus = isRefunded ? BOOKING_STATUSES.PAID : status;
  const isWhiteBorderStyle =
    effectiveStatus === BOOKING_STATUSES.PENDING ||
    effectiveStatus === BOOKING_STATUSES.PAID ||
    effectiveStatus === BOOKING_STATUSES.ASSIGNED ||
    effectiveStatus === BOOKING_STATUSES.LOCATED ||
    effectiveStatus === BOOKING_STATUSES.IN_PROGRESS ||
    effectiveStatus === BOOKING_STATUSES.READY;

  const getWhiteBorderIcon = () => {
    if (effectiveStatus === BOOKING_STATUSES.ASSIGNED) return <Search className='h-9 w-9 text-primary' />;
    if (effectiveStatus === BOOKING_STATUSES.LOCATED) return <LocatedCarIcon />;
    if (effectiveStatus === BOOKING_STATUSES.IN_PROGRESS) return <Droplets className='h-9 w-9 text-primary' />;
    if (effectiveStatus === BOOKING_STATUSES.READY) return <CheckCircle2 className='h-9 w-9 text-primary' />;
    return <CarPaymentIcon />;
  };

  return (
    <div className='space-y-4 text-center'>
      {isWhiteBorderStyle ? (
        <div className='mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#D4E0E7] bg-white dark:border-border dark:bg-card'>
          {getWhiteBorderIcon()}
        </div>
      ) : (
        <div
          className={cn(
            "mx-auto flex h-24 w-24 items-center justify-center rounded-full",
            isReady && "bg-primary/10",
            isActive && "animate-pulse bg-primary/10",
            !isReady && !isActive && "bg-muted",
          )}
        >
          <StatusIcon status={effectiveStatus} />
        </div>
      )}

      {isRefunded ? (
        <StatusBadge tone='warning'>
          {t("history.status.refunded", { defaultValue: "Direfund" })}
        </StatusBadge>
      ) : (
        <StatusBadge tone={BOOKING_STATUS_TONES[effectiveStatus]}>
          {t(STATUS_LABEL_KEYS[effectiveStatus])}
        </StatusBadge>
      )}

    </div>
  );
}
