/**
 * Module components file: auth.middleware.ts.
 */
import { Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UnauthorizedException, ForbiddenException } from '../exceptions/http.exception';

/**
 * Middleware that checks if a valid Access JWT is present in the Authorization header.
 * - Format: 'Bearer <token>'.
 * - If valid, decodes the token and attaches user properties (`id`, `email`, `role`, `studentId`, `lecturerId`) to `req.user`.
 * - If missing or invalid, throws an UnauthorizedException.
 */
export const authenticateJwt = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedException('Authentication credentials missing or invalid'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'super-secret-key';
    const payload = jwt.verify(token, secret) as any;
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      studentId: payload.studentId,
      lecturerId: payload.lecturerId,
    };
    next();
  } catch (err) {
    next(new UnauthorizedException('Authentication credentials missing or invalid'));
  }
};

/**
 * Middleware that checks if a valid Refresh JWT is present in the Authorization header.
 * - Extracts and decodes verification payload.
 * - Attaches parsed user details and raw token value to `req.user`.
 */
export const authenticateRefreshJwt = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedException('Authentication credentials missing or invalid'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_REFRESH_SECRET || 'super-refresh-secret-key';
    const payload = jwt.verify(token, secret) as any;
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      studentId: payload.studentId,
      lecturerId: payload.lecturerId,
      refreshToken: token,
    };
    next();
  } catch (err) {
    next(new UnauthorizedException('Authentication credentials missing or invalid'));
  }
};

/**
 * Middleware that optionally decodes token if present in headers.
 * Does not block/throw if the token is missing or invalid.
 */
export const optionalJwt = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const secret = process.env.JWT_SECRET || 'super-secret-key';
      const payload = jwt.verify(token, secret) as any;
      req.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        studentId: payload.studentId,
        lecturerId: payload.lecturerId,
      };
    } catch (err) {
      // Ignore validation error and proceed anonymously
    }
  }
  next();
};

/**
 * Route Guard Middleware to restrict access based on User Role.
 * - Checks if `req.user` is defined (requires `authenticateJwt` to be run first).
 * - Matches user role against allowed list.
 * - Throws ForbiddenException if role is not authorized.
 */
export const requireRoles = (...roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedException('Authentication credentials missing or invalid'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenException('Forbidden resource'));
    }
    next();
  };
};
