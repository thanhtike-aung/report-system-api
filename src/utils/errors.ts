import { STATUS_CODES } from "../constants/messages";

export const createError = (message: string, statusCode: number) => ({
  message,
  statusCode,
});

export const ValidationError = (message = "Invalid request data") =>
  createError(message, STATUS_CODES.BAD_REQUEST);
export const NotFoundError = (message = "Resource not found") =>
  createError(message, STATUS_CODES.NOT_FOUND);
export const InternalServerError = (message = "Internal server error") =>
  createError(message, STATUS_CODES.SERVER_ERROR);
