import { useState, useCallback } from "react";
import type { AxiosRequestConfig } from "axios";
import api from "@/lib/axios";

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Thin wrapper around the axios instance for imperative data fetching.
 * For declarative data fetching consider React Query or SWR.
 */
export function useApi<T>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async (config: AxiosRequestConfig) => {
    setState({ data: null, isLoading: true, error: null });
    try {
      const response = await api<T>(config);
      setState({ data: response.data, isLoading: false, error: null });
      return response.data;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred";
      setState({ data: null, isLoading: false, error: message });
      throw err;
    }
  }, []);

  return { ...state, execute };
}
