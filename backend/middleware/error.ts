import { NextFunction, Request, Response } from "express";
import {
  MongoNetworkError,
  MongoNetworkTimeoutError,
  MongoServerError,
  MongoServerSelectionError,
} from "mongodb";
import mongoose from "mongoose";
import { CustomError } from "../errors/custom-error.js";
import { DocumentCastError } from "../errors/document-cast-error.js";
import logger from "../logger";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) {
    return next(err); // to express default error handler
  }

  switch (true) {
    case err instanceof CustomError: {
      res.status(err.statusCode).json({
        message: err.message,
        errors: err.errors,
      });
      return;
    }

    case err instanceof DocumentCastError: {
      logger.warn(`Invalid mongo ID detected: ${(err as any).invalidMongoId}`);
      res.status(err.statusCode).json({
        message: err.message,
        errors: err.errors,
      });
      return;
    }

    case err instanceof mongoose.Error.ValidationError: {
      res.status(422).json({
        message: err.message,
        errors: err.errors,
      });
      return;
    }

    case err instanceof mongoose.Error.CastError: {
      res.status(400).json({ message: err.message, errors: [] });
      return;
    }

    case (err as MongoServerError).name === "MongoServerError" &&
      (err as MongoServerError).code === 11000: {
      logger.warn(
        `Duplicate unique key: ${JSON.stringify((err as MongoServerError).keyValue)}`,
      );
      res
        .status(409)
        .json({ message: "Field value already taken", errors: [] });
      return;
    }

    case err instanceof MongoNetworkError ||
      err instanceof MongoServerSelectionError ||
      err instanceof MongoNetworkTimeoutError: {
      logger.error("Database unavailable error", { error: err as any });

      res.status(503).json({
        message: "Database unavailable",
        errors: [],
      });
      return;
    }

    case (err as any).code === "ECONNRESET": {
      logger.error("Connection reset error", { error: err as any });

      res.status(503).json({
        message: "Service is unavailable",
        errors: [],
      });
      return;
    }

    case err instanceof Error:
      logger.error("An unhandled error was thrown", { error: err as any });
      return res.status(500).json({
        message: "Internal Server Error",
        errors: [],
      });

    default:
      logger.error("An unknown non-error was thrown", { error: err as any });
      return res.status(500).json({
        message: "Internal Server Error",
        errors: [],
      });
  }
};
