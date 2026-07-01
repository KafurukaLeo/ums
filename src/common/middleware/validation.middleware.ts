/**
 * Module components file: validation.middleware.ts.
 */
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Higher-Order Middleware factory for Request Body DTO Validation.
 * - Converts raw express request body to class-transformer instances of given type `T`.
 * - Validates properties using class-validator annotations.
 * - If constraint violations are found, returns HTTP 400 Bad Request listing all messages.
 * - If successful, replaces `req.body` with validated instance and passes control to next handler.
 */
export function validationMiddleware<T>(type: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Transform request body object into class instance
    const input = plainToInstance(type, req.body);
    
    // Execute validation checks
    const errors = await validate(input);
    if (errors.length > 0) {
      // Flatten all validation constraint messages
      const messages = errors.map(error => Object.values(error.constraints || {})).flat();
      return res.status(400).json({
        success: false,
        statusCode: 400,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        message: messages[0] || 'Validation failed',
        errors: messages,
      });
    }

    // Set body to validated class instance
    req.body = input;
    next();
  };
}
