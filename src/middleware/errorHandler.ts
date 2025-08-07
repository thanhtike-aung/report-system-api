import { ErrorRequestHandler } from 'express';
import { AppError } from '../utils/errors/AppError';
import { ApiResponse } from '../utils/response/ApiResponse';
import { config } from '../config';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(
      ApiResponse.error(err.message, err.statusCode.toString())
    );
    return;
  }

  console.error('Unhandled error:', err);

  const message = config.env === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(500).json(
    ApiResponse.error(message, '500', config.env === 'development' ? err.stack : undefined)
  );
};