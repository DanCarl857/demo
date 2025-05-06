import { z } from "zod";
import { Fetcher, responseBody } from "@/core/api/fetcher";

export type MovieResponse = z.infer<typeof MovieResponse>;
export type MovieType = z.infer<typeof Movie>;

export const Movie = z.object({
  director: z.string(),
  imdbID: z.string(),
  plot: z.string(),
  poster: z.string(),
  title: z.string(),
  type: z.string(),
  writer: z.string(),
  year: z.string(),
});

export const MovieResponse = z.array(Movie);

export function homeEndpoints(fetcher: Fetcher) {
  return {
    getMovies: (query: string) =>
      fetcher({
        endpoint: `/movies/search?q=${query}`,
        response: responseBody(MovieResponse),
      }),
    syncMovies: () =>
      fetcher({
        endpoint: `/movies/sync`,
        response: responseBody(z.unknown()),
      }),
  };
}
