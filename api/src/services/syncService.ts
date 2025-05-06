import axios from "axios";
import Movie from "../models/Movie";
import { redisClient } from "../config/redis";
import { OMDB_API_KEY, OMDB_URL } from "../constants";
import logger from "../utils/logger";

export const fetchAndSyncMovies = async (): Promise<number> => {
  try {
    const { data } = await axios.get(OMDB_URL, {
      params: {
        s: "space",
        y: "2020",
        apikey: OMDB_API_KEY,
      },
    });

    if (!data?.Search) {
      const errorMessage = "[SYNC]: No valid data returned from OMDb";
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const movies = data.Search;
    let newOrUpdatedCount = 0;

    // Iterate over the fetched movies and update the DB and Redis cache
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

        // Update Redis with the latest movie data
        await redisClient.set(movie.imdbID, JSON.stringify(movie));
        await redisClient.expire(movie.imdbID, 3600);
      }
    }

    // Flush Redis if new or updated movies were found
    if (newOrUpdatedCount > 0) {
      await redisClient.flushAll();
      logger.info("[SYNC]: Flushing redis cache...");
    }

    return newOrUpdatedCount;
  } catch (error) {
    logger.error("[SYNC]: Error syncing data from OMDb API", error);
    throw new Error(
      `[SYNC]: Failed to fetch and sync movies - ${(error as Error).message}`,
    );
  }
};
