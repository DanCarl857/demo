import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("[SERVER]: MongoDB connected...");
};
