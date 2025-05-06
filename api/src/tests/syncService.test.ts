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

  it("should fetch movies from OMDb, sync them to the database, and update Redis", async () => {
    const mockMovies = [
      {
        imdbID: "tt1234567",
        Title: "Space Adventure",
        Year: "2020",
        Type: "movie",
        Poster: "http://example.com/poster.jpg",
      },
    ];

    const fullMovieData = {
      imdbID: "tt1234567",
      Title: "Space Adventure",
      Year: "2020",
      Type: "movie",
      Poster: "http://example.com/poster.jpg",
      Director: "John Doe",
      Writer: "Jane Doe",
      Plot: "A thrilling space adventure.",
    };

    // Mock OMDb API calls
    (axios.get as jest.Mock)
      .mockResolvedValueOnce({ data: { Search: mockMovies } }) // First call for basic movie list
      .mockResolvedValueOnce({ data: fullMovieData }); // Second call for full movie details

    // Mock database and Redis operations
    (Movie.findOne as jest.Mock).mockResolvedValueOnce(null); // Ensure updateOne is triggered
    (Movie.updateOne as jest.Mock).mockResolvedValueOnce({});
    (Movie.prototype.save as jest.Mock).mockResolvedValueOnce({});
    (redisClient.set as jest.Mock).mockResolvedValueOnce("OK");
    (redisClient.expire as jest.Mock).mockResolvedValueOnce(true);
    (redisClient.flushAll as jest.Mock).mockResolvedValueOnce("OK");

    const result = await fetchAndSyncMovies();

    expect(axios.get).toHaveBeenCalledWith(expect.any(String), {
      params: { s: "space", y: "2020", apikey: expect.any(String) },
    });
    expect(axios.get).toHaveBeenCalledWith(expect.any(String), {
      params: { i: "tt1234567", apikey: expect.any(String) },
    });
    expect(Movie.findOne).toHaveBeenCalledWith({ imdbID: "tt1234567" });
    expect(Movie.prototype.save).toHaveBeenCalled();
    expect(redisClient.set).toHaveBeenCalledWith(
      "tt1234567",
      JSON.stringify({
        imdbID: "tt1234567",
        title: "Space Adventure",
        year: "2020",
        type: "movie",
        poster: "http://example.com/poster.jpg",
        director: "John Doe",
        writer: "Jane Doe",
        plot: "A thrilling space adventure.",
      }),
    );
    expect(redisClient.expire).toHaveBeenCalledWith("tt1234567", 14400);
    expect(redisClient.flushAll).toHaveBeenCalled();
    expect(result).toBe(1);
  });

  it("should skip syncing if full movie data is not returned", async () => {
    const mockMovies = [
      {
        imdbID: "tt1234567",
        Title: "Space Adventure",
        Year: "2020",
        Type: "movie",
        Poster: "http://example.com/poster.jpg",
      },
    ];

    (axios.get as jest.Mock)
      .mockResolvedValueOnce({ data: { Search: mockMovies } }) // First call for basic movie list
      .mockResolvedValueOnce({ data: null }); // Second call returns no full movie data

    const result = await fetchAndSyncMovies();

    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(Movie.updateOne).not.toHaveBeenCalled();
    expect(Movie.prototype.save).not.toHaveBeenCalled();
    expect(redisClient.set).not.toHaveBeenCalled();
    expect(result).toBe(0);
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