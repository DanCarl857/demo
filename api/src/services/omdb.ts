import axios from "axios";
import { Movie } from "../types/movie";

const OMDB_API_KEY = process.env.OMDB_API_KEY!;
const OMDB_URL = "http://www.omdbapi.com/";

export const fetchMovies = async (): Promise<Movie[]> => {
  let page = 1;
  let movies: Movie[] = [];

  while (true) {
    const { data } = await axios.get(OMDB_URL, {
      params: {
        apikey: OMDB_API_KEY,
        s: "space",
        type: "movie",
        y: "2020",
        page,
      },
    });

    if (data.Response === "False") break;

    movies.push(...data.Search);
    page++;

    if (movies.length >= parseInt(data.totalResults)) break;
  }

  return movies;
};
