import axios from "axios";
import { ApiContractError, normalizeApiError } from "@/lib/api-error";
import { getCustomerAccessToken } from "@/lib/customer-token-storage";
import { useCustomerAuthStore } from "@/store/customer-auth-store";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// Booking routes send the booking JWT in X-Booking-Token. Authorization is
// already CORS-allowed in production, so the logged-in session rides there.
// Do not use X-Customer-Token: api-1.parknshine.net rejects it on preflight.
api.interceptors.request.use((config) => {
  const token =
    getCustomerAccessToken() ?? useCustomerAuthStore.getState().token;
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Unwrap { success, data } envelope + normalise errors
// Customer endpoints use X-Booking-Token header (set per-request), not Authorization
api.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === "object" &&
      "success" in response.data &&
      response.data.data !== undefined
    ) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => Promise.reject(normalizeApiError(error))
);

export { ApiContractError };
export default api;
