import axios from "axios";
import { ApiContractError, normalizeApiError } from "@/lib/api-error";
import {
  CUSTOMER_TOKEN_KEY,
  CUSTOMER_REFRESH_KEY,
  useCustomerAuthStore,
} from "@/store/customer-auth-store";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

// Authenticated customer-account endpoints (/v1/me, /v1/me/bookings, …).
// Uses the app session token (Bearer), NOT the Firebase ID token and NOT the
// anonymous X-Booking-Token used by the public booking flow.
const customerApi = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// Attach app session token from localStorage.
customerApi.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(CUSTOMER_TOKEN_KEY);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Token refresh state (single-flight; queue concurrent 401s).
let isRefreshing = false;
type QueueEntry = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};
let failedQueue: QueueEntry[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((entry) =>
    error ? entry.reject(error) : entry.resolve(token!)
  );
  failedQueue = [];
}

// Refresh the app token. If the refresh token is dead but the Firebase user is
// still signed in, re-exchange the Firebase ID token for a fresh session.
async function refreshCustomerToken(): Promise<string> {
  const refreshToken = localStorage.getItem(CUSTOMER_REFRESH_KEY);

  if (refreshToken) {
    try {
      const { data } = await axios.post<{
        success: boolean;
        data: { token: string; refreshToken: string };
      }>(
        `${baseURL}/v1/auth/session/refresh`,
        { refreshToken },
        { headers: { "Content-Type": "application/json" } }
      );
      if (data.success) {
        localStorage.setItem(CUSTOMER_TOKEN_KEY, data.data.token);
        localStorage.setItem(CUSTOMER_REFRESH_KEY, data.data.refreshToken);
        return data.data.token;
      }
    } catch {
      // fall through to Firebase re-exchange
    }
  }

  // Refresh token missing/expired — re-exchange the still-valid Firebase session.
  const { auth } = await import("@/lib/firebase");
  const fbUser = auth.currentUser;
  if (!fbUser) throw new Error("No refresh token and no Firebase session");

  const idToken = await fbUser.getIdToken(true);
  const { data } = await axios.post<{
    success: boolean;
    data: { token: string; refreshToken: string };
  }>(
    `${baseURL}/v1/auth/session`,
    { idToken },
    { headers: { "Content-Type": "application/json" } }
  );
  if (!data.success) throw new Error("Session re-exchange failed");

  localStorage.setItem(CUSTOMER_TOKEN_KEY, data.data.token);
  localStorage.setItem(CUSTOMER_REFRESH_KEY, data.data.refreshToken);
  return data.data.token;
}

// Unwrap { success, data } envelope + handle 401 with token refresh.
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

    if (!originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return customerApi(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshCustomerToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return customerApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem(CUSTOMER_TOKEN_KEY);
        localStorage.removeItem(CUSTOMER_REFRESH_KEY);
        useCustomerAuthStore.getState().clearCustomer();
        const { auth } = await import("@/lib/firebase");
        await auth.signOut().catch(() => {});
        if (window.location.pathname !== "/login") {
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
