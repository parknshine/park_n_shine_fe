"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import api from "@/lib/axios-admin";
import type { AdminSiteDetail, AdminQrCode } from "@/features/admin/types";

export default function QrPrintPage() {
  const { siteId, qrId } = useParams<{ siteId: string; qrId: string }>();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [site, setSite] = useState<AdminSiteDetail | null>(null);
  const [qr, setQr] = useState<AdminQrCode | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const appUrl =
    globalThis.window === undefined ? "" : globalThis.window.location.origin;

  useEffect(() => {
    async function load() {
      try {
        const [siteRes, qrCodesRes] = await Promise.all([
          api.get<AdminSiteDetail>(`/v1/admin/sites/${siteId}`),
          api.get<AdminQrCode[]>(`/v1/admin/sites/${siteId}/qr-codes`),
        ]);
        const foundQr = qrCodesRes.data.find((q) => q.id === qrId);
        setSite(siteRes.data);
        setQr(foundQr ?? null);

        const bookingUrl = `${appUrl}/q/${qrId}`;
        const dataUrl = await QRCode.toDataURL(bookingUrl, {
          width: 400,
          margin: 2,
          color: { dark: "#000000", light: "#ffffff" },
        });
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error("Failed to load QR print data", err);
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [siteId, qrId, appUrl]);

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <p className='text-muted-foreground text-sm'>Preparing QR code...</p>
      </div>
    );
  }

  if (!qr || !site || !qrDataUrl) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <p className='text-destructive text-sm'>QR code not found.</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
        }
      `}</style>

      {/* Print action bar */}
      <div className='no-print flex items-center justify-between border-b border-border px-6 py-3'>
        <p className='text-sm text-muted-foreground'>
          Print preview — {qr.label}
        </p>
        <button
          onClick={() => window.print()}
          className='rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90'
        >
          Print / Save as PDF
        </button>
      </div>

      {/* Printable area */}
      <div className='flex min-h-screen flex-col items-center justify-center p-8 print:p-4'>
        <div className='flex flex-col items-center gap-6 rounded-2xl border-2 border-border p-10 print:border-none print:p-0'>
          {/* Logo / brand */}
          <div className='text-center'>
            <p className='text-2xl font-black tracking-tight'>
              Park &amp; Shine
            </p>
            <p className='text-sm text-muted-foreground'>{site.name}</p>
          </div>

          {/* QR image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt={`QR code for ${qr.label}`}
            className='h-64 w-64'
          />

          {/* Label */}
          <div className='text-center'>
            <p className='text-3xl font-bold tracking-tight'>{qr.label}</p>
            <p className='mt-1 text-xs text-muted-foreground'>
              Scan to book car wash service
            </p>
          </div>

          {/* QR ID for traceability */}
          <p className='font-mono text-xs text-muted-foreground'>{qrId}</p>
        </div>
      </div>
    </>
  );
}
