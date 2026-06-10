import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { queryKeys } from "@/lib/query-keys";
import type { PublicTestimonial } from "@/features/customer/types";

export function usePublicTestimonials() {
  return useQuery({
    queryKey: queryKeys.testimonials.public(),
    queryFn: async () => {
      const res = await api.get<{ testimonials: PublicTestimonial[] }>("/v1/testimonials");
      return res.data.testimonials ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
