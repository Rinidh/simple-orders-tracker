import dotenv from "dotenv";
import express from "express";
import connectToDatabase from "./db";
import orderRouter from "./routes/order.route";
import reportRouter from "./routes/report.route";
import { errorHandler } from "./middleware/error";
import { NotFoundError } from "./errors/not-found-error";
import { UnsupportedMediaTypeError } from "./errors/unsupported-media-type-error";
import logger, { addMongoTransport } from "./logger";

dotenv.config();

// Ensure the MongoDB transport is added after environment variables are loaded.
addMongoTransport(process.env.MONGODB_URI);

const app = express();
const port = process.env.PORT ?? "5000";

app.use((req, res, next) => {
  const hasBody =
    (req.headers["content-length"] !== undefined &&
      req.headers["content-length"] !== "0") ||
    req.headers["transfer-encoding"] !== undefined;

  if (
    ["POST", "PUT", "PATCH"].includes(req.method) &&
    hasBody &&
    !req.is("application/json")
  ) {
    throw new UnsupportedMediaTypeError("Request body must be JSON");
  }

  next();
});

app.use(express.json());

app.use("/api/orders", orderRouter);
app.use("/api/reports", reportRouter);

app.use((req, res, next) => {
  throw new NotFoundError(`Route ${req.originalUrl} not found`);
});
app.use(errorHandler);

async function startServer(): Promise<void> {
  try {
    await connectToDatabase();

    app.listen(port, () => {
      logger.info(`Server listening on port ${port}`);
    });
  } catch (error) {
    logger.error("Failed to start server", { error: error as any });
  }
}

startServer();
