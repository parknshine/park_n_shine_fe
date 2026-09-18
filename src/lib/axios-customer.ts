import axios from "axios";
import { ApiContractError, normalizeApiError } from "@/lib/api-error";
import { unwrapEnvelopeData } from "@/lib/token-storage";
import {
  getCustomerAccessToken,
  getCustomerRefreshToken,
} from "@/lib/customer-token-storage";
import { useCustomerAuthStore } from "@/store/customer-auth-store";

declare module "axios" {
  export interface AxiosRequestConfig {
    // Caller wants to handle an invalid session itself (e.g. show a modal)
    // instead of the interceptor hard-redirecting to /login.
    skipAuthRedirect?: boolean;
  }
}

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

const customerApi = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// Single-flight queue for concurrent 401s.
let isRefreshing = false;
type QueueEntry = {
  resolve: () => void;
  reject: (err: unknown) => void;
};
let failedQueue: QueueEntry[] = [];

function processQueue(error: unknown) {
  failedQueue.forEach((entry) => (error ? entry.reject(error) : entry.resolve()));
  failedQueue = [];
}

function isCustomerSessionCreate(
  url: string | undefined,
  method: string | undefined,
) {
  const path = url ?? "";
  return (
    (method ?? "get").toLowerCase() === "post" &&
    path.includes("/v1/auth/session") &&
    !path.includes("/refresh")
  );
}

function persistSessionTokens(payload: unknown) {
  const data = payload as { token?: string; refreshToken?: string } | null;
  if (!data?.token) return;
  useCustomerAuthStore.getState().setTokens(data.token, data.refreshToken);
}

async function refreshCustomerToken(): Promise<void> {
  const refreshToken =
    getCustomerRefreshToken() ?? useCustomerAuthStore.getState().refreshToken;

  if (refreshToken) {
    try {
      const response = await axios.post(
        `${baseURL}/v1/auth/session/refresh`,
        { refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );
      persistSessionTokens(unwrapEnvelopeData(response.data));
      return;
    } catch {
      // fall through to Firebase re-exchange
    }
  }

  const { auth } = await import("@/lib/firebase");
  const fbUser = auth.currentUser;
  if (!fbUser) throw new Error("No refresh token and no Firebase session");

  const idToken = await fbUser.getIdToken(true);
  const response = await axios.post(
    `${baseURL}/v1/auth/session`,
    { idToken },
    { headers: { "Content-Type": "application/json" } }
  );
  persistSessionTokens(unwrapEnvelopeData(response.data));
}

customerApi.interceptors.request.use(
  (config) => {
    if (!isCustomerSessionCreate(config.url, config.method)) {
      const token =
        getCustomerAccessToken() ?? useCustomerAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

customerApi.interceptors.response.use(
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

    if (!is401 || typeof window === "undefined" || !originalRequest) {
      return Promise.reject(normalizedError);
    }

    const isSessionCreate = isCustomerSessionCreate(
      originalRequest.url,
      originalRequest.method,
    );

    if (!originalRequest._retry && !isSessionCreate) {
      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => customerApi(originalRequest))
          .catch(() => Promise.reject(normalizedError));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await refreshCustomerToken();
        processQueue(null);
        return customerApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        useCustomerAuthStore.getState().clearCustomer();
        const { auth } = await import("@/lib/firebase");
        await auth.signOut().catch(() => {});
        if (
          !originalRequest.skipAuthRedirect &&
          window.location.pathname !== "/login"
        ) {
          window.location.href = "/login";
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
export default customerApi;
