import { Response } from 'express';
import { gradesService } from './grades.service';
import { enrollmentsService } from '../enrollments/enrollments.service';
import { ForbiddenException } from '../../common/exceptions/http.exception';
import { asyncHandler } from '../../common/utils/async.util';

/**
 * Controller to handle Grade reporting endpoints.
 * Manages final course grade submissions, student transcript GPAs, and lookup permissions.
 */
export class GradesController {
  
  /**
   * Fetch all grade records.
   * - Students can only see grade records matching their own enrollments.
   * - Admins and Lecturers can view all grade records.
   */
  findAll = asyncHandler(async (req: any, res: Response) => {
    const grades = await gradesService.findAll();
    
    // Filter grades for student profiles
    if (req.user.role === 'student') {
      const studentEnrollments = await enrollmentsService.findAll();
      const myEnrollmentIds = studentEnrollments
        .filter(e => e.studentId === req.user.studentId)
        .map(e => e.id);
      return grades.filter(g => myEnrollmentIds.includes(g.enrollmentId));
    }
    return grades;
  });

  /**
   * Fetch a single grade record by ID.
   * - Students can only access the grade if it belongs to their enrollment.
   */
  findOne = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const grade = await gradesService.findOne(id);
    
    // Authorization check for student role
    if (req.user.role === 'student') {
      const enrollment = await enrollmentsService.findOne(grade.enrollmentId);
      if (enrollment.studentId !== req.user.studentId) {
        throw new ForbiddenException('You can only view your own grades');
      }
    }
    return grade;
  });

  /**
   * Submit/Record a course grade.
   * Lecturer/Admin permission.
   */
  create = asyncHandler(async (req: any, res: Response) => {
    const result = await gradesService.create(req.body);
    return result;
  });

  /**
   * Update an existing grade record by ID.
   * Lecturer/Admin permission.
   */
  update = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const result = await gradesService.update(id, req.body);
    return result;
  });

  /**
   * Delete a grade record.
   * Admin-only permission.
   */
  remove = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    await gradesService.remove(id);
    return null;
  });
}

// Export singleton instance of GradesController
export const gradesController = new GradesController();
