/**
 * Module components file: attendance.controller.ts.
 */
import { Response } from 'express';
import { attendanceService } from './attendance.service';
import { enrollmentsService } from '../enrollments/enrollments.service';
import { ForbiddenException } from '../../common/exceptions/http.exception';
import { asyncHandler } from '../../common/utils/async.util';

/**
 * Controller class to handle all HTTP requests related to Attendance.
 * Uses vanilla TypeScript and Express handler patterns wrapped in an async utility.
 */
export class AttendanceController {
  
  /**
   * Fetch all attendance records.
   * - Admins/Lecturers can view all records.
   * - Students are restricted to viewing only their own attendance records.
   */
  findAll = asyncHandler(async (req: any, res: Response) => {
    // Retrieve all records from the database
    const records = await attendanceService.findAll();
    
    // If the requesting user is a student, filter out other students' attendance records
    if (req.user.role === 'student') {
      // Find all enrollments belonging to the student
      const studentEnrollments = await enrollmentsService.findAll();
      const myEnrollmentIds = studentEnrollments
        .filter(e => e.studentId === req.user.studentId)
        .map(e => e.id);
      
      // Filter attendance records to only include those matching the student's enrollments
      return records.filter(r => myEnrollmentIds.includes(r.enrollmentId));
    }
    
    // For Admins and Lecturers, return all records
    return records;
  });

  /**
   * Fetch a single attendance record by its primary key ID.
   * - Students can only access the record if it belongs to one of their enrollments.
   */
  findOne = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const record = await attendanceService.findOne(id);
    
    // If the requesting user is a student, perform permission check
    if (req.user.role === 'student') {
      const enrollment = await enrollmentsService.findOne(record.enrollmentId);
      // Throw 403 Forbidden if the student tries to view someone else's record
      if (enrollment.studentId !== req.user.studentId) {
        throw new ForbiddenException('You can only view your own attendance records');
      }
    }
    
    return record;
  });

  /**
   * Create a new attendance record.
   * - Students can only record attendance (e.g., check-in) for their own course enrollments.
   */
  create = asyncHandler(async (req: any, res: Response) => {
    const data = req.body;
    
    // If a student is recording attendance, make sure they own the enrollment
    if (req.user.role === 'student') {
      const enrollment = await enrollmentsService.findOne(data.enrollmentId);
      // Validate that the enrollment matches the student's ID
      if (enrollment.studentId !== req.user.studentId) {
        throw new ForbiddenException('You can only check in to your own enrollments');
      }
    }
    
    // Save and return the new attendance record
    const result = await attendanceService.create(data);
    return result;
  });

  /**
   * Update an existing attendance record by ID.
   */
  update = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const result = await attendanceService.update(id, req.body);
    return result;
  });

  /**
   * Delete an attendance record by ID.
   */
  remove = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    await attendanceService.remove(id);
    return null; // Return null to indicate successful deletion with no body
  });
}

// Export a singleton instance of the controller
export const attendanceController = new AttendanceController();
