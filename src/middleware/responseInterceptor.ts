import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/response/ApiResponse';

export const responseInterceptor = (req: Request, res: Response, next: NextFunction) => {
  // Store the original res.json function
  const originalJson = res.json;

  // Override res.json to ensure all responses follow our standard structure
  res.json = function (body: any): Response {
    // If the response is already in our standard format, send it as is
    if (body && (body.success !== undefined)) {
      return originalJson.call(this, body);
    }

    // Otherwise, wrap it in our standard response format
    return originalJson.call(this, ApiResponse.success(body));
  };

  next();
};