import { useQuery } from "@tanstack/react-query";

import { useGetMovieQueries } from "./use-home-queries";

export function useGetMovieQuery(query: string) {
  const { getMovies } = useGetMovieQueries();

  return useQuery({
    ...getMovies(query),
    refetchOnWindowFocus: false,
  });
}
