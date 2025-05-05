import { app } from "./app";
import { connectDB } from "./config/db";
import { redisClient } from "./config/redis";
import dotenv from "dotenv";
dotenv.config();

(async () => {
  await connectDB();
  await redisClient.connect();
  const port = process.env.PORT || 3000;
  app.listen(port, () =>
    console.log(`[SERVER]: Server running on port ${port}...`),
  );
})();
