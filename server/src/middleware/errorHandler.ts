/**
 * Global error handler.
 * Catches unhandled errors and returns a consistent API envelope.
 */
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      data: null,
      errors: [{ code: err.code, message: err.message, field: err.field }],
    });
    return;
  }

  // Auth0 JWT errors
  if (err.name === 'UnauthorizedError' || err.name === 'InvalidTokenError') {
    res.status(401).json({
      data: null,
      errors: [{ code: 'UNAUTHORIZED', message: 'Invalid or expired token' }],
    });
    return;
  }

  console.error('Unhandled error:', err);

  res.status(500).json({
    data: null,
    errors: [{
      code: 'INTERNAL_ERROR',
      message: config.isDev ? err.message : 'An unexpected error occurred',
    }],
  });
}
