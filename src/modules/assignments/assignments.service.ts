import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { AssignmentSubmission } from './entities/assignment-submission.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';

/**
 * AssignmentsService handles all business logic for assignments and submissions.
 * - Lecturers can create, update, and delete assignments.
 * - Students can view assignments and submit their work.
 * - Lecturers can view all submissions and grade them.
 */
@Injectable()
export class AssignmentsService {
  constructor(
    // Inject the repository for the Assignment entity (for CRUD on 'assignments' table)
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,

    // Inject the repository for the AssignmentSubmission entity (for CRUD on 'assignment_submissions' table)
    @InjectRepository(AssignmentSubmission)
    private readonly submissionRepository: Repository<AssignmentSubmission>,
  ) {}

  // ─── ASSIGNMENT CRUD ────────────────────────────────────────────────────────

  /**
   * Returns all assignments (visible to all authenticated users).
   * Students can see what assignments exist across courses.
   */
  findAll(): Promise<Assignment[]> {
    return this.assignmentRepository.find({ order: { createdAt: 'DESC' } });
  }

  /**
   * Returns all assignments for a specific course.
   * Useful when a student/lecturer wants to see assignments for their course.
   */
  findByCourse(courseId: number): Promise<Assignment[]> {
    return this.assignmentRepository.find({
      where: { courseId },
      order: { dueDate: 'ASC' }, // Ordered by due date so closest deadline appears first
    });
  }

  /**
   * Returns a single assignment by its ID.
   * Throws a 404 NotFoundException if the assignment does not exist.
   */
  async findOne(id: number): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findOneBy({ id });
    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }
    return assignment;
  }

  /**
   * Creates a new assignment — called by lecturers only (enforced at controller level).
   * Converts the dueDate string to a Date object before saving.
   */
  create(dto: CreateAssignmentDto): Promise<Assignment> {
    const assignment = this.assignmentRepository.create({
      ...dto,
      // Parse ISO date string to a JavaScript Date object
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    });
    return this.assignmentRepository.save(assignment);
  }

  /**
   * Updates an existing assignment — called by lecturers/admins only.
   * Returns the updated assignment record.
   */
  async update(id: number, dto: UpdateAssignmentDto): Promise<Assignment> {
    const updateData: any = { ...dto };
    // Convert dueDate string to Date if provided
    if (dto.dueDate) {
      updateData.dueDate = new Date(dto.dueDate);
    }
    await this.assignmentRepository.update(id, updateData);
    return this.findOne(id); // Return the fresh record from DB
  }

  /**
   * Deletes an assignment by ID — only admins and the creating lecturer should do this.
   * Also cleans up associated submissions.
   */
  async remove(id: number): Promise<void> {
    const result = await this.assignmentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }
  }

  // ─── SUBMISSIONS ────────────────────────────────────────────────────────────

  /**
   * Returns all submissions for a specific assignment.
   * Used by lecturers to review what students have submitted.
   */
  getSubmissions(assignmentId: number): Promise<AssignmentSubmission[]> {
    return this.submissionRepository.find({
      where: { assignmentId },
      order: { submittedAt: 'DESC' },
    });
  }

  /**
   * Returns all submissions made by a specific student.
   * Used by a student to view their own submitted work.
   */
  getStudentSubmissions(studentId: number): Promise<AssignmentSubmission[]> {
    return this.submissionRepository.find({
      where: { studentId },
      order: { submittedAt: 'DESC' },
    });
  }

  /**
   * Allows a student to submit their work for an assignment.
   * Checks that the assignment exists before creating the submission.
   */
  async submitAssignment(
    assignmentId: number,
    dto: SubmitAssignmentDto,
  ): Promise<AssignmentSubmission> {
    // Verify the assignment exists — throws 404 if not found
    await this.findOne(assignmentId);

    const submission = this.submissionRepository.create({
      assignmentId,
      studentId: dto.studentId,
      submissionFileUrl: dto.submissionFileUrl,
      submissionText: dto.submissionText,
    });
    return this.submissionRepository.save(submission);
  }

  async findSubmission(id: number): Promise<AssignmentSubmission> {
    const submission = await this.submissionRepository.findOneBy({ id });
    if (!submission) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }
    return submission;
  }

  /**
   * Allows a lecturer to grade a student's submission.
   * Stores the grade and feedback on the submission record.
   */
  async gradeSubmission(
    submissionId: number,
    dto: GradeSubmissionDto,
  ): Promise<AssignmentSubmission> {
    // Find the submission first — throws 404 if not found
    const submission = await this.findSubmission(submissionId);
    // Apply the grade and feedback fields
    await this.submissionRepository.update(submissionId, {
      grade: dto.grade,
      feedback: dto.feedback,
    });
    return this.findSubmission(submissionId);
  }
}
