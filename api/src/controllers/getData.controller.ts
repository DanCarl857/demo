import { Request, Response } from "express";
import Movie from "../models/Movie";
import { redisClient } from "../config/redis";
import logger from "../utils/logger";

const getData = async (
  req: Request,
  res: Response,
): Promise<Response | undefined> => {
  const { q } = req.query;
  const query = q?.toString().toLowerCase();

  // If a query string is provided, do a search
  if (query) {
    try {
      const cachedMovies = await redisClient.get(query);

      if (cachedMovies) {
        return res.json(JSON.parse(cachedMovies));
      }

      const mongoMovies = await Movie.find({
        $or: [
          { title: new RegExp(query, "i") },
          { director: new RegExp(query, "i") },
          { plot: new RegExp(query, "i") },
        ],
      }).limit(10);

      await redisClient.set(query, JSON.stringify(mongoMovies));
      await redisClient.expire(query, 3600);

      return res.json(mongoMovies);
    } catch (error) {
      logger.error(error);
      return res.status(500).json({
        message: "Failed to get data using search query",
        error: (error as Error).message,
      });
    }
  }

  // No query provided, return all movies
  const cacheKey = "__all_movies__";

  try {
    const cachedAll = await redisClient.get(cacheKey);

    if (cachedAll) {
      return res.json(JSON.parse(cachedAll));
    }

    const allMovies = await Movie.find().limit(50);
    await redisClient.set(cacheKey, JSON.stringify(allMovies));
    await redisClient.expire(cacheKey, 3600);

    return res.json(allMovies);
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      message: "Failed to get all data",
      error: (error as Error).message,
    });
  }
};

export default getData;
