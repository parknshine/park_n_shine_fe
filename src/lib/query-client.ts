"use client";

import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { removeOldestQuery } from "@tanstack/react-query-persist-client";

const ONE_MINUTE = 60 * 1000;
const ONE_DAY = 24 * 60 * ONE_MINUTE;

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 7 * ONE_DAY,
        networkMode: "offlineFirst",
        refetchOnMount: false,
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
        retry: 3,
        retryDelay: (attemptIndex) =>
          Math.min(1000 * 2 ** attemptIndex, 30_000),
        staleTime: ONE_MINUTE,
      },
      mutations: {
        gcTime: 7 * ONE_DAY,
        networkMode: "offlineFirst",
        retry: 3,
        retryDelay: (attemptIndex) =>
          Math.min(1000 * 2 ** attemptIndex, 30_000),
      },
    },
  });
}

export function makeQueryPersister() {
  return createSyncStoragePersister({
    key: "park-shine-query-cache",
    retry: removeOldestQuery,
    storage: typeof window === "undefined" ? undefined : window.localStorage,
    throttleTime: 1_000,
  });
}

export const queryPersistenceOptions = {
  // v2: admin polling queries are no longer persisted — bump discards the
  // oversized v1 caches that were filling localStorage.
  buster: "park-shine-query-v2",
  maxAge: 7 * ONE_DAY,
};
