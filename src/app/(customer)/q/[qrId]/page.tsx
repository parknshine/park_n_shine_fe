import type { Metadata } from "next";
import { AppShell, PromoBannerPopup } from "@/components/shared";
import { BookNowButtonV2 } from "@/features/customer/components/book-now-button-v2";
import { HowItWorksPanel } from "@/features/customer/components/how-it-works-panel";
import { LandingHero } from "@/features/customer/components/landing-hero";
import { QrBlockingMessage } from "@/features/customer/components/qr-blocking-message";
import { QrErrorState, type QrReason } from "@/features/customer/components/qr-error-state";
import { serverApiBaseUrl } from "@/lib/server-api-base-url";
import type { SiteQrResolution } from "@/features/customer/types";

interface Props {
  params: Promise<{ qrId: string }>;
}

// Backend error codes from GET /v1/qr/:qrId (ErrorCodes in park-n-shine-api) mapped
// to the specific message shown on this page — falls back to "invalid" for any
// other/unrecognized code (bad format, network failure, unexpected server error).
const QR_ERROR_REASON: Record<string, QrReason> = {
  QR_NOT_FOUND: "invalid",
  QR_ROTATED: "rotated",
  SITE_INTAKE_PAUSED: "paused",
  SITE_CUTOFF_REACHED: "past_cutoff",
};

type QrResolveResult =
  | { ok: true; data: SiteQrResolution }
  | { ok: false; reason: QrReason; message?: string | null };

const SAFE_QR_ID_RE = /^[a-zA-Z0-9_-]{1,128}$/;

async function getQrResolution(qrId: string): Promise<QrResolveResult> {
  if (!SAFE_QR_ID_RE.test(qrId)) return { ok: false, reason: "invalid" };
  try {
    const res = await fetch(`${serverApiBaseUrl()}/v1/qr/${qrId}`, {
      cache: "no-store",
    });
    const body = (await res.json()) as
      | { data: SiteQrResolution }
      | { error: { code: string; details?: { pausedMessage?: string | null } } };
    if (!res.ok) {
      const code = "error" in body ? body.error.code : undefined;
      const message = "error" in body ? body.error.details?.pausedMessage : undefined;
      return {
        ok: false,
        reason: (code && QR_ERROR_REASON[code]) || "invalid",
        message,
      };
    }
    if (!("data" in body) || !body.data) return { ok: false, reason: "invalid" };
    return { ok: true, data: body.data };
  } catch (error) {
    console.error("Error fetching QR resolution:", error);
    return { ok: false, reason: "invalid" };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { qrId } = await params;
  const result = await getQrResolution(qrId);
  return {
    title: result.ok ? `Book at ${result.data.siteName}` : "Book a Wash",
  };
}

export default async function LandingPage({ params }: Props) {
  const { qrId } = await params;
  const result = await getQrResolution(qrId);
  if (!result.ok) {
    return (
      <AppShell surface='customer'>
        <QrErrorState reason={result.reason} message={result.message} />
      </AppShell>
    );
  }
  const resolution = result.data;

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
      <PromoBannerPopup />
    </AppShell>
  );
}
