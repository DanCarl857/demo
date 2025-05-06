import axios, { AxiosRequestConfig, Method } from "axios";
import snakecaseKeys from "snakecase-keys";
import { Schema, z } from "zod";

import { getEnvironment } from "@/core/environment";
import { camelCase } from "@/core/utils/transformers";

interface Options<T extends Schema> {
  endpoint: string;
  method?: Method;
  config?: Omit<AxiosRequestConfig, "headers">;
  configureHeaders?: (headers: Record<string, string>) => void;
  response: T;
}

export type Fetcher = <T extends Schema>(
  options: Options<T>,
  retryCount?: number,
) => Promise<z.infer<T>>;

interface FetcherOptions {
  apiToken?: string | undefined;
}

const MAX_RETRY_COUNT = 3;

export function createFetcher({ apiToken }: FetcherOptions = {}): Fetcher {
  // const baseHeaders = createHeaders({ apiToken });
  const { baseURL } = getEnvironment(z.object({ baseURL: z.string().url() }), {
    baseURL:
      process.env["NEXT_PUBLIC_API_BASE_URL"] || "http:localhost:3000/api/v1",
  });

  return async function fetchWithRetry<T extends Schema>(
    {
      method = "get",
      config = {},
      endpoint,
      configureHeaders,
      response,
    }: Options<T>,
    retryCount = 0,
  ): Promise<z.infer<T>> {
    try {
      // const headers: Record<string, string> = { ...baseHeaders };
      //
      // configureHeaders?.(headers);

      const endpointURL = `http://localhost:3000/api/v1${endpoint}`;
      const axiosConfig: AxiosRequestConfig = { method, ...config };

      const axiosResponse = await axios(endpointURL, axiosConfig);

      return response.parseAsync(axiosResponse.data) as Promise<z.infer<T>>;
    } catch (error) {
      console.error(`Error in createFetcher (retry ${retryCount}):`, error);

      if (retryCount < MAX_RETRY_COUNT) {
        console.log(`Retrying... (retry ${retryCount + 1})`);
        return fetchWithRetry<T>(
          { method, config, endpoint, configureHeaders, response },
          retryCount + 1,
        );
      } else {
        throw error; // Max retry count reached, throw the error
      }
    }
  };
}

export function requestBody(body: Record<string, unknown> | unknown[]) {
  return JSON.stringify(snakecaseKeys(body, { deep: true }));
}

export function responseBody<T extends Schema>(schema: T) {
  return z.preprocess(camelCase, schema);
}

// function createHeaders({ apiToken }: Pick<FetcherOptions, "apiToken">) {
//   const headers: Record<string, string> = {};
//
//   headers["Accept"] = "application/json";
//   headers["Content-Type"] = "application/json";
//
//   if (apiToken) {
//     headers["Authorization"] = createAuthorizationHeader(apiToken);
//   }
//
//   return headers;
// }

// function createAuthorizationHeader(apiToken: string) {
//   const authHeaderPrefix = "Token";
//   return `${authHeaderPrefix} ${apiToken}`;
// }
