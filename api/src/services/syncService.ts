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
      // Fetch full movie details for each movie by imdbID
      const { data: fullMovieData } = await axios.get(OMDB_URL, {
        params: {
          i: movie.imdbID,
          apikey: OMDB_API_KEY,
        },
      });

      if (!fullMovieData) {
        const errorMessage = `[SYNC]: No valid full data returned for movie with imdbID: ${movie.imdbID}`;
        logger.error(errorMessage);
        continue;
      }

      // Check if the movie already exists in the database
      const existingMovie = await Movie.findOne({ imdbID: movie.imdbID });

      // Prepare movie data for update or creation
      const movieData = {
        imdbID: movie.imdbID,
        title: fullMovieData.Title,
        year: fullMovieData.Year,
        type: fullMovieData.Type,
        poster: fullMovieData.Poster,
        director: fullMovieData.Director,
        writer: fullMovieData.Writer,
        plot: fullMovieData.Plot,
      };

      if (existingMovie) {
        // Update the movie if it exists in the database
        await Movie.updateOne(
          { imdbID: movie.imdbID },
          {
            $set: movieData,
          },
        );

        // Update Redis cache with the new data
        await redisClient.set(movie.imdbID, JSON.stringify(movieData));
        await redisClient.expire(movie.imdbID, 14400); // 4 hours expiration
        newOrUpdatedCount++;
      } else {
        // If the movie doesn't exist, create it and update Redis
        const newMovie = new Movie(movieData);

        await newMovie.save();

        // Update Redis with the new movie data
        await redisClient.set(movie.imdbID, JSON.stringify(movieData));
        await redisClient.expire(movie.imdbID, 14400); // 4 hours expiration
        newOrUpdatedCount++;
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
