import axios from "axios";
import {
  API_ERROR_CODES,
  ApiContractError,
  normalizeApiError,
} from "@/lib/api-error";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10_000,
});

// Request interceptor — attach auth token if available
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — unwrap { success, data } envelope + normalise errors
api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === "object" && "success" in response.data && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    const normalizedError = normalizeApiError(error);

    if (
      normalizedError.httpStatus === 401 &&
      normalizedError.code !== API_ERROR_CODES.BOOKING_TOKEN_INVALID
    ) {
      // Handle unauthorised — e.g. redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/crew/login";
      }
    }
    return Promise.reject(normalizedError);
  }
);

export { ApiContractError };
export default api;
