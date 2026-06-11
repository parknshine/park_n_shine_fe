"use client";

import { Combobox } from "@/components/ui/combobox";
import { useTranslation } from "@/i18n";

const ALL_SITES = "__all__";

interface SiteSelectorProps {
  sites: { id: string; name: string }[];
  value: string | null;
  onChange: (siteId: string) => void;
  className?: string;
  allowAll?: boolean;
}

export function SiteSelector({ sites, value, onChange, className, allowAll }: Readonly<SiteSelectorProps>) {
  const { t } = useTranslation("admin");

  if (sites.length === 0) return null;

  const siteOptions = sites.map((s) => ({ value: s.id, label: s.name }));
  const options = allowAll
    ? [{ value: ALL_SITES, label: t("reports.jobDetail.filterMallAll") }, ...siteOptions]
    : siteOptions;

  return (
    <div className={className}>
      <Combobox
        options={options}
        value={value ?? ""}
        onChange={(v) => onChange(v === ALL_SITES ? "" : v)}
        placeholder={allowAll ? t("reports.jobDetail.filterMallAll") : t("common.siteActive")}
        className="w-52"
      />
    </div>
  );
}
