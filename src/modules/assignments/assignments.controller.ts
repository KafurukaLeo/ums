import { Response } from 'express';
import { assignmentsService } from './assignments.service';
import { coursesService } from '../courses/courses.service';
import { ForbiddenException } from '../../common/exceptions/http.exception';
import { asyncHandler } from '../../common/utils/async.util';

/**
 * Controller class to handle all HTTP requests related to assignments.
 * Contains methods to fetch, create, update, delete, submit, and grade assignments.
 */
export class AssignmentsController {
  
  /**
   * Fetch all assignments.
   * Accessible by Admins, Lecturers, and Students.
   */
  findAll = asyncHandler(async (req: any, res: Response) => {
    const result = await assignmentsService.findAll();
    return result;
  });

  /**
   * Fetch all assignments associated with a specific course.
   */
  findByCourse = asyncHandler(async (req: any, res: Response) => {
    const courseId = parseInt(req.params.courseId, 10);
    const result = await assignmentsService.findByCourse(courseId);
    return result;
  });

  /**
   * Fetch details of a single assignment by its ID.
   */
  findOne = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const result = await assignmentsService.findOne(id);
    return result;
  });

  /**
   * Create a new assignment.
   * - Admins can create assignments for any course.
   * - Lecturers can only create assignments for courses they are assigned to teach.
   */
  create = asyncHandler(async (req: any, res: Response) => {
    const dto = req.body;
    
    // Authorization check: If not admin, the lecturer must teach the course
    if (req.user.role !== 'admin') {
      const course = await coursesService.findOne(dto.courseId);
      if (course.lecturerId !== req.user.lecturerId) {
        throw new ForbiddenException('You can only create assignments for courses assigned to you');
      }
    }
    
    const result = await assignmentsService.create(dto);
    return result;
  });

  /**
   * Update details of an assignment.
   * - Admins can update any assignment.
   * - Lecturers can only update assignments for courses they are assigned to teach.
   */
  update = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const dto = req.body;
    
    // Authorization check: If not admin, verify ownership
    if (req.user.role !== 'admin') {
      const assignment = await assignmentsService.findOne(id);
      const course = await coursesService.findOne(assignment.courseId);
      if (course.lecturerId !== req.user.lecturerId) {
        throw new ForbiddenException('You can only update assignments for courses assigned to you');
      }
    }
    
    const result = await assignmentsService.update(id, dto);
    return result;
  });

  /**
   * Delete an assignment by ID.
   * - Admin only permission.
   */
  remove = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    await assignmentsService.remove(id);
    return null;
  });

  /**
   * Submit homework/assignment response.
   * - Students can only submit on behalf of their own student profile.
   */
  submit = asyncHandler(async (req: any, res: Response) => {
    const assignmentId = parseInt(req.params.id, 10);
    const dto = req.body;
    
    // Security check: Ensure student isn't submitting for another student ID
    if (req.user.role === 'student' && req.user.studentId !== dto.studentId) {
      throw new ForbiddenException('You can only submit assignments for yourself');
    }
    
    const result = await assignmentsService.submitAssignment(assignmentId, dto);
    return result;
  });

  /**
   * Get all submissions submitted for a specific assignment.
   * - Restrict access to Admins and Lecturers.
   */
  getSubmissions = asyncHandler(async (req: any, res: Response) => {
    const assignmentId = parseInt(req.params.id, 10);
    const result = await assignmentsService.getSubmissions(assignmentId);
    return result;
  });

  /**
   * Get all submissions from a specific student.
   * - Students can only view their own submissions list.
   * - Admins and Lecturers can view any student's submissions list.
   */
  getStudentSubmissions = asyncHandler(async (req: any, res: Response) => {
    const studentId = parseInt(req.params.studentId, 10);
    
    // Security check for student role
    if (req.user.role === 'student' && req.user.studentId !== studentId) {
      throw new ForbiddenException('You can only view your own submissions');
    }
    
    const result = await assignmentsService.getStudentSubmissions(studentId);
    return result;
  });

  /**
   * Grade a student's submission.
   * - Admins can grade any submission.
   * - Lecturers can only grade submissions for courses they teach.
   */
  gradeSubmission = asyncHandler(async (req: any, res: Response) => {
    const submissionId = parseInt(req.params.submissionId, 10);
    const dto = req.body;
    
    // Authorization check for lecturers
    if (req.user.role !== 'admin') {
      const submission = await assignmentsService.findSubmission(submissionId);
      const assignment = await assignmentsService.findOne(submission.assignmentId);
      const course = await coursesService.findOne(assignment.courseId);
      if (course.lecturerId !== req.user.lecturerId) {
        throw new ForbiddenException('You can only grade submissions for courses assigned to you');
      }
    }
    
    const result = await assignmentsService.gradeSubmission(submissionId, dto);
    return result;
  });
}

// Export singleton instance
export const assignmentsController = new AssignmentsController();
