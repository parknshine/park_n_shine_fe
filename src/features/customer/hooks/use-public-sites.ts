"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { queryKeys } from "@/lib/query-keys";

export interface PublicSite {
  id: string;
  name: string;
  address: string;
  intakePaused: boolean;
  cutoffTime: string | null;
  /** Resolved wash price (site override or global default). */
  price?: number;
}

export function publicSiteOptionLabel(
  site: PublicSite,
  statusSuffix: string,
): string {
  const priceSuffix =
    site.price != null
      ? ` — Rp ${site.price.toLocaleString("id-ID")}`
      : "";
  return `${site.name}${statusSuffix}${priceSuffix}`;
}

/** Prefer the site's resolved wash price over the draft booking amount. */
export function resolveBookingDisplayPrice(
  site: Pick<PublicSite, "price"> | undefined,
  bookingPrice?: number,
): number | undefined {
  if (site?.price != null) return site.price;
  return bookingPrice;
}

export function usePublicSites() {
  const query = useQuery({
    queryKey: queryKeys.customer.sites(),
    queryFn: async () => {
      const res = await api.get<PublicSite[]>("/v1/sites");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: "always",
  });

  return {
    sites: query.data ?? [],
    isLoading: query.isLoading,
  };
}

export function useResolvedWashPrice(
  siteId?: string | null,
  bookingPrice?: number,
): number | undefined {
  const { sites } = usePublicSites();
  const site = siteId ? sites.find((s) => s.id === siteId) : undefined;
  return resolveBookingDisplayPrice(site, bookingPrice);
}
