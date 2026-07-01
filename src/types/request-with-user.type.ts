/**
 * Custom global TypeScript type definitions.
 */
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    id: number;
    email: string;
    role: string;
    studentId?: number;
    lecturerId?: number;
  };
}
