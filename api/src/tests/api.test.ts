import request from "supertest";
import { app } from "../app";
import { redisClient } from "../config/redis";
import Movie from "../models/Movie";
import { fetchAndSyncMovies } from "../services/syncService";

jest.mock("../config/redis");
jest.mock("../models/Movie");
jest.mock("../services/syncService");

describe("GET /api/movies/search", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a list of movies from the database when no cache is available", async () => {
    const mockMovies = [
      { title: "Space Adventure", director: "John Doe", plot: "A space story" },
    ];

    // Mock the Mongoose query chain
    (Movie.find as jest.Mock).mockReturnValueOnce({
      limit: jest.fn().mockResolvedValueOnce(mockMovies),
    });

    (redisClient.get as jest.Mock).mockResolvedValueOnce(null); // No cache

    const response = await request(app).get("/api/v1/movies/search?q=space");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockMovies);
    expect(redisClient.get).toHaveBeenCalledWith("space");
    expect(Movie.find).toHaveBeenCalledWith({
      $or: [
        { title: new RegExp("space", "i") },
        { director: new RegExp("space", "i") },
        { plot: new RegExp("space", "i") },
      ],
    });
    expect(redisClient.set).toHaveBeenCalledWith(
      "space",
      JSON.stringify(mockMovies),
    );
  });

  it("should return cached movies if available", async () => {
    const cachedMovies = [
      { title: "Cached Movie", director: "Jane Doe", plot: "A cached story" },
    ];

    (redisClient.get as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(cachedMovies),
    );

    const response = await request(app).get("/api/v1/movies/search?q=space");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(cachedMovies);
    expect(redisClient.get).toHaveBeenCalledWith("space");
  });

  it("should return a 500 error if an exception occurs", async () => {
    (redisClient.get as jest.Mock).mockRejectedValueOnce(
      new Error("Redis error"),
    );

    const response = await request(app).get("/api/v1/movies/search?q=space");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Failed to get data using search query");
    expect(redisClient.get).toHaveBeenCalledWith("space");
  });
});

describe("GET /api/v1/movies/sync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should trigger data sync and return success message", async () => {
    (fetchAndSyncMovies as jest.Mock).mockResolvedValueOnce(5);

    const response = await request(app).get("/api/v1/movies/sync");

    // expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "[SERVER]: 5 movie(s) synced successfully.",
    );
    expect(fetchAndSyncMovies).toHaveBeenCalled();
  });

  it("should return a 500 error if the sync service throws an exception", async () => {
    (fetchAndSyncMovies as jest.Mock).mockRejectedValueOnce(
      new Error("OMDb API error"),
    );

    const response = await request(app).get("/api/v1/movies/sync");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Failed to sync data");
    expect(fetchAndSyncMovies).toHaveBeenCalled();
  });
});

