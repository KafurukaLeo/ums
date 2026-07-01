/**
 * Module components file: enrollments.controller.ts.
 */
import { Response } from 'express';
import { enrollmentsService } from './enrollments.service';
import { ForbiddenException } from '../../common/exceptions/http.exception';
import { asyncHandler } from '../../common/utils/async.util';

/**
 * Controller to handle all Course Enrollment requests.
 * Manages student course registrations, registration listings, details, updates, and cancellations.
 */
export class EnrollmentsController {
  
  /**
   * Fetch all course enrollments.
   * - Admins/Lecturers can view all enrollment records.
   * - Students are filtered to only see their own course enrollments.
   */
  findAll = asyncHandler(async (req: any, res: Response) => {
    const enrollments = await enrollmentsService.findAll();
    if (req.user.role === 'student') {
      return enrollments.filter(e => e.studentId === req.user.studentId);
    }
    return enrollments;
  });

  /**
   * Fetch details of a single enrollment record by ID.
   * - Students can only view their own enrollment records.
   */
  findOne = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const enrollment = await enrollmentsService.findOne(id);
    
    // Authorization check
    if (req.user.role === 'student' && enrollment.studentId !== req.user.studentId) {
      throw new ForbiddenException('You can only view your own enrollment record');
    }
    return enrollment;
  });

  /**
   * Enroll a student in a course.
   * - Students are restricted to only enrolling themselves.
   */
  create = asyncHandler(async (req: any, res: Response) => {
    const data = req.body;
    
    // Ensure student cannot enroll someone else
    if (req.user.role === 'student' && req.user.studentId !== data.studentId) {
      throw new ForbiddenException('You can only enroll yourself in courses');
    }
    const result = await enrollmentsService.create(data);
    return result;
  });

  /**
   * Update enrollment record by ID.
   * Admin-only permission.
   */
  update = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const result = await enrollmentsService.update(id, req.body);
    return result;
  });

  /**
   * Cancel/Remove an enrollment by ID.
   */
  remove = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    await enrollmentsService.remove(id);
    return null;
  });
}

// Export singleton instance of EnrollmentsController
export const enrollmentsController = new EnrollmentsController();
