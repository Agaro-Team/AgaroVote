import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClientProvider as TanstackQueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { queryClient } from "../lib/query-client";

export const QueryClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <TanstackQueryClientProvider client={queryClient}>
    {children}
    <ReactQueryDevtools initialIsOpen={false} />
  </TanstackQueryClientProvider>
);
