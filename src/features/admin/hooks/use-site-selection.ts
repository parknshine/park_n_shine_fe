"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/store/ui-store";

/**
 * Per-page site selection. Local state — each page mount gets its own
 * selection, auto-initialised to the first available site.
 */
export function useSiteSelection() {
  const sites = useUIStore((s) => s.sites);
  const [siteId, setSiteId] = useState<string | null>(null);

  useEffect(() => {
    const isValid = siteId !== null && sites.some((s) => s.id === siteId);
    if (!isValid && sites.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSiteId(sites[0].id);
    }
  }, [sites, siteId]);

  return { sites, siteId, setSiteId };
}
