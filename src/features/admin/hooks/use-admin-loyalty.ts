import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/axios-admin";
import { queryKeys } from "@/lib/query-keys";

export interface LoyaltyCustomer {
  id: string;
  type: "registered" | "guest";
  name: string | null;
  email: string | null;
  phone: string | null;
  washCount: number;
  bookingCount: number;
  createdAt: string;
}

export interface LoyaltyCustomerPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerFilterParams {
  search?: string;
  type?: "registered" | "guest";
  from?: string;
  to?: string;
  minWash?: number;
  page?: number;
  limit?: number;
}

interface CustomerListResponse {
  customers: LoyaltyCustomer[];
  pagination: LoyaltyCustomerPagination;
}

export function useAdminLoyaltyCustomers(params?: CustomerFilterParams) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.admin.loyaltyCustomers(params),
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set("search", params.search);
      if (params?.type) searchParams.set("type", params.type);
      if (params?.from) searchParams.set("from", params.from);
      if (params?.to) searchParams.set("to", params.to);
      if (params?.minWash !== undefined && params.minWash > 0) {
        searchParams.set("minWash", String(params.minWash));
      }
      searchParams.set("page", String(params?.page ?? 1));
      searchParams.set("limit", String(params?.limit ?? 20));

      const query = searchParams.toString();
      const res = await api.get<CustomerListResponse>(
        `/v1/admin/loyalty/customers${query ? `?${query}` : ""}`
      );
      return res.data;
    },
  });

  return {
    customers: data?.customers ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
  };
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (customerId: string) =>
      api.delete(`/v1/admin/loyalty/customers/${customerId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin", "loyalty", "customers"],
      });
    },
  });

  return {
    deleteCustomer: mutation.mutateAsync,
    isDeleting: mutation.isPending,
  };
}
