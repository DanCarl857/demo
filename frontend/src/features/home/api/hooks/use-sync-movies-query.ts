import { useQuery } from "@tanstack/react-query";

import { useGetMovieQueries } from "./use-home-queries";

export function useSyncMovieQuery() {
  const { syncMovies } = useGetMovieQueries();

  return useQuery({
    ...syncMovies(),
    refetchOnWindowFocus: false,
  });
}
