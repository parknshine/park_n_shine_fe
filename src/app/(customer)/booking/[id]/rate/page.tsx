"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { mutationKeys } from "@/lib/query-keys";
import { Sparkles } from "lucide-react";
import { StarRating } from "@/features/customer/components/star-rating";
import type { RatingPayload } from "@/features/customer/types";
import { useTranslation } from "@/i18n";
import { useTipPayment } from "@/features/customer/hooks/use-tip-payment";
import { useCheckTip } from "@/features/customer/hooks/use-check-tip";
import { usePaymentAutoPoll } from "@/features/customer/hooks/use-payment-auto-poll";
import { useRealtimeEvents } from "@/lib/use-realtime-events";
import { TIP_PRESETS } from "@/features/customer/types/tip";
import type { TipInstructions, TipPaymentMethod } from "@/features/customer/types/tip";

const TIP_METHOD_LABELS: Record<TipPaymentMethod, string> = {
  qris: "QRIS",
  gopay: "GoPay",
  shopeepay: "ShopeePay",
};

function TipPayStep({
  instructions,
  onDone,
}: Readonly<{
  instructions: TipInstructions;
  onDone: () => void;
}>) {
  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-8 text-center">
      <h2 className="text-xl font-bold text-foreground">Selesaikan Pembayaran Tip</h2>
      {instructions.type === "QRIS" ? (
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={instructions.qrUrl}
            alt="QR Code Tip"
            className="mx-auto h-56 w-56 rounded-xl border border-border object-contain"
          />
          <p className="text-sm text-muted-foreground">
            Berlaku hingga: {new Date(instructions.expiryTime).toLocaleTimeString("id-ID")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Tap tombol di bawah untuk membuka{" "}
            {instructions.provider === "gopay" ? "GoPay" : "ShopeePay"}
          </p>
          <a
            href={instructions.deepLinkUrl}
            className="inline-block w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Buka {instructions.provider === "gopay" ? "GoPay" : "ShopeePay"}
          </a>
          <p className="text-sm text-muted-foreground">
            Berlaku hingga: {new Date(instructions.expiryTime).toLocaleTimeString("id-ID")}
          </p>
        </div>
      )}
      <button
        type="button"
        onClick={onDone}
        className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Sudah Bayar / Kembali ke Home
      </button>
    </div>
  );
}

function TipSelectStep({
  tipAmount,
  setTipAmount,
  customTip,
  setCustomTip,
  tipMethod,
  setTipMethod,
  isPending,
  isError,
  onPay,
  onSkip,
}: Readonly<{
  tipAmount: number | null;
  setTipAmount: (v: number | null) => void;
  customTip: string;
  setCustomTip: (v: string) => void;
  tipMethod: TipPaymentMethod | null;
  setTipMethod: (v: TipPaymentMethod) => void;
  isPending: boolean;
  isError: boolean;
  onPay: () => void;
  onSkip: () => void;
}>) {
  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          Rating berhasil dikirim! Appreciate your crew? Leave a tip!
        </h2>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Pilih nominal tip</p>
        <div className="grid grid-cols-4 gap-2">
          {TIP_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => { setTipAmount(preset); setCustomTip(""); }}
              className={`rounded-xl border py-2 text-sm font-semibold transition-colors ${
                tipAmount === preset
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary"
              }`}
            >
              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(preset)}
            </button>
          ))}
        </div>
        <input
          type="number"
          min={1000}
          max={500000}
          value={customTip}
          onChange={(e) => {
            setCustomTip(e.target.value);
            const val = Number.parseInt(e.target.value, 10);
            setTipAmount(!Number.isNaN(val) && val >= 1000 ? val : null);
          }}
          placeholder="Nominal lain (min Rp 1.000)"
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Metode pembayaran</p>
        <div className="grid grid-cols-3 gap-2">
          {(["qris", "gopay", "shopeepay"] as TipPaymentMethod[]).map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setTipMethod(method)}
              className={`rounded-xl border py-2 text-sm font-semibold transition-colors ${
                tipMethod === method
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary"
              }`}
            >
              {TIP_METHOD_LABELS[method]}
            </button>
          ))}
        </div>
      </div>

      {isError && (
        <p className="text-sm text-destructive">Gagal memproses tip. Silakan coba lagi.</p>
      )}

      <button
        type="button"
        disabled={!tipAmount || !tipMethod || isPending}
        onClick={onPay}
        className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPending ? "Memproses..." : "Bayar Tip"}
      </button>

      <button
        type="button"
        onClick={onSkip}
        className="w-full py-2 text-sm text-muted-foreground hover:text-foreground"
      >
        Skip, kembali ke home
      </button>
    </div>
  );
}

