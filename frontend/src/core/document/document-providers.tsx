"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { type ReactNode, useState } from "react";

// import { FetcherContextProvider } from "../api/context";

interface Properties {
  children: ReactNode;
}

export function DocumentProviders({ children }: Properties) {
  const [queryClient] = useState(new QueryClient());

  return (
    <ThemeProvider attribute="class" forcedTheme="light" themes={["light"]}>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        {/* <FetcherContextProvider value={{ apiToken: "" }}>{children}</FetcherContextProvider> */}
        <div>{children}</div>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
