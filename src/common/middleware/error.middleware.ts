import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/http.exception';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  let status = 500;
  let message = 'Internal server error';
  let details: any = null;

  if (err instanceof HttpException) {
    status = err.status;
    message = err.message;
  } else if (err instanceof EntityNotFoundError) {
    status = 404;
    message = err.message;
  } else if (err instanceof QueryFailedError) {
    const driverError = err.driverError;
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

  const requestInfo = `${req.method} ${req.originalUrl}`;
  if (status >= 500) {
    console.error(`Unhandled Exception on ${requestInfo}: ${err.message}`, err.stack);
  } else {
    console.warn(`Client Error on ${requestInfo} -> Status ${status}: ${message}`);
  }

  res.status(status).json({
    success: false,
    statusCode: status,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    message,
    errors: details ? [details] : undefined,
  });
}
