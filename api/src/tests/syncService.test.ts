import axios from "axios";
import Movie from "../models/Movie";
import { redisClient } from "../config/redis";
import { fetchAndSyncMovies } from "../services/syncService";
import logger from "../utils/logger";

jest.mock("axios");
jest.mock("../models/Movie");
jest.mock("../config/redis");
jest.mock("../utils/logger");

describe("fetchAndSyncMovies", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch movies from OMDb and sync them to the database and Redis", async () => {
    const mockMovies = [
      {
        imdbID: "tt1234567",
        Title: "Space Adventure",
        Year: "2020",
        Type: "movie",
        Poster: "http://example.com/poster.jpg",
        Director: "John Doe",
        Writer: "Jane Doe",
        Plot: "A thrilling space adventure.",
      },
    ];

    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: { Search: mockMovies },
    });

    (Movie.findOne as jest.Mock).mockResolvedValueOnce(null);
    (Movie.updateOne as jest.Mock).mockResolvedValueOnce({});
    (redisClient.set as jest.Mock).mockResolvedValueOnce("OK");
    (redisClient.expire as jest.Mock).mockResolvedValueOnce(true);
    (redisClient.flushAll as jest.Mock).mockResolvedValueOnce("OK");

    const result = await fetchAndSyncMovies();

    expect(axios.get).toHaveBeenCalledWith(expect.any(String), {
      params: { s: "space", y: "2020", apikey: expect.any(String) },
    });
    expect(Movie.findOne).toHaveBeenCalledWith({ imdbID: "tt1234567" });
    expect(Movie.updateOne).toHaveBeenCalledWith(
      { imdbID: "tt1234567" },
      {
        $set: {
          title: "Space Adventure",
          year: "2020",
          type: "movie",
          poster: "http://example.com/poster.jpg",
          director: "John Doe",
          writer: "Jane Doe",
          plot: "A thrilling space adventure.",
        },
      },
      { upsert: true },
    );
    expect(redisClient.set).toHaveBeenCalledWith(
      "tt1234567",
      JSON.stringify(mockMovies[0]),
    );
    expect(redisClient.expire).toHaveBeenCalledWith("tt1234567", 3600);
    expect(redisClient.flushAll).toHaveBeenCalled();
    expect(result).toBe(1);
  });

  it("should log an error if OMDb API returns no data", async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: {} });

    await expect(fetchAndSyncMovies()).rejects.toThrow(
      "[SYNC]: No valid data returned from OMDb",
    );

    expect(logger.error).toHaveBeenCalledWith(
      "[SYNC]: No valid data returned from OMDb",
    );
  });

  it("should log an error if an exception occurs", async () => {
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    await expect(fetchAndSyncMovies()).rejects.toThrow(
      "[SYNC]: Failed to fetch and sync movies - Network error",
    );

    expect(logger.error).toHaveBeenCalledWith(
      "[SYNC]: Error syncing data from OMDb API",
      expect.any(Error),
    );
  });
});

