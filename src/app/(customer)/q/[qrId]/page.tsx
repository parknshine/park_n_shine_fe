import type { Metadata } from "next";
import { AppShell } from "@/components/shared";
import { BookNowButtonV2 } from "@/features/customer/components/book-now-button-v2";
import { HowItWorksPanel } from "@/features/customer/components/how-it-works-panel";
import { LandingHero } from "@/features/customer/components/landing-hero";
import { QrBlockingMessage } from "@/features/customer/components/qr-blocking-message";
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

const SAFE_QR_ID_RE = /^[a-zA-Z0-9_-]{1,128}$/;

async function getQrResolution(qrId: string): Promise<SiteQrResolution | null> {
  if (!SAFE_QR_ID_RE.test(qrId)) return null;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";
  try {
    console.log("Fetching QR resolution for ID:", qrId);
    const res = await fetch(`${baseUrl}/v1/qr/${qrId}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.log("QR resolution fetch failed with status:", res.status);
      return null;
    }
    const body = (await res.json()) as { data: SiteQrResolution };
    console.log("QR resolution fetched successfully:", body.data);
    return body.data ?? null;
  } catch (error) {
    console.error("Error fetching QR resolution:", error);
    return null;
  }
}

export default async function LandingPage({ params }: Props) {
  const { qrId } = await params;
  const resolution = await getQrResolution(qrId);
  console.log("resolution", resolution);
  if (!resolution) {
    return (
      <AppShell surface='customer'>
        <QrErrorState reason='invalid' />
      </AppShell>
    );
  }

  const now = new Date();
  const isPastCutoff = resolution.cutoffTime && resolution.timezone
    ? (() => {
        const [cutoffHour, cutoffMinute] = resolution.cutoffTime.split(":").map(Number);
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: resolution.timezone,
          hour: "numeric",
          minute: "numeric",
          hour12: false,
        });
        const parts = formatter.formatToParts(now);
        const currentHour = Number.parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
        const currentMinute = Number.parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
        return currentHour * 60 + currentMinute >= cutoffHour! * 60 + cutoffMinute!;
      })()
    : false;

  const blockingReason = resolution.intakePaused
    ? "paused"
    : isPastCutoff
      ? "past_cutoff"
      : null;

  return (
    <AppShell surface='customer'>
      <div className='space-y-8 pb-10'>
        <LandingHero siteName={resolution.siteName} />
        <HowItWorksPanel />
        {blockingReason ? (
          <QrBlockingMessage reason={blockingReason} />
        ) : (
          <BookNowButtonV2 qrId={qrId} />
        )}
      </div>
    </AppShell>
  );
}
