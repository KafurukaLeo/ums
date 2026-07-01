/**
 * Module components file: error.middleware.ts.
 */
import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/http.exception';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';

/**
 * Global Express Exception Handling Middleware.
 * Catches all thrown exceptions from async route handlers.
 * - Handles custom HTTPExceptions.
 * - Handles TypeORM database errors (EntityNotFoundError, QueryFailedError).
 * - Maps database constraint violations (e.g. duplicate key code 23505) to HTTP 409 Conflict.
 * - Hides stack traces and sensitive error details in production environments.
 * - Logs server errors using console.error and warnings using console.warn.
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  let status = 500;
  let message = 'Internal server error';
  let details: any = null;

  // Map exception types to HTTP status codes
  if (err instanceof HttpException) {
    status = err.status;
    message = err.message;
  } else if (err instanceof EntityNotFoundError) {
    status = 404;
    message = err.message;
  } else if (err instanceof QueryFailedError) {
    const driverError = err.driverError;
    // Map Postgres unique constraint violations to HTTP 409
    if (driverError && driverError.code === '23505') {
      status = 409;
      message = 'A record with this unique identifier already exists.';
      details = driverError.detail;
    } else {
      status = 400;
      message = 'Database query operation failed.';
      if (process.env.NODE_ENV !== 'production') {
        details = err.message;
      }
    }
  } else if (err instanceof Error) {
    if (process.env.NODE_ENV !== 'production') {
      message = err.message;
      details = err.stack;
    }
  }

  // Log diagnostic info to standard stream channels
  const requestInfo = `${req.method} ${req.originalUrl}`;
  if (status >= 500) {
    console.error(`Unhandled Exception on ${requestInfo}: ${err.message}`, err.stack);
  } else {
    console.warn(`Client Error on ${requestInfo} -> Status ${status}: ${message}`);
  }

  // Send formatted error JSON response payload
  res.status(status).json({
    success: false,
    statusCode: status,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    message,
    errors: details ? [details] : undefined,
  });
}
