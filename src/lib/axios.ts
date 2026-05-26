import axios from "axios";
import { ApiContractError, normalizeApiError } from "@/lib/api-error";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
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
