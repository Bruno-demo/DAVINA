import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectMongoDB = async (): Promise<void> => {
  const mongoURI: string =
    process.env.MONGO_URI || "mongodb://localhost:27017/skincare";

  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    } as mongoose.ConnectOptions);

    console.log("Connected to MongoDB successfully");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error connecting to MongoDB:", error.message);
    } else {
      console.error("Unknown error connecting to MongoDB");
    }
    process.exit(1);
  }
};

export default connectMongoDB;
