import Link from "next/link";
import { Sparkles, ChevronRight } from "lucide-react";

interface ActiveBookingCardProps {
  bookingId: string;
  signedToken: string;
  plate: string;
  siteName: string;
  statusLabel: string;
  ctaLabel: string;
  sectionTitle?: string;
}

export function ActiveBookingCard({
  bookingId,
  signedToken,
  plate,
  siteName,
  statusLabel,
  ctaLabel,
  sectionTitle,
}: Readonly<ActiveBookingCardProps>) {
  return (
    <div>
      {sectionTitle && (
        <div className="text-[13px] font-extrabold tracking-wide text-[#273034] mb-3">
          {sectionTitle}
        </div>
      )}
      <Link
        href={`/booking/${bookingId}/status?token=${signedToken}`}
        className="w-full text-left flex items-center gap-3 px-4 py-[14px] rounded-2xl bg-white border border-[#006289]/10"
        style={{ boxShadow: "0 10px 26px rgba(0,98,137,0.08)" }}
      >
        <div className="w-10 h-10 rounded-xl bg-[#e8f2f9] flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-[#006289]" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-[#273034]">{plate}</div>
          <div className="text-[12.5px] text-[#5a666d] truncate">
            {statusLabel} · {siteName}
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <span className="text-[13px] font-bold text-[#006289]">
            {ctaLabel}
          </span>
          <ChevronRight
            className="w-3.5 h-3.5 text-[#006289]"
            strokeWidth={2.4}
          />
        </div>
      </Link>
    </div>
  );
}
