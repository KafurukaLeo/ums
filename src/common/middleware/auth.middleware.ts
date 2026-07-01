import { Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UnauthorizedException, ForbiddenException } from '../exceptions/http.exception';

// A middleware that checks if an access token is present, verifies it, and attaches user to request
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

// A middleware that checks if a refresh token is present, verifies it, and attaches user to request
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

// Middleware that optionally decodes token if present, but doesn't throw if not present
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
      // ignore
    }
  }
  next();
};

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
