import type { Metadata } from "next";
import { AppShell } from "@/components/shared";
import { BookNowButton } from "@/features/customer/components/book-now-button";
import { HowItWorksPanel } from "@/features/customer/components/how-it-works-panel";
import { LandingHero } from "@/features/customer/components/landing-hero";
import { QrErrorState } from "@/features/customer/components/qr-error-state";
import type { SiteQrResolution } from "@/features/customer/types";

interface Props {
  params: Promise<{ qrId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { qrId } = await params;
  const resolution = await getQrResolution(qrId);
  return {
    title: resolution ? `Book at ${resolution.siteName}` : "Book a Wash",
  };
}

async function getQrResolution(
  qrId: string
): Promise<SiteQrResolution | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";
  try {
    const res = await fetch(`${baseUrl}/v1/qr/${qrId}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json() as Promise<SiteQrResolution>;
  } catch {
    return null;
  }
}

export default async function LandingPage({ params }: Props) {
  const { qrId } = await params;
  const resolution = await getQrResolution(qrId);

  if (!resolution) {
    return (
      <AppShell surface="customer">
        <QrErrorState message="QR Code tidak valid atau sudah kadaluarsa." />
      </AppShell>
    );
  }

  const now = new Date();
  const [cutoffHour, cutoffMinute] = resolution.cutoffTime
    .split(":")
    .map(Number);
  const cutoff = new Date(now);
  cutoff.setHours(cutoffHour, cutoffMinute, 0, 0);
  const isPastCutoff = now > cutoff;

  const blockingMessage = resolution.intakePaused
    ? "Booking sedang ditutup sementara. Silakan coba lagi nanti."
    : isPastCutoff
      ? "Booking hari ini sudah ditutup. Coba lagi besok!"
      : null;

  return (
    <AppShell surface="customer">
      <div className="space-y-8 pb-10">
        <LandingHero siteName={resolution.siteName} />
        <HowItWorksPanel />
        {blockingMessage ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-center text-sm text-destructive">
            {blockingMessage}
          </div>
        ) : (
          <BookNowButton qrId={qrId} />
        )}
      </div>
    </AppShell>
  );
}
