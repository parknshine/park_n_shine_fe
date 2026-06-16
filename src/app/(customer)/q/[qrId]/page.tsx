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
  const result = await getQrResolution(qrId);
  return {
    title: result.ok ? `Book at ${result.data.siteName}` : "Book a Wash",
  };
}

type QrResult =
  | { ok: true; data: SiteQrResolution }
  | { ok: false; code: string | null };

async function getQrResolution(qrId: string): Promise<QrResult> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";
  try {
    const res = await fetch(`${baseUrl}/v1/qr/${qrId}`, { cache: "no-store" });
    const body = await res.json() as { data?: SiteQrResolution; error?: { code: string } };
    if (!res.ok) return { ok: false, code: body.error?.code ?? null };
    return { ok: true, data: body.data! };
  } catch {
    return { ok: false, code: null };
  }
}

export default async function LandingPage({ params }: Props) {
  const { qrId } = await params;
  const result = await getQrResolution(qrId);

  if (!result.ok) {
    const isPastCutoff = result.code === "SITE_CUTOFF_REACHED";
    const isPaused = result.code === "INTAKE_PAUSED";

    if (isPastCutoff || isPaused) {
      return (
        <AppShell surface="customer">
          <QrBlockingMessage reason={isPastCutoff ? "past_cutoff" : "paused"} />
        </AppShell>
      );
    }

    return (
      <AppShell surface="customer">
        <QrErrorState reason="invalid" />
      </AppShell>
    );
  }

  const resolution = result.data;
  const now = new Date();
  const isPastCutoff = resolution.cutoffTime
    ? (() => {
        const [cutoffHour, cutoffMinute] = resolution.cutoffTime.split(":").map(Number);
        const cutoff = new Date(now);
        cutoff.setHours(cutoffHour, cutoffMinute, 0, 0);
        return now > cutoff;
      })()
    : false;

  const blockingReason = resolution.intakePaused
    ? "paused"
    : isPastCutoff
      ? "past_cutoff"
      : null;

  return (
    <AppShell surface="customer">
      <div className="space-y-8 pb-10">
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
