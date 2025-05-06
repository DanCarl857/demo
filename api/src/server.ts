import { app } from "./app";
import { connectDB } from "./config/db";
import { redisClient } from "./config/redis";
import dotenv from "dotenv";
import logger from "./utils/logger";
dotenv.config();

(async () => {
  await connectDB();
  await redisClient.connect();
  const port = process.env.PORT || 3000;
  app.listen(port, () => logger.info(`Server running on port ${port}...`));
})();
