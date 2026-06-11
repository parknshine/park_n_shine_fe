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

  const mutation = useMutation({
    mutationFn: async (payload: RatingPayload) => {
      await api.post(`/v1/bookings/${bookingId}/rate`, payload, {
        headers: { "X-Booking-Token": token ?? "" },
      });
    },
    mutationKey: mutationKeys.customer.rate(bookingId),
    onSettled: () => {
      setIsDone(true);
    },
  });

  function handleSubmit() {
    if (score === 0 || mutation.isPending) return;
    const payload: RatingPayload = {
      score: score as RatingPayload["score"],
      ...(reason.trim() ? { reason: reason.trim() } : {}),
      ...(name.trim() ? { authorName: name.trim() } : {}),
      ...(title.trim() ? { title: title.trim() } : {}),
    };
    mutation.mutate(payload);
  }

  function handleSkip() {
    router.replace("/");
  }

  if (isDone) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {t("rate.doneTitle")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("rate.doneSubtitle")}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-8">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          {t("rate.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("rate.subtitle")}
        </p>
      </div>

      <StarRating
        value={score}
        onChange={setScore}
        label={t("rate.starLabel")}
      />

      {score > 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-foreground"
            >
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
            <label
              htmlFor="title"
              className="block text-sm font-medium text-foreground"
            >
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
            <label
              htmlFor="reason"
              className="block text-sm font-medium text-foreground"
            >
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
        onClick={handleSkip}
        className="w-full py-2 text-sm text-muted-foreground hover:text-foreground"
      >
        {t("action.skip", { ns: "common" })}
      </button>
    </div>
  );
}
