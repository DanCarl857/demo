import mongoose from "mongoose";
import logger from "../utils/logger";

export const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  logger.info("MongoDB connected successfully...");
};
