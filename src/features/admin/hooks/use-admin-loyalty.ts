import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios-admin";
import { queryKeys } from "@/lib/query-keys";

export interface LoyaltyCustomer {
  id: string;
  phone: string;
  washCount: number;
  bookingCount: number;
  createdAt: string;
}

export function useAdminLoyaltyCustomers() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.admin.loyaltyCustomers(),
    queryFn: async () => {
      const res = await api.get<LoyaltyCustomer[]>("/v1/admin/loyalty/customers");
      return res.data;
    },
  });

  return { customers: data ?? [], isLoading, error };
}
