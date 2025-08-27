import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const startTime = Date.now();

  // Log the incoming request
  logger.debug(`Incoming ${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    body: req.method !== "GET" ? req.body : undefined,
  });

  // Capture response completion
  res.on("finish", () => {
    const duration = Date.now() - startTime;

    // Log the response
    logger.request(req.method, req.url, res.statusCode, duration);

    if (res.statusCode >= 400) {
      logger.warn(`Request failed`, {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
      });
    }
  });

  next();
};
