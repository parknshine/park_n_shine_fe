import axios from "axios";
import { ApiContractError, normalizeApiError } from "@/lib/api-error";
import { getCustomerAccessToken } from "@/lib/customer-token-storage";
import { useCustomerAuthStore } from "@/store/customer-auth-store";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// Booking routes put the booking JWT in X-Booking-Token (and sometimes
// Authorization). The logged-in session must ride along as X-Customer-Token
// so create / photo / pay can attach the booking to that account.
api.interceptors.request.use((config) => {
  const token =
    getCustomerAccessToken() ?? useCustomerAuthStore.getState().token;
  if (token) {
    config.headers["X-Customer-Token"] = token;
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
