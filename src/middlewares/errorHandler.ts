import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
      },
    });
    return;
  }

  // Handle MySQL errors
  if (err.message && err.message.includes('ER_DUP_ENTRY')) {
    res.status(409).json({
      success: false,
      error: {
        message: 'A record with these details already exists.',
      },
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: {
      message: 'An unexpected error occurred',
    },
  });
};