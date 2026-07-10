import axios from "axios";
import { ApiContractError, normalizeApiError } from "@/lib/api-error";
import { useCustomerAuthStore } from "@/store/customer-auth-store";

declare module "axios" {
  export interface AxiosRequestConfig {
    // Caller wants to handle an invalid session itself (e.g. show a modal)
    // instead of the interceptor hard-redirecting to /login.
    skipAuthRedirect?: boolean;
  }
}

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

// Authenticated customer-account endpoints (/v1/me, /v1/me/bookings, …).
// pns_token httpOnly cookie is sent automatically via withCredentials.
const customerApi = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
  withCredentials: true,
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

// Refresh the session. pns_refresh cookie is sent automatically (withCredentials).
// If the refresh cookie is expired, fall back to Firebase ID token re-exchange.
async function refreshCustomerToken(): Promise<void> {
  // Try 1: refresh endpoint — pns_refresh cookie sent automatically.
  try {
    await axios.post(
      `${baseURL}/v1/auth/session/refresh`,
      {},
      { headers: { "Content-Type": "application/json" }, withCredentials: true }
    );
    return;
  } catch {
    // fall through to Firebase re-exchange
  }

  // Try 2: re-exchange still-valid Firebase session for new cookies.
  const { auth } = await import("@/lib/firebase");
  const fbUser = auth.currentUser;
  if (!fbUser) throw new Error("No refresh cookie and no Firebase session");

  const idToken = await fbUser.getIdToken(true);
  await axios.post(
    `${baseURL}/v1/auth/session`,
    { idToken },
    { headers: { "Content-Type": "application/json" }, withCredentials: true }
  );
}

// Unwrap { success, data } envelope + handle 401 with cookie refresh.
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
