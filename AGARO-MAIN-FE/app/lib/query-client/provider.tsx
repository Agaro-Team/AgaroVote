/**
 * Query Client Provider with Persistence
 *
 * Wraps the application with TanStack Query and enables persistence to localStorage.
 * This ensures query data survives page refreshes.
 */

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { deserialize, serialize } from "wagmi";
import React from "react";
import { queryClient } from "../query-client";

/**
 * Create async localStorage wrapper for persister
 * localStorage is actually synchronous, but we wrap it to use with async persister
 */
const asyncLocalStorage = {
  getItem: async (key: string) => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  },
};

/**
 * Create persister for localStorage using async storage persister
 * Uses wagmi's serialize/deserialize for proper handling of BigInt values
 */
const persister = createAsyncStoragePersister({
  serialize,
  storage: asyncLocalStorage,
  deserialize,
});

/**
 * QueryClientProvider Component
 *
 * Provides TanStack Query with localStorage persistence.
 * All query data will be persisted and restored on page refresh.
 */
export const QueryClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <PersistQueryClientProvider
    client={queryClient}
    persistOptions={{ persister }}
  >
    {children}
    <ReactQueryDevtools initialIsOpen={false} />
  </PersistQueryClientProvider>
);
