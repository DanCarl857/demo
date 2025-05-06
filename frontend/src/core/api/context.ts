"use client";

import { useMemo } from "react";

import { createFetcher } from "@/core/api/fetcher";
import { createStrictContext } from "@/core/utils/context";

export interface FetcherContext {
  apiToken?: string;
}

export const [FetcherContextProvider, useFetcherContext] =
  createStrictContext<FetcherContext>();

export function useFetcher() {
  const { apiToken } = useFetcherContext();
  return useMemo(() => createFetcher({ apiToken }), [apiToken]);
}
