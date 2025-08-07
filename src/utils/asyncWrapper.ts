import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errors/ApiError';
import { STATUS_CODES, MESSAGE } from '../constants/messages';

type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncWrapper = (fn: AsyncFunction) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await fn(req, res, next);
      if (!res.headersSent && result !== undefined) {
        res.status(STATUS_CODES.OK).json(result);
      }
    } catch (error) {
      console.error(error);
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(STATUS_CODES.SERVER_ERROR).json({ 
          message: MESSAGE.ERROR.SERVER_ERROR 
        });
      }
    }
  };
};