import { Request, Response } from "express";
import axios from "axios";
import Movie from "../models/Movie";
import { redisClient } from "../config/redis";
import { OMDB_API_KEY, OMDB_URL } from "../constants";

const getData = async (req: Request, res: Response): Promise<Response | undefined> => {
  const { q } = req.query;
  const query = q?.toString().toLowerCase();

  if (!query) {
    return res
      .status(400)
      .json({ message: 'Query parameter "q" is required.' });
  }

  try {
    // First, try to get the data from Redis cache
    const cachedMovies = await redisClient.get(query);

    if (cachedMovies) {
      return res.json(JSON.parse(cachedMovies));
    }

    // If no cache, query MongoDB for movies
    const mongoMovies = await Movie.find({
      title: new RegExp(query, "i"),
    }).limit(10);

    // Cache the results in Redis for future use
    await redisClient.set(query, JSON.stringify(mongoMovies)); // Cache the results
    await redisClient.expire(query, 3600); // Set expiration to 1 hour

    return res.json(mongoMovies);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to get data", error: (error as Error).message });
  }
};

export default getData;
