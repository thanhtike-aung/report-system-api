import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors/AppError';

export const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessages = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));

    throw new ValidationError('Validation failed: ' + errorMessages.map(e => `${e.field}: ${e.message}`).join(', '));
  };
};