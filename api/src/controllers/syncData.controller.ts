import { Request, Response } from "express";
import axios from "axios";
import Movie from "../models/Movie";
import { redisClient } from "../config/redis";
import { OMDB_API_KEY, OMDB_URL } from "../constants";
// import { fetchMovies } from "../services/omdb";

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
      return res.status(404).json({ message: "No data found from OMDB" });
    }

    const movies = data.Search;
    // let movies = await fetchMovies();

    let newOrUpdatedCount = 0;

    // We want to insert all movies from omdb in our own database
    // we also want to update or cache new movies in redis
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
    }

    res.json({
      message: `[SERVER]: ${newOrUpdatedCount} movie(s) synced successfully.`,
    });
  } catch (error) {
    // Log error
    console.log("[SERVER]: Error syncing data: ", error);
    res
      .status(500)
      .json({ message: "Failed to sync data", error: (error as Error).message });
  }
};

export default syncData;
