import axios from "axios";
import Movie from "../models/Movie";
import { redisClient } from "../config/redis";
import { OMDB_API_KEY, OMDB_URL } from "../constants";
import logger from "../utils/logger";

export const fetchAndSyncMovies = async (): Promise<number> => {
  const { data } = await axios.get(OMDB_URL, {
    params: {
      s: "space",
      y: "2020",
      apikey: OMDB_API_KEY,
    },
  });

  if (!data?.Search) {
    logger.warn("[SYNC]: No data returned from OMDb");
    return 0;
  }

  const movies = data.Search;
  let newOrUpdatedCount = 0;

  for (const movie of movies) {
    const existingMovie = await Movie.findOne({ imdbID: movie.imdbID });

    if (!existingMovie || existingMovie.title !== movie.Title) {
      await Movie.updateOne(
        { imdbID: movie.imdbID },
        {
          $set: {
            title: movie.Title,
            year: movie.Year,
            type: movie.Type,
            poster: movie.Poster,
            director: movie.Director,
            writer: movie.Writer,
            plot: movie.Plot,
          },
        },
        { upsert: true },
      );

      newOrUpdatedCount++;

      await redisClient.set(movie.imdbID, JSON.stringify(movie));
      await redisClient.expire(movie.imdbID, 3600);
    }
  }

  if (newOrUpdatedCount > 0) {
    await redisClient.flushAll();
    logger.info("[SYNC]: Flushing redis cache...");
  }

  return newOrUpdatedCount;
};
