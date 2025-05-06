import { useFetcher } from "@/core/api/context";

import { homeQueries } from "../queries";

export function useGetMovieQueries() {
  const fetcher = useFetcher();
  return homeQueries(fetcher);
}
