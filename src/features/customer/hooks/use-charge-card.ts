"use client";

import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { ApiContractError, API_ERROR_CODES } from "@/lib/api-error";

interface ChargeCardResult {
  paid: boolean;
  redirectUrl?: string;
}

const MIDTRANS_ERROR_MAP: Record<string, string> = {
  "402": "Kartu tidak mendukung 3DS versi 2. Gunakan kartu lain yang mendukung 3DS v2.",
  "405": "Kartu tidak dapat digunakan untuk transaksi ini.",
  "406": "Transaksi duplikat. Booking ini sudah diproses sebelumnya.",
  "407": "Jumlah transaksi melebihi limit kartu.",
  "408": "Waktu transaksi habis. Silakan coba kembali.",
  "410": "Token Midtrans kedaluwarsa. Silakan muat ulang halaman.",
  "411": "Token kartu sudah tidak valid. Silakan coba bayar kembali.",
};

function friendlyChargeError(err: unknown): string | null {
  if (!err) return null;

  const message = err instanceof Error ? (err.message ?? "") : "";

  // Parse Midtrans status_code embedded in the error message string
  const midtransCode = /"status_code"\s*:\s*"(\d+)"/.exec(message)?.[1];
  if (midtransCode && MIDTRANS_ERROR_MAP[midtransCode]) {
    return MIDTRANS_ERROR_MAP[midtransCode];
  }

  // Pattern-based fallbacks for known Midtrans messages
  if (message.includes("3DS version")) {
    return MIDTRANS_ERROR_MAP["402"];
  }
  if (message.includes("no longer available")) {
    return MIDTRANS_ERROR_MAP["411"];
  }

  // PAYMENT_GATEWAY_FAILED from backend — hide raw payload
  if (
    err instanceof ApiContractError &&
    err.code === API_ERROR_CODES.PAYMENT_GATEWAY_FAILED
  ) {
    return "Pembayaran gagal. Silakan coba lagi atau gunakan kartu lain.";
  }

  // Last resort: never expose raw Midtrans JSON to users
  if (message.includes("Midtrans") || message.includes("status_code")) {
    return "Pembayaran gagal. Silakan coba lagi atau gunakan kartu lain.";
  }

  return message || "Pembayaran gagal. Silakan coba lagi.";
}

export function useChargeCard(bookingId: string, signedToken: string) {
  const mutation = useMutation({
    retry: 0, // never auto-retry — card tokens are one-time use
    mutationFn: async ({ tokenId, callbackUrl }: { tokenId: string; callbackUrl?: string }) => {
      const response = await api.post<ChargeCardResult>(
        `/v1/bookings/${bookingId}/charge-card`,
        { tokenId, ...(callbackUrl ? { callbackUrl } : {}) },
        { headers: { "X-Booking-Token": signedToken } },
      );
      return response.data;
    },
  });

  return {
    chargeCard: mutation.mutate,
    isCharging: mutation.isPending,
    error: friendlyChargeError(mutation.error),
  };
}
