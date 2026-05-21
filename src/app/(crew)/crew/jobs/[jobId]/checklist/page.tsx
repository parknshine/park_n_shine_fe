"use client";

import { Construction } from "lucide-react";
import { useTranslation } from "@/i18n";

export function ChecklistPage() {
  const { t } = useTranslation("crew");

  return (
    <main className="flex min-h-[calc(100dvh-44px)] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <Construction className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">
          {t("checklist.title")}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("checklist.comingSoon")}
        </p>
      </div>
    </main>
  );
}

export default ChecklistPage;
