import mongoose from "mongoose";
import { ConfigurationError } from "./errors/configuration-error";
import logger from "./logger";

async function connectToDatabase(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new ConfigurationError("MONGODB_URI is not set");
  }

  mongoose.connection.on("connected", () => {
    logger.info("MongoDB connected");
  });

  mongoose.connection.on("error", (error) => {
    logger.error("MongoDB connection error", { error: error as any });
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });

  await mongoose.connect(mongoUri);
}

export default connectToDatabase;
