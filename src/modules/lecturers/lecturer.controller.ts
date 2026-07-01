import { Response } from 'express';
import { lecturerService } from './lecturer.service';
import { coursesService } from '../courses/courses.service';
import { ForbiddenException } from '../../common/exceptions/http.exception';
import { asyncHandler } from '../../common/utils/async.util';

/**
 * Controller to handle all HTTP requests related to Lecturer profiles.
 * Manages operations to list profiles, view profiles, update information, and look up course assignments.
 */
export class LecturerController {
  
  /**
   * Fetch all lecturer profiles.
   */
  findAll = asyncHandler(async (req: any, res: Response) => {
    const result = await lecturerService.findAll();
    return result;
  });

  /**
   * Fetch a single lecturer profile by ID.
   */
  findOne = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const result = await lecturerService.findOne(id);
    return result;
  });

  /**
   * Register a new lecturer profile.
   * Admin-only permission.
   */
  create = asyncHandler(async (req: any, res: Response) => {
    const result = await lecturerService.create(req.body);
    return result;
  });

  /**
   * Update lecturer profile details.
   * - Lecturers can only update their own profile details.
   * - Admins can update any profile.
   */
  update = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    
    // Authorization check
    if (req.user.role !== 'admin') {
      const lecturer = await lecturerService.findOne(id);
      if (!lecturer || lecturer.email !== req.user.email) {
        throw new ForbiddenException('You can only update your own lecturer profile');
      }
    }
    const result = await lecturerService.update(id, req.body);
    return result;
  });

  /**
   * Retrieve all courses taught/assigned to a specific lecturer.
   * - Lecturers can only view their own courses.
   * - Admins can query any lecturer.
   */
  getAssignedCourses = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    
    // Authorization check
    if (req.user.role !== 'admin') {
      const lecturer = await lecturerService.findOne(id);
      if (!lecturer || lecturer.email !== req.user.email) {
        throw new ForbiddenException('You can only view your own assigned courses');
      }
    }
    await lecturerService.findOne(id);
    const result = await coursesService.findAssignedCourses(id);
    return result;
  });

  /**
   * Delete a lecturer profile by ID.
   * Admin-only permission.
   */
  remove = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    await lecturerService.remove(id);
    return null;
  });
}

// Export singleton instance of LecturerController
export const lecturerController = new LecturerController();