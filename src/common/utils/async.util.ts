/**
 * Common utility helpers and service wrappers.
 */
import { Request, Response, NextFunction } from 'express';

export const asyncHandler = (fn: (req: any, res: Response, next: NextFunction) => any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await fn(req, res, next);
      if (res.headersSent) {
        return;
      }
      const status = req.method === 'POST' ? 201 : 200;
      if (result === undefined) {
        return res.status(status).json(null);
      }
      return res.status(status).json(result);
    } catch (error) {
      next(error);
    }
  };
};
