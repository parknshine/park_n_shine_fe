"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { queryKeys } from "@/lib/query-keys";

const ENV_FALLBACK = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

interface PublicSettings {
  whatsappNumber: string;
  avgCleaningMinutes: number;
}

async function fetchPublicSettings(): Promise<PublicSettings> {
  const res = await axios.get<PublicSettings>("/v1/settings", {
    baseURL: process.env.NEXT_PUBLIC_API_URL,
  });
  return res.data;
}

export function usePublicSettings() {
  const query = useQuery({
    queryKey: queryKeys.customer.settings(),
    queryFn: fetchPublicSettings,
    staleTime: 60 * 60 * 1000,
  });

  return {
    whatsappNumber: query.data?.whatsappNumber || ENV_FALLBACK,
    avgCleaningMinutes: query.data?.avgCleaningMinutes ?? 30,
    isLoading: query.isLoading,
  };
}
