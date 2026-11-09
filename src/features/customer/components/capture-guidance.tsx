"use client";

import type { ReactNode } from "react";
import { useTranslation } from "@/i18n";

export function CaptureHowTo({ variant }: { variant: "qr" | "walkin" }) {
  const { t } = useTranslation("customer");
  const steps =
    variant === "walkin"
      ? [
          t("booking.capture.steps.mall"),
          t("booking.capture.steps.plate"),
          t("booking.capture.steps.slot"),
        ]
      : [
          t("booking.capture.steps.plate"),
          t("booking.capture.steps.slot"),
          t("booking.capture.steps.pay"),
        ];

  return (
    <ol className="mt-4 grid grid-cols-3 gap-2">
      {steps.map((label, index) => (
        <li
          key={label}
          className="rounded-2xl border border-border bg-white px-2 py-3 text-center"
        >
          <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {index + 1}
          </span>
          <span className="mt-1.5 block text-xs font-semibold leading-snug text-foreground">
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function CaptureSection({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2 rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {step}
        </span>
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function CaptureLocationBanner({
  name,
  address,
  loading,
}: {
  name: string;
  address?: string | null;
  loading: boolean;
}) {
  const { t } = useTranslation("customer");
  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
        {t("booking.capture.locationLabel")}
      </p>
      <p className="mt-0.5 text-base font-bold text-foreground">
        {name ||
          (loading
            ? t("booking.capture.locationLoading")
            : t("booking.capture.locationDisabledPlaceholder"))}
      </p>
      {address ? (
        <p className="mt-0.5 text-xs text-muted-foreground">{address}</p>
      ) : null}
      <p className="mt-1 text-xs text-muted-foreground">
        {t("booking.capture.locationLockedHelper")}
      </p>
    </div>
  );
}

export function CaptureStillNeeded({
  plateReady,
  plateText,
  slotReady,
  slotText,
  locationReady,
}: {
  plateReady: boolean;
  plateText: string;
  slotReady: boolean;
  slotText: string;
  locationReady: boolean;
}) {
  const { t } = useTranslation("customer");
  const items: string[] = [];
  if (!plateReady) items.push(t("booking.capture.needPlate"));
  else if (!plateText.trim()) items.push(t("booking.capture.needPlateText"));
  if (!slotReady) items.push(t("booking.capture.needSlot"));
  else if (!slotText.trim()) items.push(t("booking.capture.needSlotText"));
  if (!locationReady) items.push(t("booking.capture.needLocation"));
  if (items.length === 0) return null;

  return (
    <p className="text-center text-sm text-muted-foreground">
      {t("booking.capture.stillNeeded", { items: items.join(", ") })}
    </p>
  );
}
