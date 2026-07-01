import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';

export function validationMiddleware<T>(type: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const input = plainToInstance(type, req.body);
    const errors = await validate(input);
    if (errors.length > 0) {
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
    req.body = input;
    next();
  };
}
