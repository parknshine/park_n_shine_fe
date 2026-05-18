"use client";

import { useState, type ReactNode } from "react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import {
  makeQueryClient,
  makeQueryPersister,
  queryPersistenceOptions,
} from "@/lib/query-client";

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => makeQueryClient());
  const [persister] = useState(() => makeQueryPersister());

  return (
    <PersistQueryClientProvider
      client={queryClient}
      onSuccess={() => queryClient.resumePausedMutations()}
      persistOptions={{
        ...queryPersistenceOptions,
        dehydrateOptions: {
          shouldDehydrateMutation: (mutation) =>
            mutation.options.meta?.persist === true,
          shouldDehydrateQuery: (query) =>
            query.state.status === "success" &&
            query.options.meta?.persist !== false,
        },
        persister,
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
