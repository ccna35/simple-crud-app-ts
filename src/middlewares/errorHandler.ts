import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";
import logger from "../utils/logger";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error
  logger.error(`Error: ${err.message}`, {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method
    }
  });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message
      }
    });
    return;
  }

  // Handle MySQL errors
  if (err.message && err.message.includes("ER_DUP_ENTRY")) {
    res.status(409).json({
      success: false,
      error: {
        message: "A record with these details already exists."
      }
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: {
      message: "An unexpected error occurred"
    }
  });
};
