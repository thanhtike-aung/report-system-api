import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { AppError } from "../utils/errors";
import { createErrorResponse } from "../types/common/apiResponse";
import { STATUS_CODES, MESSAGE } from "../constants/messages";

export const errorHandler: ErrorRequestHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error("Error occurred:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Handle AppError instances
  if (error instanceof AppError) {
    const errorResponse = createErrorResponse(
      error.message,
      error.statusCode,
      error.details,
    );
    res.status(error.statusCode).json(errorResponse);
    return;
  }

  // Handle known error patterns
  if (error.message.includes("JWT")) {
    const errorResponse = createErrorResponse(
      MESSAGE.ERROR.INVALID_TOKEN,
      STATUS_CODES.UNAUTHORIZED,
    );
    res.status(STATUS_CODES.UNAUTHORIZED).json(errorResponse);
    return;
  }

  // Handle Prisma errors
  if (error.message.includes("Unique constraint")) {
    const errorResponse = createErrorResponse(
      "Resource already exists",
      STATUS_CODES.BAD_REQUEST,
    );
    res.status(STATUS_CODES.BAD_REQUEST).json(errorResponse);
    return;
  }

  // Handle validation errors
  if (
    error.message.includes("validation") ||
    error.message.includes("required")
  ) {
    const errorResponse = createErrorResponse(
      MESSAGE.ERROR.INVALID_INPUT,
      STATUS_CODES.BAD_REQUEST,
    );
    res.status(STATUS_CODES.BAD_REQUEST).json(errorResponse);
    return;
  }

  // Default server error
  const errorResponse = createErrorResponse(
    MESSAGE.ERROR.SERVER_ERROR,
    STATUS_CODES.SERVER_ERROR,
  );
  res.status(STATUS_CODES.SERVER_ERROR).json(errorResponse);
};

// Async error wrapper to catch async errors
export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
