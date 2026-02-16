import mongoose from "mongoose";
import logger from "../utils/logger";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      maxPoolSize: 60,
    });
    logger.info("MongoDB connected successfully");
  } catch (err: any) {
    logger.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
