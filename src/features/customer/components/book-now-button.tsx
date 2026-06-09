"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { mutationKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";
import type { CustomerBooking, CreateBookingPayload } from "@/features/customer/types";

interface BookNowButtonProps {
  qrId: string;
}

export function BookNowButton({ qrId }: Readonly<BookNowButtonProps>) {
  const router = useRouter();

  const mutation = useMutation({
    meta: { persist: false },
    mutationFn: async () => {
      const payload: CreateBookingPayload = { qrId, locale: "id-ID" };
      const response = await api.post<CustomerBooking>("/v1/bookings", payload);
      return response.data;
    },
    mutationKey: mutationKeys.customer.createBooking(),
    onSuccess: (booking) => {
      const params = new URLSearchParams({
        bookingId: booking.id,
        token: booking.signedToken,
      });
      router.push(`/q/${qrId}/capture?${params.toString()}`);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Gagal membuat booking. Coba lagi.");
    },
  });

  return (
    <Button
      size="lg"
      className="w-full rounded-full"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      {mutation.isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Memproses...
        </>
      ) : (
        "Book a Wash"
      )}
    </Button>
  );
}
