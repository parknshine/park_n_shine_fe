import axios from "axios";
import { ApiContractError, normalizeApiError } from "@/lib/api-error";
import { useAuthStore } from "@/store/auth-store";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

const adminApi = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
  withCredentials: true,
});

// ── Token refresh state ──────────────────────────────────────────────────────

let isRefreshing = false;
type QueueEntry = { resolve: () => void; reject: (err: unknown) => void };
let failedQueue: QueueEntry[] = [];

function processQueue(error: unknown) {
  failedQueue.forEach((entry) => (error ? entry.reject(error) : entry.resolve()));
  failedQueue = [];
}

async function refreshAdminToken(): Promise<void> {
  // Cookie admin-refresh-token is sent automatically via withCredentials.
  // Backend sets new admin-token + admin-refresh-token cookies on success.
  await axios.post(
    `${BASE_URL}/v1/admin/sessions/refresh`,
    {},
    { headers: { "Content-Type": "application/json" }, withCredentials: true }
  );
}

// ── Request interceptor — cookie sent automatically ──────────────────────────

adminApi.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// ── Response interceptor — unwrap envelope + auto-refresh on 401 ─────────────

adminApi.interceptors.response.use(
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
  async (error) => {
    const normalizedError = normalizeApiError(error);
    const originalRequest = error.config;
    const is401 = error?.response?.status === 401;

    if (!is401 || typeof window === "undefined") {
      return Promise.reject(normalizedError);
    }

    const path = window.location.pathname;

    const isLoginEndpoint = originalRequest.url?.includes("/v1/admin/sessions") &&
      !originalRequest.url?.includes("/refresh");

    if (!originalRequest._retry && !isLoginEndpoint) {
      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => adminApi(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await refreshAdminToken();
        processQueue(null);
        return adminApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        useAuthStore.getState().clearAuth();
        if (path !== "/admin/login") {
          window.location.href = "/admin/login";
        }
        return Promise.reject(normalizedError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizedError);
  }
);

export { ApiContractError };
export default adminApi;
