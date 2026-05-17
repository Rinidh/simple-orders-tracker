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
      console.warn(`Invalid mongo ID detected: ${err.invalidMongoId}`);
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
      console.warn(
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
      console.error(err);

      res.status(503).json({
        message: "Database unavailable",
        errors: [],
      });
      return;
    }

    case (err as any).code === "ECONNRESET": {
      console.error(err);

      res.status(503).json({
        message: "Service is unavailable",
        errors: [],
      });
      return;
    }

    case err instanceof Error:
      console.error("An unhandled error was thrown");
      console.error(err);
      return res.status(500).json({
        message: "Internal Server Error",
        errors: [],
      });

    default:
      console.error("An unknown non-error was thrown");
      console.error(err);
      return res.status(500).json({
        message: "Internal Server Error",
        errors: [],
      });
  }
};
