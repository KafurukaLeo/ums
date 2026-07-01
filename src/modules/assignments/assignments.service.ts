/**
 * Module components file: assignments.service.ts.
 */
import { NotFoundException } from '../../common/exceptions/http.exception';
import { AppDataSource } from '../../database/connection';
import { Assignment } from './entities/assignment.entity';
import { AssignmentSubmission } from './entities/assignment-submission.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';

/**
 * Assignments Service class.
 * Handles database operations for:
 * - Assignment creations and configurations
 * - Student assignment submission processes
 * - Lecturer grading activities
 */
export class AssignmentsService {
  
  /**
   * Helper getter to resolve TypeORM repository for Assignment Entity.
   */
  private get assignmentRepository() {
    return AppDataSource.getRepository(Assignment);
  }

  /**
   * Helper getter to resolve TypeORM repository for AssignmentSubmission Entity.
   */
  private get submissionRepository() {
    return AppDataSource.getRepository(AssignmentSubmission);
  }

  /**
   * Fetch all assignment records.
   */
  findAll(): Promise<Assignment[]> {
    return this.assignmentRepository.find({ order: { createdAt: 'DESC' } });
  }

  /**
   * Fetch all assignments published for a specific course.
   */
  findByCourse(courseId: number): Promise<Assignment[]> {
    return this.assignmentRepository.find({
      where: { courseId },
      order: { dueDate: 'ASC' },
    });
  }

  /**
   * Fetch a single assignment record by ID.
   */
  async findOne(id: number): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findOneBy({ id });
    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }
    return assignment;
  }

  /**
   * Create and publish a new assignment for a course.
   * Parses due date string into a Date object.
   */
  create(dto: CreateAssignmentDto): Promise<Assignment> {
    const assignment = this.assignmentRepository.create({
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    });
    return this.assignmentRepository.save(assignment);
  }

  /**
   * Update details of an existing assignment by ID.
   */
  async update(id: number, dto: UpdateAssignmentDto): Promise<Assignment> {
    const updateData: any = { ...dto };
    if (dto.dueDate) {
      updateData.dueDate = new Date(dto.dueDate);
    }
    await this.assignmentRepository.update(id, updateData);
    return this.findOne(id);
  }

  /**
   * Delete an assignment.
   */
  async remove(id: number): Promise<void> {
    const result = await this.assignmentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }
  }

  /**
   * Fetch all submissions for a specific assignment.
   */
  getSubmissions(assignmentId: number): Promise<AssignmentSubmission[]> {
    return this.submissionRepository.find({
      where: { assignmentId },
      order: { submittedAt: 'DESC' },
    });
  }

  /**
   * Fetch all submissions posted by a specific student.
   */
  getStudentSubmissions(studentId: number): Promise<AssignmentSubmission[]> {
    return this.submissionRepository.find({
      where: { studentId },
      order: { submittedAt: 'DESC' },
    });
  }

  /**
   * Submit/Record a student's assignment response.
   */
  async submitAssignment(
    assignmentId: number,
    dto: SubmitAssignmentDto,
  ): Promise<AssignmentSubmission> {
    await this.findOne(assignmentId);

    const submission = this.submissionRepository.create({
      assignmentId,
      studentId: dto.studentId,
      submissionFileUrl: dto.submissionFileUrl,
      submissionText: dto.submissionText,
    });
    return this.submissionRepository.save(submission);
  }

  /**
   * Fetch a single assignment submission by ID.
   */
  async findSubmission(id: number): Promise<AssignmentSubmission> {
    const submission = await this.submissionRepository.findOneBy({ id });
    if (!submission) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }
    return submission;
  }

  /**
   * Grade an assignment submission and assign feedback comments.
   */
  async gradeSubmission(
    submissionId: number,
    dto: GradeSubmissionDto,
  ): Promise<AssignmentSubmission> {
    const submission = await this.findSubmission(submissionId);
    await this.submissionRepository.update(submissionId, {
      grade: dto.grade,
      feedback: dto.feedback,
    });
    return this.findSubmission(submissionId);
  }
}

// Export singleton instance of AssignmentsService
export const assignmentsService = new AssignmentsService();
