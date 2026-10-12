import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { MongoNetworkError, MongoNotConnectedError, MongoServerSelectionError } from 'mongodb';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation Error',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  if (
    err instanceof MongoNetworkError ||
    err instanceof MongoServerSelectionError ||
    err instanceof MongoNotConnectedError
  ) {
    res.status(503).json({
      error: 'Service temporarily unavailable',
      message: 'The database is temporarily unavailable. Please try again shortly.',
    });
    return;
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = statusCode >= 500 ? 'An unexpected server error occurred.' : err.message || 'Request failed.';

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[API Error] ${statusCode} - ${message}`, err.stack);
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
