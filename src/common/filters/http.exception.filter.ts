import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let details: any = null;

    // Handle TypeORM EntityNotFoundError
    if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = exception.message;
    }
    // Handle TypeORM QueryFailedError (e.g. database constraints, unique keys)
    else if (exception instanceof QueryFailedError) {
      const driverError = exception.driverError;
      // PostgreSQL unique constraint violation error code is 23505
      if (driverError && driverError.code === '23505') {
        status = HttpStatus.CONFLICT;
        message = 'A record with this unique identifier already exists.';
        details = driverError.detail;
      } else {
        status = HttpStatus.BAD_REQUEST;
        message = 'Database query operation failed.';
        if (process.env.NODE_ENV !== 'production') {
          details = exception.message;
        }
      }
    }
    // Handle standard NestJS HttpExceptions
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        message = (res as any).message || exception.message;
        details = (res as any).error || null;
      } else {
        message = exception.message;
      }
    }
    // Handle generic error
    else if (exception instanceof Error) {
      if (process.env.NODE_ENV !== 'production') {
        message = exception.message;
        details = exception.stack;
      }
    }

    // Log the exception
    const requestInfo = `${request.method} ${request.url}`;
    if (status >= 500) {
      this.logger.error(
        `Unhandled Exception on ${requestInfo}: ${exception instanceof Error ? exception.message : exception}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`Client Error on ${requestInfo} -> Status ${status}: ${Array.isArray(message) ? message.join(', ') : message}`);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: Array.isArray(message) ? message[0] : message,
      errors: Array.isArray(message) ? message : (details ? [details] : undefined),
    });
  }
}