export default function BookingRatePage() {
  const { id: bookingId } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const { t } = useTranslation("customer");

  const [score, setScore] = useState(0);
  const [reason, setReason] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [isDone, setIsDone] = useState(false);

  const [tipStep, setTipStep] = useState<"select" | "pay">("select");
  const [tipAmount, setTipAmount] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState("");
  const [tipMethod, setTipMethod] = useState<TipPaymentMethod | null>(null);
  const [tipInstructions, setTipInstructions] = useState<TipInstructions | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: RatingPayload) => {
      await api.post(`/v1/bookings/${bookingId}/rate`, payload, {
        headers: { "X-Booking-Token": token ?? "" },
      });
    },
    mutationKey: mutationKeys.customer.rate(bookingId),
    onSettled: () => { setIsDone(true); },
  });

  const tipMutation = useTipPayment({ bookingId, token: token ?? "" });
  const { checkTip } = useCheckTip({ bookingId, token: token ?? "" });

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  const sseUrl = tipStep === "pay" && bookingId && token
    ? `${baseUrl}/v1/realtime/stream?channel=booking:${bookingId}&token=${token}`
    : "";

  function goToThankYou() {
    router.replace(`/booking/${bookingId}/rate/thank-you?token=${token ?? ""}`);
  }

  usePaymentAutoPoll({ enabled: tipStep === "pay", onPoll: checkTip, onPaid: goToThankYou });

  useRealtimeEvents({
    url: sseUrl,
    enabled: tipStep === "pay" && !!bookingId && !!token,
    onEvent: (event) => { if (event.type === "tip_paid") goToThankYou(); },
  });

  async function handleTipPay() {
    if (!tipAmount || !tipMethod) return;
    try {
      const result = await tipMutation.mutateAsync({ amount: tipAmount, paymentMethod: tipMethod });
      setTipInstructions(result.instructions);
      setTipStep("pay");
    } catch {
      // tipMutation.isError surfaces the error in UI
    }
  }

  function handleSubmit() {
    if (score === 0 || mutation.isPending) return;
    mutation.mutate({
      score: score as RatingPayload["score"],
      ...(reason.trim() ? { reason: reason.trim() } : {}),
      ...(name.trim() ? { authorName: name.trim() } : {}),
      ...(title.trim() ? { title: title.trim() } : {}),
    });
  }

  if (isDone && tipStep === "pay" && tipInstructions) {
    return <TipPayStep instructions={tipInstructions} onDone={goToThankYou} />;
  }

  if (isDone) {
    return (
      <TipSelectStep
        tipAmount={tipAmount}
        setTipAmount={setTipAmount}
        customTip={customTip}
        setCustomTip={setCustomTip}
        tipMethod={tipMethod}
        setTipMethod={setTipMethod}
        isPending={tipMutation.isPending}
        isError={tipMutation.isError}
        onPay={handleTipPay}
        onSkip={() => router.push("/")}
      />
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-8">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold text-foreground">{t("rate.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("rate.subtitle")}</p>
      </div>

      <StarRating value={score} onChange={setScore} label={t("rate.starLabel")} />

      {score > 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-foreground">
              {t("rate.nameLabel")} <span className="text-muted-foreground">{t("rate.feedbackOptional")}</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("rate.namePlaceholder")}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-foreground">
              {t("rate.titleLabel")} <span className="text-muted-foreground">{t("rate.feedbackOptional")}</span>
            </label>
            <input
              id="title"
              type="text"
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("rate.titlePlaceholder")}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="reason" className="block text-sm font-medium text-foreground">
              {t("rate.feedbackLabel")} <span className="text-muted-foreground">{t("rate.feedbackOptional")}</span>
            </label>
            <textarea
              id="reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("rate.feedbackPlaceholder")}
              className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={score === 0 || mutation.isPending}
        onClick={handleSubmit}
        className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {mutation.isPending ? t("rate.submitting") : t("rate.submit")}
      </button>

      <button
        type="button"
        onClick={() => router.replace("/")}
        className="w-full py-2 text-sm text-muted-foreground hover:text-foreground"
      >
        {t("action.skip", { ns: "common" })}
      </button>
    </div>
  );
}
