/**
 * Zod request validation middleware — Spec Section 9.2
 * Validates request body, query, and params against Zod schemas.
 */
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as Record<string, string>;
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          data: null,
          errors: err.errors.map((e) => ({
            code: 'VALIDATION_ERROR',
            message: e.message,
            field: e.path.join('.'),
          })),
        });
        return;
      }
      next(err);
    }
  };
}
