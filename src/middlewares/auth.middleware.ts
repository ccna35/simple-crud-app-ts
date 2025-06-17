import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/error";

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        // Add other properties you want to include in the token payload
      };
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from headers
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authorization token required", 401);
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );

    // Add user data to request object
    req.user = decoded as { id: string; username: string };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError("Invalid authentication token", 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError("Authentication token expired", 401));
    } else {
      next(error);
    }
  }
};

// Optional middleware for routes that need authorization by user ID
export const authorizeUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if requested resource belongs to authenticated user
    if (req.user?.id != req.params.id) {
      throw new AppError("Unauthorized to access this resource", 403);
    }
    next();
  } catch (error) {
    next(error);
  }
};
