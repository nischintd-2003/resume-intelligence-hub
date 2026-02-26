import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { logger } from '@resume-hub/logger';
import { UniqueConstraintError, ValidationError as SequelizeValidationError } from 'sequelize';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`[API Error] ${err.name}: ${err.message}`, { stack: err.stack });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid input data',
      errors: err.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({
      status: 'fail',
      message: 'Duplicate entry detected',
      errors: err.errors.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  if (err instanceof SequelizeValidationError) {
    return res.status(400).json({
      status: 'fail',
      message: 'Database validation failed',
      errors: err.errors.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};
