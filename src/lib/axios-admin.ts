import axios from "axios";
import { ApiContractError, normalizeApiError } from "@/lib/api-error";
import { useAuthStore } from "@/store/auth-store";

const adminApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// Attach admin token from localStorage
adminApi.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("admin-token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Token refresh state
let isRefreshing = false;
type QueueEntry = { resolve: (token: string) => void; reject: (err: unknown) => void };
let failedQueue: QueueEntry[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((entry) =>
    error ? entry.reject(error) : entry.resolve(token!)
  );
  failedQueue = [];
}

async function refreshAdminToken(): Promise<string> {
  const refreshToken = localStorage.getItem("admin-refresh-token");
  if (!refreshToken) throw new Error("No refresh token");

  const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "/api";
  const response = await axios.post<{
    success: boolean;
    data: { token: string; refreshToken: string };
  }>(
    `${baseURL}/v1/admin/sessions/refresh`,
    { refreshToken },
    { headers: { "Content-Type": "application/json" } }
  );

  const { token, refreshToken: newRefreshToken } = response.data.data;
  localStorage.setItem("admin-token", token);
  localStorage.setItem("admin-refresh-token", newRefreshToken);
  return token;
}

// Unwrap envelope + handle 401 with token refresh
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

    if (!originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return adminApi(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAdminToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return adminApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("admin-token");
        localStorage.removeItem("admin-refresh-token");
        localStorage.removeItem("admin-sites");
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
