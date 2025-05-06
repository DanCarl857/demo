import { Request, Response } from "express";
import axios from "axios";
import Movie from "../models/Movie";
import { redisClient } from "../config/redis";
import { OMDB_API_KEY, OMDB_URL } from "../constants";
import logger from "../utils/logger";

const syncData = async (req: Request, res: Response) => {
  try {
    const { data } = await axios.get(OMDB_URL, {
      params: {
        s: "space",
        y: "2020",
        apikey: OMDB_API_KEY,
      },
    });

    if (!data || !data.Search) {
      logger.error("No data found from OMDB API...");
      return res.status(404).json({ message: "No data found from OMDB" });
    }

    const movies = data.Search;
    let newOrUpdatedCount = 0;

    for (const movie of movies) {
      // Fetch full details using imdbID
      const movieDetails = await axios.get(OMDB_URL, {
        params: {
          i: movie.imdbID,
          apikey: OMDB_API_KEY,
          plot: "full",
        },
      });

      const fullMovie = movieDetails.data;

      const existingMovie = await Movie.findOne({ imdbID: fullMovie.imdbID });

      if (
        !existingMovie ||
        existingMovie.title !== fullMovie.Title ||
        existingMovie.poster !== fullMovie.poster
      ) {
        await Movie.updateOne(
          { imdbID: fullMovie.imdbID },
          {
            $set: {
              title: fullMovie.Title,
              year: fullMovie.Year,
              type: fullMovie.Type,
              poster: fullMovie.Poster,
              director: fullMovie.Director,
              writer: fullMovie.Writer,
              plot: fullMovie.Plot,
            },
          },
          { upsert: true },
        );

        newOrUpdatedCount++;

        await redisClient.set(fullMovie.imdbID, JSON.stringify(fullMovie));
        await redisClient.expire(fullMovie.imdbID, 3600);
      }
    }

    if (newOrUpdatedCount > 0) {
      await redisClient.flushAll();
    }

    logger.info(`${newOrUpdatedCount} movie(s) synced successfully...`);

    res.json({
      message: `[SERVER]: ${newOrUpdatedCount} movie(s) synced successfully.`,
    });
  } catch (error) {
    logger.error("Error syncing data: ", error);
    res.status(500).json({
      message: "Failed to sync data",
      error: (error as Error).message,
    });
  }
};

export default syncData;
