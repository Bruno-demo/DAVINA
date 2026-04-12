import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../utils/logger";

dotenv.config();

const connectMongoDB = async (): Promise<void> => {
  const mongoURI: string =
    process.env.MONGO_URI || "mongodb://localhost:27017/skincare";

  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    } as mongoose.ConnectOptions);

    logger.info("Connected to MongoDB successfully");
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("Error connecting to MongoDB", { error: error.message });
    } else {
      logger.error("Unknown error connecting to MongoDB");
    }
    process.exit(1);
  }
};

export default connectMongoDB;
