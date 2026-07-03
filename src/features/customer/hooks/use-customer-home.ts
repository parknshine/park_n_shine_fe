"use client";

import { useQuery } from "@tanstack/react-query";
import customerApi from "@/lib/axios-customer";
import { queryKeys } from "@/lib/query-keys";

interface CustomerHomeData {
  washCount: number;
}

export function useCustomerHome(enabled = true) {
  return useQuery({
    queryKey: queryKeys.customer.home(),
    queryFn: async () => {
      const { data } = await customerApi.get<CustomerHomeData>("/v1/me/home");
      return data;
    },
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
  });
}
