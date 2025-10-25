"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useRef } from "react";

// Singleton QueryClient to survive HMR and prevent mounting issues
let globalQueryClient: QueryClient | undefined = undefined;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes (increased from 1 minute for better caching)
        gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection time)
        refetchOnWindowFocus: false,
        retry: 1, // Retry failed requests once
      },
    },
  });
}

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: make a new query client if we don't already have one
  if (!globalQueryClient) {
    globalQueryClient = makeQueryClient();
  }
  return globalQueryClient;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  // We use useRef to ensure the client is only created once
  const queryClientRef = useRef<QueryClient | undefined>(undefined);
  if (!queryClientRef.current) {
    queryClientRef.current = getQueryClient();
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      {children}
    </QueryClientProvider>
  );
}
