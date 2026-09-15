import axios from "axios";
import { API_ERROR_CODES, normalizeApiError } from "@/lib/api-error";
import { unwrapEnvelopeData } from "@/lib/token-storage";
import {
  getCrewAccessToken,
  getCrewRefreshToken,
} from "@/lib/crew-token-storage";
import { useCrewAuthStore } from "@/store/crew-auth-store";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

const crewApi = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
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

function isCrewLoginRequest(url: string | undefined, method: string | undefined) {
  const path = url ?? "";
  return (
    (method ?? "get").toLowerCase() === "post" &&
    path.includes("/v1/crew/sessions") &&
    !path.includes("/refresh")
  );
}

async function refreshCrewToken(): Promise<void> {
  const refreshToken =
    getCrewRefreshToken() ?? useCrewAuthStore.getState().refreshToken;
  const accessToken =
    getCrewAccessToken() ?? useCrewAuthStore.getState().token;
  const bearer = refreshToken ?? accessToken;
  if (!bearer) throw new Error("No crew token");

  const response = await axios.post(
    `${baseURL}/v1/crew/sessions/refresh`,
    refreshToken ? { refreshToken } : {},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearer}`,
      },
    }
  );

  const payload = unwrapEnvelopeData(response.data) as {
    token?: string;
    refreshToken?: string;
  };
  const nextAccess = payload?.token;
  if (!nextAccess) throw new Error("Crew refresh did not return a token");
  useCrewAuthStore
    .getState()
    .setTokens(nextAccess, payload.refreshToken ?? refreshToken);
}

crewApi.interceptors.request.use(
  (config) => {
    if (!isCrewLoginRequest(config.url, config.method)) {
      const token =
        getCrewAccessToken() ?? useCrewAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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

    if (
      isUnauthorized &&
      typeof window !== "undefined" &&
      !originalRequest._retry &&
      !isCrewLoginRequest(originalRequest.url, originalRequest.method)
    ) {
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
        useCrewAuthStore.getState().clearCrewSession();
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
