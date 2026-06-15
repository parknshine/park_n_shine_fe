import axios from "axios";
import { API_ERROR_CODES, normalizeApiError } from "@/lib/api-error";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

const crewApi = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
  withCredentials: true,
});

// ── Token refresh state ──────────────────────────────────────────────────────

interface QueueEntry {
  resolve: () => void;
  reject: (err: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueueEntry[] = [];

function processQueue(error: unknown) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
}

async function refreshCrewToken(): Promise<void> {
  // Cookie crew-token is sent automatically via withCredentials.
  // Backend re-issues a new crew-token cookie on success.
  await axios.post(
    `${baseURL}/v1/crew/sessions/refresh`,
    {},
    { headers: { "Content-Type": "application/json" }, withCredentials: true }
  );
}

// ── Request interceptor — cookie sent automatically ──────────────────────────

crewApi.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// ── Response interceptor — unwrap envelope + auto-refresh on 401 ─────────────

crewApi.interceptors.response.use(
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

    const isUnauthorized =
      normalizedError.code === API_ERROR_CODES.CREW_SESSION_EXPIRED ||
      error?.response?.status === 401;

    if (isUnauthorized && typeof window !== "undefined" && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => crewApi(originalRequest))
          .catch(() => Promise.reject(normalizedError));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await refreshCrewToken();
        processQueue(null);
        return crewApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        window.dispatchEvent(new CustomEvent("crew-session-expired"));
        return Promise.reject(normalizedError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizedError);
  }
);

export default crewApi;
