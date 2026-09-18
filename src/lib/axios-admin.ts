import axios from "axios";
import { ApiContractError, normalizeApiError } from "@/lib/api-error";
import { useAuthStore } from "@/store/auth-store";
import { accessForPath } from "@/lib/menu-access";
import {
  getAdminAccessToken,
  getAdminRefreshToken,
} from "@/lib/admin-token-storage";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

const adminApi = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// ── Token refresh state ──────────────────────────────────────────────────────

let isRefreshing = false;
type QueueEntry = { resolve: () => void; reject: (err: unknown) => void };
let failedQueue: QueueEntry[] = [];

function processQueue(error: unknown) {
  failedQueue.forEach((entry) => (error ? entry.reject(error) : entry.resolve()));
  failedQueue = [];
}

function isAdminLoginRequest(url: string | undefined, method: string | undefined) {
  const path = url ?? "";
  return (
    (method ?? "get").toLowerCase() === "post" &&
    path.includes("/v1/admin/sessions") &&
    !path.includes("/refresh")
  );
}

async function refreshAdminToken(): Promise<void> {
  const refreshToken = getAdminRefreshToken() ?? useAuthStore.getState().refreshToken;
  if (!refreshToken) throw new Error("No admin refresh token");

  const response = await axios.post(
    `${BASE_URL}/v1/admin/sessions/refresh`,
    { refreshToken },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    }
  );

  const payload =
    response.data &&
    typeof response.data === "object" &&
    "success" in response.data &&
    response.data.data !== undefined
      ? response.data.data
      : response.data;

  const nextAccess = payload?.token as string | undefined;
  const nextRefresh = (payload?.refreshToken as string | undefined) ?? refreshToken;
  if (!nextAccess) throw new Error("Admin refresh did not return a token");
  useAuthStore.getState().setTokens(nextAccess, nextRefresh);
}

const WRITE_METHODS = new Set(["post", "put", "patch", "delete"]);

adminApi.interceptors.request.use(
  (config) => {
    if (!isAdminLoginRequest(config.url, config.method)) {
      const token = getAdminAccessToken() ?? useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // ponytail: readonly enforced client-side at this single choke point (per design decision)
    if (
      typeof window !== "undefined" &&
      WRITE_METHODS.has((config.method ?? "get").toLowerCase()) &&
      !config.url?.includes("/v1/admin/sessions")
    ) {
      const { role, menuAccess } = useAuthStore.getState();
      if (accessForPath(window.location.pathname, role, menuAccess) !== "write") {
        return Promise.reject(new Error("You have read-only access to this menu"));
      }
    }
    return config;
  },
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
