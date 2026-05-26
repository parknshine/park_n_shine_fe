import axios from "axios";
import { API_ERROR_CODES, normalizeApiError } from "@/lib/api-error";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

const crewApi = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// ── Token refresh state ──────────────────────────────────────────────────────

interface QueueEntry {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueueEntry[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

async function refreshCrewToken(): Promise<string> {
  const currentToken = localStorage.getItem("crew-token");
  if (!currentToken) throw new Error("No crew token");

  const response = await axios.post<{ success: boolean; data: { token: string } }>(
    `${baseURL}/v1/crew/sessions/refresh`,
    {},
    { headers: { Authorization: `Bearer ${currentToken}` } }
  );
  const { token } = response.data.data;
  localStorage.setItem("crew-token", token);
  return token;
}

// ── Request interceptor — attach crew token ──────────────────────────────────

crewApi.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("crew-token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
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
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return crewApi(originalRequest);
          })
          .catch(() => Promise.reject(normalizedError));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshCrewToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return crewApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("crew-token");
        if (window.location.pathname !== "/crew/login") {
          window.location.href = "/crew/login";
        }
        return Promise.reject(normalizedError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizedError);
  }
);

export default crewApi;
