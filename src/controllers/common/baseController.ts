import { Request, Response, NextFunction } from "express";
import { createSuccessResponse, createErrorResponse } from "../../types/common/apiResponse";
import { AppError, InternalServerError } from "../../utils/errors";
import { STATUS_CODES, MESSAGE } from "../../constants/messages";

export abstract class BaseController {
  /**
   * Wrapper method to handle async operations and standardize responses
   */
  protected async handleRequest(
    req: Request,
    res: Response,
    next: NextFunction,
    operation: () => Promise<any>,
    successMessage?: string,
    successStatusCode: number = STATUS_CODES.OK
  ): Promise<void> {
    try {
      const result = await operation();
      
      if (result && typeof result === 'object' && 'status' in result) {
        // Handle service responses that return status objects
        if (result.status !== STATUS_CODES.OK && result.status !== STATUS_CODES.CREATED) {
          const errorResponse = createErrorResponse(
            result.message || "Operation failed",
            result.status
          );
          res.status(result.status).json(errorResponse);
          return;
        }
        
        // Success response from service
        const response = createSuccessResponse(
          result.data || result.token || result,
          result.message || successMessage,
          result.status || successStatusCode
        );
        res.status(result.status || successStatusCode).json(response);
        return;
      }
      
      // Direct data response
      const response = createSuccessResponse(
        result,
        successMessage,
        successStatusCode
      );
      res.status(successStatusCode).json(response);
      
    } catch (error) {
      console.error("Controller error:", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
      });

      if (error instanceof AppError) {
        next(error);
      } else {
        next(new InternalServerError(MESSAGE.ERROR.SERVER_ERROR));
      }
    }
  }

  /**
   * Handle requests that should return no content (204)
   */
  protected async handleNoContentRequest(
    req: Request,
    res: Response,
    next: NextFunction,
    operation: () => Promise<any>
  ): Promise<void> {
    try {
      await operation();
      res.status(STATUS_CODES.NO_CONTENT).send();
    } catch (error) {
      console.error("Controller error:", error);
      
      if (error instanceof AppError) {
        next(error);
      } else {
        next(new InternalServerError(MESSAGE.ERROR.SERVER_ERROR));
      }
    }
  }

  /**
   * Extract numeric ID from request parameters
   */
  protected getIdFromParams(req: Request, paramName: string = 'id'): number {
    const id = Number(req.params[paramName]);
    if (isNaN(id) || id <= 0) {
      throw new AppError(`Invalid ${paramName}`, STATUS_CODES.BAD_REQUEST);
    }
    return id;
  }

  /**
   * Extract query parameters with default values
   */
  protected getQueryParams(req: Request, defaults: { [key: string]: any } = {}) {
    return { ...defaults, ...req.query };
  }

  /**
   * Validate request body is not empty
   */
  protected validateRequestBody(req: Request): void {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new AppError("Request body is required", STATUS_CODES.BAD_REQUEST);
    }
  }
}
