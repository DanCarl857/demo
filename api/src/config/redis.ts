import { createClient } from "redis";
import logger from "../utils/logger";

export const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.on("connect", () => {
  logger.info("Connected to redis successfully...");
});

redisClient.on("error", () => {
  logger.error("Error connecting to redis...");
});
