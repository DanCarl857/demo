import { Fetcher } from "@/core/api/fetcher";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { homeEndpoints } from "./endpoints";

export function homeQueries(fetcher: Fetcher) {
  const api = homeEndpoints(fetcher);

  return createQueryKeys("home", {
    getMovies: (query: string) => ({
      queryKey: ["getMovies", query],
      queryFn: () => api.getMovies(query),
    }),
    syncMovies: () => ({
      queryKey: ["syncMovies"],
      queryFn: () => api.syncMovies(),
    }),
  });
}
