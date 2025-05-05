import { createClient } from "redis";

export const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.on("connect", () => {
  console.log("[REDIS]: Connected to redis...");
});

redisClient.on("error", () => {
  console.log("[REDIS]: Error connecting to redis...");
});
