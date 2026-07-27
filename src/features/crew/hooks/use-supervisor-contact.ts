"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { queryKeys } from "@/lib/query-keys";

const ENV_FALLBACK = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

async function fetchWhatsappNumber(): Promise<string> {
  const res = await axios.get<{ data: { whatsappNumber: string } }>("/v1/settings", {
    baseURL: process.env.NEXT_PUBLIC_API_URL,
  });
  return res.data.data.whatsappNumber;
}

export function useSupervisorContact() {
  const query = useQuery({
    queryKey: queryKeys.crew.publicSettings(),
    queryFn: fetchWhatsappNumber,
    staleTime: 60 * 60 * 1000,
  });

  return {
    whatsappNumber: query.data || ENV_FALLBACK,
  };
}
