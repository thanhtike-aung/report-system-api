import { STATUS_CODES } from "../constants/messages";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = STATUS_CODES.SERVER_ERROR,
    isOperational: boolean = true,
    details?: any,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Invalid request data", details?: any) {
    super(message, STATUS_CODES.BAD_REQUEST, true, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, STATUS_CODES.NOT_FOUND);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized access") {
    super(message, STATUS_CODES.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden access") {
    super(message, STATUS_CODES.FORBIDDEN);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error", details?: any) {
    super(message, STATUS_CODES.SERVER_ERROR, true, details);
  }
}

// Legacy functions for backward compatibility
export const createError = (message: string, statusCode: number) => ({
  message,
  statusCode,
});
