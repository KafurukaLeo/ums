import { Response } from 'express';
import { coursesService } from './courses.service';
import { ForbiddenException } from '../../common/exceptions/http.exception';
import { asyncHandler } from '../../common/utils/async.util';

/**
 * Controller class to handle all HTTP requests related to courses.
 * Manages course listings, course creation, allocation of lecturers to courses, and course deletions.
 */
export class CoursesController {
  
  /**
   * Fetch all courses in the system.
   * Accessible by Admins, Lecturers, and Students.
   */
  findAll = asyncHandler(async (req: any, res: Response) => {
    const result = await coursesService.findAll();
    return result;
  });

  /**
   * Fetch a single course by its ID.
   */
  findOne = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const result = await coursesService.findOne(id);
    return result;
  });

  /**
   * Create a new course record.
   * Admin-only permission.
   */
  create = asyncHandler(async (req: any, res: Response) => {
    const result = await coursesService.create(req.body);
    return result;
  });

  /**
   * Update an existing course's details.
   * - Admins can update any course details.
   * - Lecturers can only update details of courses assigned to them.
   */
  update = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    
    // Check permission: lecturers can only update their own assigned courses
    if (req.user.role !== 'admin') {
      const course = await coursesService.findOne(id);
      if (course.lecturerId !== req.user.lecturerId) {
        throw new ForbiddenException('You can only update courses assigned to you');
      }
    }
    const result = await coursesService.update(id, req.body);
    return result;
  });

  /**
   * Allocate a lecturer to teach a course.
   * Admin-only permission.
   */
  allocate = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const lecturerId = parseInt(req.body.lecturerId, 10);
    const result = await coursesService.update(id, { lecturerId });
    return result;
  });

  /**
   * Delete a course by its ID.
   * Admin-only permission.
   */
  remove = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    await coursesService.remove(id);
    return null;
  });
}

// Export singleton instance of CoursesController
export const coursesController = new CoursesController();
